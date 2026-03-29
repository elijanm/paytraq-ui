/**
 * PayTraq Sidecar — server.js
 * Runs on Raspberry Pi alongside the kiosk.
 * Exposes nmcli (WiFi) and INA219 I2C (battery) via HTTP.
 *
 * Start: node server.js
 * Requires:
 *   WiFi  — NetworkManager (nmcli)
 *   Battery — Suptronics X1203 UPS Shield (INA219 @ I2C bus 1)
 *             Enable I2C: sudo raspi-config → Interfaces → I2C → Enable
 */

import express from 'express'
import cors from 'cors'
import { exec } from 'child_process'
import { promisify } from 'util'
// i2c-bus is a native module — only available on Linux/Pi.
// We import it lazily inside the battery route so a missing binding
// doesn't crash the whole server (WiFi still works on dev machines).
let i2c = null
try { i2c = (await import('i2c-bus')).default } catch { /* not on Pi */ }

const execAsync = promisify(exec)
const app  = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// No pre-detection — each WiFi helper tries nmcli first, falls back to
// iwlist/wpa_cli on any "command not found" error.

// ── Shared helpers ────────────────────────────────────────────────────────────

function signalToBars(signal) {   // signal = 0-100 quality %
  if (signal >= 75) return 4
  if (signal >= 50) return 3
  if (signal >= 25) return 2
  return 1
}

function dBmToQuality(dbm) {      // iwlist gives dBm, convert to 0-100
  return Math.min(100, Math.max(0, 2 * (dbm + 100)))
}

// ── nmcli backend ─────────────────────────────────────────────────────────────

function parseNmcliList(stdout) {
  const networks = []
  const seen = new Set()
  for (const raw of stdout.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    const parts = line.split(/(?<!\\):/)
    if (parts.length < 4) continue
    const inUse    = parts[0].trim() === '*'
    const ssid     = parts[1].replace(/\\:/g, ':').trim()
    const signal   = parseInt(parts[2]) || 0
    const security = parts[3].trim()
    if (!ssid || seen.has(ssid)) continue
    seen.add(ssid)
    networks.push({ ssid, signal, bars: signalToBars(signal),
      secured: security !== '--' && security !== '', connected: inUse })
  }
  return networks.sort((a, b) => {
    if (a.connected !== b.connected) return a.connected ? -1 : 1
    return b.signal - a.signal
  })
}

async function nmcliScan() {
  const { stdout } = await execAsync(
    'nmcli -t -f IN-USE,SSID,SIGNAL,SECURITY dev wifi list --rescan yes',
    { timeout: 15000 }
  )
  return parseNmcliList(stdout)
}

async function nmcliStatus() {
  const { stdout } = await execAsync(
    "nmcli -t -f ACTIVE,SSID dev wifi | grep '^yes' | head -1",
    { timeout: 5000 }
  )
  return stdout.trim().split(':')[1]?.replace(/\\:/g, ':') ?? ''
}

