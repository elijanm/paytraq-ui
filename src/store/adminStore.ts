import { create } from 'zustand'

// ── Types ──────────────────────────────────────────────────────────────────
export interface Transaction {
  id: string
  app: string
  amount: number      // KES
  phone: string
  timestamp: Date
  status: 'success' | 'failed'
}

export interface AppSettings {
  poolPricePerGame: number       // KES
  washerRate: number             // minutes per KES
  dryerRate: number              // minutes per KES
  liquidPrices: { Water: number; Juice: number; Milk: number; Other: number }  // KES per 100ml
  vendingTaxRate: number         // percent 0-100
  soilSubscriptionPrice: number  // KES per month
}

interface AdminState {
  isLoggedIn: boolean
  visibleApps: string[]       // app names shown on home grid
  singleAppMode: boolean
  singleApp: string | null    // route path when single-app mode
  appSettings: AppSettings
  timezone: string
  idleTimeout: number         // seconds
  transactions: Transaction[]

  login: () => void
  logout: () => void
  setVisibleApps: (apps: string[]) => void
  toggleApp: (name: string) => void
  setSingleAppMode: (enabled: boolean) => void
  setSingleApp: (route: string | null) => void
  updateAppSettings: (patch: Partial<AppSettings>) => void
  setTimezone: (tz: string) => void
  setIdleTimeout: (sec: number) => void
}

// ── Deterministic transaction generation ──────────────────────────────────
const s = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5; return x - Math.floor(x) }

const APPS   = ['Vending', 'WashingMachine', 'PoolTable', 'LiquidDispenser']
const LABELS: Record<string, string> = {
  Vending: 'Vending', WashingMachine: 'Washing', PoolTable: 'Pool', LiquidDispenser: 'Liquid'
}
const AMOUNTS: Record<string, number[]> = {
  Vending:        [45, 90, 135, 60, 200, 55, 80],
  WashingMachine: [100, 150, 200, 50, 250],
  PoolTable:      [50, 100, 150, 200],
  LiquidDispenser:[20, 40, 60, 100, 30],
}

function generateTransactions(): Transaction[] {
  const txs: Transaction[] = []
  const now = new Date()
  let seed = 0

  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo)
    const count = 3 + Math.floor(s(seed++) * 6)  // 3–8 per day

    for (let i = 0; i < count; i++) {
      const app    = APPS[Math.floor(s(seed) * APPS.length)]
      const amts   = AMOUNTS[app]
      const amount = amts[Math.floor(s(seed + 1) * amts.length)]
      const hour   = 8 + Math.floor(s(seed + 2) * 12)
      const min    = Math.floor(s(seed + 3) * 60)
      const ph     = 700000000 + Math.floor(s(seed + 4) * 99999999)

      txs.push({
        id:        `TX${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}${i}`,
        app,
        amount,
        phone:     `+254${ph}`,
        timestamp: new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, min),
        status:    s(seed + 5) < 0.08 ? 'failed' : 'success',
      })
      seed += 6
    }
  }

  return txs.reverse()   // newest first
}

// ── Store ──────────────────────────────────────────────────────────────────
export const useAdminStore = create<AdminState>()(set => ({
  isLoggedIn: false,
  visibleApps: ['Vending', 'WashingMachine', 'PoolTable', 'LiquidDispenser', 'WarehouseWeight', 'SoilAnalytics', 'Addons', 'Support'],
  singleAppMode: false,
  singleApp: null,
  appSettings: {
    poolPricePerGame:       50,
    washerRate:             0.45,
    dryerRate:              0.35,
    liquidPrices:           { Water: 2, Juice: 8, Milk: 6, Other: 4 },
    vendingTaxRate:         0,
    soilSubscriptionPrice:  500,
  },
  timezone:    'Africa/Nairobi',
  idleTimeout: 90,
  transactions: generateTransactions(),

  login:            () => set({ isLoggedIn: true }),
  logout:           () => set({ isLoggedIn: false }),
  setVisibleApps:   (apps)    => set({ visibleApps: apps }),
  toggleApp:        (name)    => set(s => ({
    visibleApps: s.visibleApps.includes(name)
      ? s.visibleApps.filter(a => a !== name)
      : [...s.visibleApps, name],
  })),
  setSingleAppMode: (enabled) => set({ singleAppMode: enabled }),
  setSingleApp:     (route)   => set({ singleApp: route }),
  updateAppSettings:(patch)   => set(s => ({ appSettings: { ...s.appSettings, ...patch } })),
  setTimezone:      (tz)      => set({ timezone: tz }),
  setIdleTimeout:   (sec)     => set({ idleTimeout: sec }),
}))

export const APP_LABELS: Record<string, string> = {
  Vending: 'Vending', WashingMachine: 'Washing', PoolTable: 'Pool Table',
  LiquidDispenser: 'Liquid', WarehouseWeight: 'Warehouse', SoilAnalytics: 'Soil Data',
  Addons: 'Addons', Support: 'Support',
}
export const APP_ROUTES: Record<string, string> = {
  Vending: '/vending', WashingMachine: '/washing', PoolTable: '/pool',
  LiquidDispenser: '/liquid', WarehouseWeight: '/warehouse', SoilAnalytics: '/soil',
  Addons: '/addons', Support: '/support',
}
export const TX_LABELS = LABELS
