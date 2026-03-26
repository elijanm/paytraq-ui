import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CircleDollarSign, Waves, Wind, Droplets, ShoppingBag, Sprout } from 'lucide-react'
import { useAdminStore } from '../../store/adminStore'

const TABS = [
  { key: 'pool',    label: 'Pool',    icon: CircleDollarSign, accent: '#b48aff' },
  { key: 'washing', label: 'Washing', icon: Wind,             accent: '#38d4ff' },
  { key: 'liquid',  label: 'Liquid',  icon: Droplets,         accent: '#ff9044' },
  { key: 'vending', label: 'Vending', icon: ShoppingBag,      accent: '#00e5a0' },
  { key: 'soil',    label: 'Soil',    icon: Sprout,           accent: '#4ade80' },
] as const
type Tab = typeof TABS[number]['key']

function Field({
  label, hint, value, min, max, step, unit, accent,
  onChange,
}: {
  label: string; hint: string; value: number; min: number; max: number; step: number
  unit: string; accent: string; onChange: (v: number) => void
}) {
  return (
    <div style={{ borderRadius: 10, padding: '10px 12px', background: '#0a0d14', border: `1px solid ${accent}20` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, color: 'var(--text)' }}>{label}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#5a6a90', marginTop: 2 }}>{hint}</div>
        </div>
        <div style={{ padding: '4px 10px', borderRadius: 8, background: accent + '18', border: `1px solid ${accent}30` }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: accent }}>{value}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: accent + '99', marginLeft: 3 }}>{unit}</span>
        </div>
      </div>
      {/* Slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <motion.button whileTap={{ scale: 0.85 }}
          onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))}
          style={{ width: 24, height: 24, borderRadius: 7, background: 'var(--surface-2)', border: `1px solid ${accent}30`,
            color: accent, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>−</motion.button>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: '#1e2333', position: 'relative', cursor: 'pointer' }}
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect()
            const pct  = (e.clientX - rect.left) / rect.width
            const raw  = min + pct * (max - min)
            onChange(Math.round(raw / step) * step)
          }}
        >
          <motion.div animate={{ width: `${((value - min) / (max - min)) * 100}%` }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${accent}88, ${accent})`, borderRadius: 2 }} />
        </div>
        <motion.button whileTap={{ scale: 0.85 }}
          onClick={() => onChange(Math.min(max, +(value + step).toFixed(2)))}
          style={{ width: 24, height: 24, borderRadius: 7, background: 'var(--surface-2)', border: `1px solid ${accent}30`,
            color: accent, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>+</motion.button>
      </div>
    </div>
  )
}

export default function AppSettings() {
  const [tab, setTab] = useState<Tab>('pool')
  const { appSettings, updateAppSettings } = useAdminStore()

  const current = TABS.find(t => t.key === tab)!

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 10, padding: '10px 14px', overflow: 'hidden' }}>

      <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--text)', letterSpacing: '0.05em', flexShrink: 0 }}>PER-APP SETTINGS</div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {TABS.map(t => {
          const Icon = t.icon
          const sel  = tab === t.key
          return (
            <motion.button key={t.key} onClick={() => setTab(t.key)} whileTap={{ scale: 0.95 }}
              animate={{ background: sel ? t.accent + '18' : 'var(--surface)', borderColor: sel ? t.accent + '50' : '#1e2333' }}
              style={{ flex: 1, padding: '7px 4px', borderRadius: 10, border: '1px solid', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <Icon size={14} color={sel ? t.accent : '#5a6a90'} strokeWidth={1.5} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: sel ? t.accent : '#5a6a90' }}>{t.label}</span>
            </motion.button>
          )
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.18 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}
        >
          {tab === 'pool' && (
            <>
              <Field label="Price per Game" hint="Amount charged per billiard game session"
                value={appSettings.poolPricePerGame} min={10} max={500} step={10} unit="KES" accent={current.accent}
                onChange={v => updateAppSettings({ poolPricePerGame: v })} />
            </>
          )}

          {tab === 'washing' && (
            <>
              <Field label="Washer Rate" hint="Minutes of washing time per 1 KES paid"
                value={appSettings.washerRate} min={0.1} max={2.0} step={0.05} unit="min/KES" accent={current.accent}
                onChange={v => updateAppSettings({ washerRate: v })} />
              <Field label="Dryer Rate" hint="Minutes of drying time per 1 KES paid"
                value={appSettings.dryerRate} min={0.1} max={2.0} step={0.05} unit="min/KES" accent={current.accent}
                onChange={v => updateAppSettings({ dryerRate: v })} />
            </>
          )}

          {tab === 'liquid' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pricing (KES per 100 ml)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {(['Water', 'Cooking Oil', 'Juice', 'Milk'] as const).map(liq => (
                  <Field key={liq} label={liq} hint="KES per 100ml dispensed"
                    value={appSettings.liquidPrices[liq]} min={1} max={50} step={1} unit="KES/100ml" accent={current.accent}
                    onChange={v => updateAppSettings({ liquidPrices: { ...appSettings.liquidPrices, [liq]: v } })} />
                ))}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Flow Rate (ml / second)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {(['Water', 'Cooking Oil', 'Juice', 'Milk'] as const).map(liq => (
                  <Field key={liq + '_flow'} label={liq} hint="Dispense speed — affects duration"
                    value={appSettings.liquidFlowRates[liq]} min={5} max={250} step={5} unit="ml/s" accent="#38d4ff"
                    onChange={v => updateAppSettings({ liquidFlowRates: { ...appSettings.liquidFlowRates, [liq]: v } })} />
                ))}
              </div>
            </div>
          )}

          {tab === 'vending' && (
            <>
              <Field label="Tax Rate" hint="Percentage added on top of item price"
                value={appSettings.vendingTaxRate} min={0} max={30} step={1} unit="%" accent={current.accent}
                onChange={v => updateAppSettings({ vendingTaxRate: v })} />
            </>
          )}

          {tab === 'soil' && (
            <>
              <Field label="Subscription Price" hint="Monthly access fee for Soil Analytics portal"
                value={appSettings.soilSubscriptionPrice} min={100} max={5000} step={100} unit="KES/mo" accent={current.accent}
                onChange={v => updateAppSettings({ soilSubscriptionPrice: v })} />
            </>
          )}

          {/* Info badge */}
          <div style={{ borderRadius: 10, padding: '10px 12px', background: current.accent + '08',
            border: `1px solid ${current.accent}20`, marginTop: 'auto' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: current.accent + 'aa', lineHeight: 1.6 }}>
              Changes take effect immediately. New rates apply to the next transaction only.
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
