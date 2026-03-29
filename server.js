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

// ── helpers ──────────────────────────────────────────────────────────────────

function signalToBars(signal) {
  if (signal >= 75) return 4
  if (signal >= 50) return 3
  if (signal >= 25) return 2
  return 1
}

/**
 * Parse nmcli terse output:
 *   nmcli -t -f IN-USE,SSID,SIGNAL,SECURITY dev wifi list
 * Each line: *:MyNet:85:WPA2  or  :OtherNet:62:--
 */
function parseNmcliList(stdout) {
  const networks = []
  const seen = new Set()

  for (const raw of stdout.split('\n')) {
    const line = raw.trim()
    if (!line) continue

    // nmcli escapes colons as \:  — split on unescaped colons
    const parts = line.split(/(?<!\\):/)
    if (parts.length < 4) continue

    const inUse    = parts[0].trim() === '*'
    const ssid     = parts[1].replace(/\\:/g, ':').trim()
    const signal   = parseInt(parts[2]) || 0
    const security = parts[3].trim()

    if (!ssid || seen.has(ssid)) continue
    seen.add(ssid)

    networks.push({
      ssid,
      signal,
      bars:    signalToBars(signal),
      secured: security !== '--' && security !== '',
      connected: inUse,
    })
  }

  // Sort: connected first, then by signal desc
  return networks.sort((a, b) => {
    if (a.connected !== b.connected) return a.connected ? -1 : 1
    return b.signal - a.signal
  })
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

/** GET /wifi/scan — list visible networks */
app.get('/wifi/scan', async (req, res) => {
  try {
    const { stdout } = await execAsync(
      'nmcli -t -f IN-USE,SSID,SIGNAL,SECURITY dev wifi list --rescan yes',
      { timeout: 15000 }
    )
    res.json({ ok: true, networks: parseNmcliList(stdout) })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

/** GET /wifi/status — currently connected SSID */
app.get('/wifi/status', async (req, res) => {
  try {
    const { stdout } = await execAsync(
      "nmcli -t -f ACTIVE,SSID dev wifi | grep '^yes' | head -1",
      { timeout: 5000 }
    )
    const ssid = stdout.trim().split(':')[1]?.replace(/\\:/g, ':') ?? ''
    res.json({ ok: true, ssid })
  } catch {
    res.json({ ok: true, ssid: '' })
  }
})

/** POST /wifi/connect — { ssid, password? } */
app.post('/wifi/connect', async (req, res) => {
  const { ssid, password } = req.body ?? {}
  if (!ssid) return res.status(400).json({ ok: false, error: 'ssid required' })

  const safe = ssid.replace(/"/g, '\\"')
  const cmd  = password
    ? `nmcli dev wifi connect "${safe}" password "${password.replace(/"/g, '\\"')}"`
    : `nmcli dev wifi connect "${safe}"`

  try {
    await execAsync(cmd, { timeout: 20000 })
    res.json({ ok: true })
  } catch (err) {
    const msg = err.stderr || err.message || 'Connection failed'
    res.status(200).json({ ok: false, error: msg })
  }
})

/** GET /wifi/disconnect */
app.post('/wifi/disconnect', async (_req, res) => {
  try {
    await execAsync('nmcli dev disconnect wlan0', { timeout: 8000 })
    res.json({ ok: true })
  } catch (err) {
    res.status(200).json({ ok: false, error: err.message })
  }
})

/** GET /battery — real readings from Suptronics X1203 INA219 */
app.get('/battery', async (_req, res) => {
  const now = Date.now()
  // Return cache if < 10 s old (avoids hammering I2C on repeated polls)
  if (_batteryCache && now - _batteryCacheAt < 10_000) {
    return res.json(_batteryCache)
  }
  try {
    const data = await readINA219()
    _batteryCache   = data
    _batteryCacheAt = now
    res.json(data)
  } catch (err) {
    // I2C not available (dev machine) or wrong address — return descriptive error
    res.status(200).json({
      ok: false,
      error: err.message,
      hint: 'Check I2C enabled (raspi-config) and INA219_ADDR matches i2cdetect output',
    })
  }
})

// ── start ────────────────────────────────────────────────────────────────────

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[PayTraq WiFi] sidecar running on http://127.0.0.1:${PORT}`)
})