async function nmcliConnect(ssid, password) {
  const s = ssid.replace(/"/g, '\\"')
  const cmd = password
    ? `nmcli dev wifi connect "${s}" password "${password.replace(/"/g, '\\"')}"`
    : `nmcli dev wifi connect "${s}"`
  await execAsync(cmd, { timeout: 20000 })
}

// ── iwlist + wpa_cli backend ──────────────────────────────────────────────────

/**
 * Detect the wireless interface name.
 * /proc/net/wireless is the most reliable source across all Pi kernel versions.
 */
let _wlanIface = null
async function wlanIface() {
  if (_wlanIface) return _wlanIface

  // Strategy 1: /proc/net/wireless — lists active wireless interfaces on all Linux
  try {
    const { stdout } = await execAsync('cat /proc/net/wireless 2>/dev/null', { timeout: 2000 })
    // Lines after the 2-line header look like: "  wlan0: 0000  70. ..."
    const match = stdout.match(/^\s*(\w+):/m)
    if (match) return (_wlanIface = match[1])
  } catch {}

  // Strategy 2: iwconfig output
  try {
    const { stdout } = await execAsync('iwconfig 2>/dev/null', { timeout: 3000 })
    const match = stdout.match(/^(\w+)\s+IEEE/m)
    if (match) return (_wlanIface = match[1])
  } catch {}

  // Strategy 3: ip link — any wlan* or wlp* interface
  try {
    const { stdout } = await execAsync('ip link show 2>/dev/null', { timeout: 3000 })
    const match = stdout.match(/\d+:\s+(wl\w+):/m)
    if (match) return (_wlanIface = match[1])
  } catch {}

  return (_wlanIface = 'wlan0')
}

function parseIwlist(stdout, connectedSsid) {
  const networks = []
  const seen     = new Set()
  const cells    = stdout.split(/Cell \d+ - /)

  for (const cell of cells) {
    const ssidM  = cell.match(/ESSID:"([^"]*)"/)
    const sigM   = cell.match(/Signal level=(-?\d+) dBm/)
    const encM   = cell.match(/Encryption key:(on|off)/)
    if (!ssidM || !sigM) continue
    const ssid = ssidM[1].trim()
    if (!ssid || seen.has(ssid)) continue
    seen.add(ssid)
    const dbm     = parseInt(sigM[1])
    const signal  = dBmToQuality(dbm)
    const secured = encM?.[1] === 'on'
    networks.push({ ssid, signal, bars: signalToBars(signal),
      secured, connected: ssid === connectedSsid })
  }
  return networks.sort((a, b) => {
    if (a.connected !== b.connected) return a.connected ? -1 : 1
    return b.signal - a.signal
  })
}

async function iwlistStatus() {
  try {
    const iface = await wlanIface()
    const { stdout } = await execAsync(
      `iwgetid -r 2>/dev/null || iwconfig ${iface} 2>/dev/null | grep -oP 'ESSID:"\\K[^"]+'`,
      { timeout: 4000 }
    )
    return stdout.trim()
  } catch { return '' }
}

async function iwlistScan() {
  const iface = await wlanIface()
  const connected = await iwlistStatus()

  // Try without sudo first — works on most Pi setups
  try {
    const { stdout } = await execAsync(`iwlist ${iface} scan 2>&1`, { timeout: 15000 })
    if (/Scan completed|ESSID/i.test(stdout)) return parseIwlist(stdout, connected)
  } catch {}

  // Fall back to sudo — requires NOPASSWD rule in sudoers (see README)
  const { stdout } = await execAsync(`sudo iwlist ${iface} scan 2>&1`, { timeout: 15000 })
  return parseIwlist(stdout, connected)
}

async function wpaConnect(ssid, password) {
  const iface = await wlanIface()
  const s = ssid.replace(/'/g, "'\\''")
  const p = (password ?? '').replace(/'/g, "'\\''")

  const { stdout: idOut } = await execAsync(`wpa_cli -i ${iface} add_network`, { timeout: 5000 })
  const netId = idOut.trim().split('\n').pop().trim()

  await execAsync(`wpa_cli -i ${iface} set_network ${netId} ssid '"${s}"'`, { timeout: 5000 })

  if (password) {
    await execAsync(`wpa_cli -i ${iface} set_network ${netId} psk '"${p}"'`, { timeout: 5000 })
  } else {
    await execAsync(`wpa_cli -i ${iface} set_network ${netId} key_mgmt NONE`, { timeout: 5000 })
  }

  await execAsync(`wpa_cli -i ${iface} enable_network ${netId}`, { timeout: 5000 })
  await execAsync(`wpa_cli -i ${iface} save_config`, { timeout: 5000 })
  await execAsync(`wpa_cli -i ${iface} reconnect`, { timeout: 5000 })
}

// ── INA219 battery reader (Suptronics X1203) ─────────────────────────────────
//
// The X1203 uses an INA219 current/voltage sensor on I2C bus 1.
// Address 0x41 is the default for Suptronics X120x boards (A0=VCC, A1=GND).
// Run `sudo i2cdetect -y 1` on the Pi to confirm the address if readings fail.
//
// INA219 registers
const INA219_ADDR    = 0x41   // change to 0x40 / 0x42 / 0x43 if needed
const REG_CONFIG     = 0x00
const REG_SHUNT_V    = 0x01   // signed 16-bit, 10 µV/LSB
const REG_BUS_V      = 0x02   // bits[15:3] × 4 mV = bus voltage
const REG_CURRENT    = 0x04   // signed 16-bit, LSB = 0.1 mA (after calibration)
const REG_CALIB      = 0x05

// Config: 32 V FSR, PGA÷8 (±320 mV shunt range), 12-bit ADC, continuous
const CONFIG_VALUE   = 0x3FFF
// Calibration for 0.1 Ω shunt, 100 µA/LSB: Cal = 0.04096 / (100e-6 × 0.1) = 4096
const CALIB_VALUE    = 0x1000  // → current LSB = 0.1 mA, power LSB = 2 mW

/**
 * LiPo 3.7 V nominal discharge curve → state-of-charge %.
 * Adjust breakpoints if your cell chemistry differs.
 */
function voltageToPercent(v) {
  if (v >= 4.20) return 100
  if (v >= 4.00) return Math.round(85 + (v - 4.00) / 0.20 * 15)
  if (v >= 3.80) return Math.round(60 + (v - 3.80) / 0.20 * 25)
  if (v >= 3.60) return Math.round(30 + (v - 3.60) / 0.20 * 30)
  if (v >= 3.40) return Math.round( 5 + (v - 3.40) / 0.20 * 25)
  if (v >= 3.20) return Math.round(     (v - 3.20) / 0.20 *  5)
  return 0
}

async function readINA219() {
  if (!i2c) throw new Error('i2c-bus not available on this platform')
  const bus = await i2c.openPromisified(1)
  try {
    // Write configuration
    const cfgBuf = Buffer.alloc(2)
    cfgBuf.writeUInt16BE(CONFIG_VALUE)
    await bus.writeI2cBlock(INA219_ADDR, REG_CONFIG, 2, cfgBuf)

    // Write calibration so CURRENT register is populated
    const calBuf = Buffer.alloc(2)
    calBuf.writeUInt16BE(CALIB_VALUE)
    await bus.writeI2cBlock(INA219_ADDR, REG_CALIB, 2, calBuf)

    // Give ADC one conversion cycle (~600 µs at 12-bit)
    await new Promise(r => setTimeout(r, 5))

    // Read bus voltage — battery terminal voltage
    const bvBuf = Buffer.alloc(2)
    await bus.readI2cBlock(INA219_ADDR, REG_BUS_V, 2, bvBuf)
    const bvRaw  = bvBuf.readUInt16BE(0)
    const voltage = ((bvRaw >> 3) * 4) / 1000   // mV → V

    // Read shunt voltage — sign tells us charge vs discharge direction
    const svBuf = Buffer.alloc(2)
    await bus.readI2cBlock(INA219_ADDR, REG_SHUNT_V, 2, svBuf)
    const svRaw    = svBuf.readInt16BE(0)         // signed
    const shuntMV  = svRaw * 0.01                 // 10 µV/LSB → mV

    // Read current (requires calibration register set above)
    const ciBuf = Buffer.alloc(2)
    await bus.readI2cBlock(INA219_ADDR, REG_CURRENT, 2, ciBuf)
    const ciRaw   = ciBuf.readInt16BE(0)          // signed
    const currentMA = ciRaw * 0.1                 // 0.1 mA/LSB

    // Charging = current flowing INTO battery (positive shunt voltage on X1203)
    const charging = shuntMV > 5 || currentMA > 20

    return {
      ok: true,
      voltage:    Math.round(voltage  * 100) / 100,  // V, 2 dp
      currentMA:  Math.round(currentMA),              // mA
      percent:    voltageToPercent(voltage),
      charging,
    }
  } finally {
    await bus.close()
  }
}

// Cache last good reading so rapid polls don't hammer I2C
let _batteryCache = null
let _batteryCacheAt = 0

// ── routes ───────────────────────────────────────────────────────────────────

const isMissing = (e) => /not found|No such file|ENOENT/i.test(e.message)

/** GET /wifi/scan */
app.get('/wifi/scan', async (_req, res) => {
  try {
    return res.json({ ok: true, tool: 'nmcli', networks: await nmcliScan() })
  } catch (e1) {
    if (!isMissing(e1)) return res.status(500).json({ ok: false, error: e1.message })
  }
  try {
    return res.json({ ok: true, tool: 'iwlist', networks: await iwlistScan() })
  } catch (e2) {
    res.status(500).json({ ok: false, error: isMissing(e2)
      ? 'No WiFi tool found. Run: sudo apt install wireless-tools'
      : e2.message })
  }
})

/** GET /wifi/status */
app.get('/wifi/status', async (_req, res) => {
  try {
    return res.json({ ok: true, ssid: await nmcliStatus() })
  } catch (e) {
    if (!isMissing(e)) return res.json({ ok: true, ssid: '' })
  }
  try {
    return res.json({ ok: true, ssid: await iwlistStatus() })
  } catch {
    res.json({ ok: true, ssid: '' })
  }
})

/** POST /wifi/connect — { ssid, password? } */
app.post('/wifi/connect', async (req, res) => {
  const { ssid, password } = req.body ?? {}
  if (!ssid) return res.status(400).json({ ok: false, error: 'ssid required' })
  try {
    await nmcliConnect(ssid, password)
    return res.json({ ok: true })
  } catch (e1) {
    if (!isMissing(e1)) return res.json({ ok: false, error: e1.stderr ?? e1.message })
  }
  try {
    await wpaConnect(ssid, password)
    return res.json({ ok: true })
  } catch (e2) {
    res.json({ ok: false, error: e2.stderr ?? e2.message })
  }
})

/** POST /wifi/disconnect */
app.post('/wifi/disconnect', async (_req, res) => {
  try {
    await execAsync('nmcli dev disconnect wlan0', { timeout: 8000 })
    return res.json({ ok: true })
  } catch (e) {
    if (!isMissing(e)) return res.json({ ok: false, error: e.message })
  }
  try {
    await execAsync(`wpa_cli -i ${await wlanIface()} disconnect`, { timeout: 8000 })
    res.json({ ok: true })
  } catch (e) {
    res.json({ ok: false, error: e.message })
  }
})

/** GET /debug — show detected interface + tool availability */
app.get('/debug', async (_req, res) => {
  const iface = await wlanIface()
  const [iwcfg, iplink, sysnet] = await Promise.all([
    execAsync('iwconfig 2>/dev/null').then(r => r.stdout.split('\n').slice(0,4).join(' ')).catch(e => e.message),
    execAsync('ip link show 2>/dev/null').then(r => r.stdout.slice(0,200)).catch(e => e.message),
    execAsync('ls /sys/class/net 2>/dev/null').then(r => r.stdout.trim()).catch(e => e.message),
  ])
  res.json({ detectedIface: iface, iwconfig: iwcfg, iplink: iplink.slice(0,300), sysnet })
})

/** GET /battery — real readings from Suptronics X1203
 *  Tries INA219 via I2C first. If no I2C devices found, reads GPIO pins instead.
 *  Set BATTERY_GPIO_PIN below once you identify the pin from `gpio readall`.
 */
const BATTERY_GPIO_PIN = null  // e.g. 4 — set after running: gpio readall

app.get('/battery', async (_req, res) => {
  // No I2C available — try GPIO pin if configured
  if (!i2c) {
    if (BATTERY_GPIO_PIN !== null) {
      try {
        const { stdout } = await execAsync(`gpio read ${BATTERY_GPIO_PIN}`, { timeout: 2000 })
        const onBattery = stdout.trim() === '1'
        return res.json({ ok: true, source: 'gpio', charging: !onBattery,
          percent: null, voltage: null,
          note: 'GPIO pin only — percent/voltage unavailable without I2C' })
      } catch (e) {
        return res.json({ ok: false, error: e.message })
      }
    }
    return res.json({ ok: false, source: 'none',
      error: 'X1203 has no I2C interface. Set BATTERY_GPIO_PIN in server.js once you identify the signal pin (run: gpio readall).' })
  }

  const now = Date.now()
  if (_batteryCache && now - _batteryCacheAt < 10_000) return res.json(_batteryCache)
  try {
    const data = await readINA219()
    _batteryCache   = data
    _batteryCacheAt = now
    res.json(data)
  } catch (err) {
    res.status(200).json({ ok: false, error: err.message })
  }
})

// ── start ────────────────────────────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[PayTraq WiFi] sidecar running on http://0.0.0.0:${PORT}`)
})
