import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, Activity, CheckCircle } from 'lucide-react'
import { useAdminStore, TX_LABELS } from '../../store/adminStore'

type Filter = 'today' | '7d' | '30d'

const FILTER_DAYS: Record<Filter, number> = { today: 1, '7d': 7, '30d': 30 }

const APP_COLORS: Record<string, string> = {
  Vending: '#00e5a0', WashingMachine: '#38d4ff', PoolTable: '#b48aff', LiquidDispenser: '#ff9044',
}

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)
}

export default function Analytics() {
  const [filter, setFilter] = useState<Filter>('7d')
  const txs = useAdminStore(s => s.transactions)

  const { filtered, byDay, byApp, totalRevenue, totalCount, successRate } = useMemo(() => {
    const now  = new Date()
    const days = FILTER_DAYS[filter]
    const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days + 1)

    const filtered = txs.filter(t => t.timestamp >= cutoff)
    const success  = filtered.filter(t => t.status === 'success')

    const totalRevenue = success.reduce((s, t) => s + t.amount, 0)
    const totalCount   = filtered.length
    const successRate  = totalCount > 0 ? Math.round(success.length / totalCount * 100) : 0

    // By day (last 7 days for chart, or today grouped by hour)
    const chartDays = Math.min(days, 7)
    const byDay: { label: string; revenue: number }[] = []
    for (let i = chartDays - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      const dayTxs = success.filter(t =>
        t.timestamp.getFullYear() === d.getFullYear() &&
        t.timestamp.getMonth()    === d.getMonth() &&
        t.timestamp.getDate()     === d.getDate()
      )
      const label = filter === 'today'
        ? d.toLocaleDateString('en', { weekday: 'short', day: 'numeric' })
        : d.toLocaleDateString('en', { weekday: 'short' })
      byDay.push({ label, revenue: dayTxs.reduce((s, t) => s + t.amount, 0) })
    }

    // By app
    const byApp: Record<string, number> = {}
    for (const t of success) byApp[t.app] = (byApp[t.app] || 0) + t.amount

    return { filtered, byDay, byApp, totalRevenue, totalCount, successRate }
  }, [txs, filter])

  const maxDay = Math.max(...byDay.map(d => d.revenue), 1)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 10, padding: '10px 14px', overflow: 'hidden' }}>

      {/* Filter row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--text)', letterSpacing: '0.05em' }}>REVENUE ANALYTICS</div>
        <div style={{ display: 'flex', gap: 4, padding: '3px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {(['today','7d','30d'] as Filter[]).map(f => (
            <motion.button key={f} onClick={() => setFilter(f)}
              animate={{ background: filter === f ? '#00e5a020' : 'transparent', color: filter === f ? '#00e5a0' : '#5a6a90' }}
              style={{ padding: '4px 10px', borderRadius: 7, border: filter === f ? '1px solid #00e5a040' : '1px solid transparent',
                cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, letterSpacing: '0.04em' }}>
              {f === 'today' ? 'Today' : f === '7d' ? '7 Days' : '30 Days'}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, flexShrink: 0 }}>
        {[
          { label: 'Total Revenue', value: `KES ${fmt(totalRevenue)}`, icon: <DollarSign size={13} strokeWidth={1.5} />, color: '#00e5a0' },
          { label: 'Transactions',  value: String(totalCount),         icon: <Activity size={13} strokeWidth={1.5} />,    color: '#38d4ff' },
          { label: 'Success Rate',  value: `${successRate}%`,          icon: <CheckCircle size={13} strokeWidth={1.5} />, color: '#4ade80' },
        ].map(s => (
          <div key={s.label} style={{ borderRadius: 12, padding: '10px 12px', background: 'var(--surface)', border: `1px solid ${s.color}20` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: s.color, marginBottom: 6 }}>
              {s.icon}
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#5a6a90' }}>{s.label}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: s.color, letterSpacing: '-0.5px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Chart + App breakdown side by side */}
      <div style={{ display: 'flex', gap: 8, flex: 1, minHeight: 0 }}>

        {/* Bar chart */}
        <div style={{ flex: 1, borderRadius: 12, padding: '10px 12px', background: 'var(--surface)', border: '1px solid #1e2333',
          display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8, flexShrink: 0 }}>
            <TrendingUp size={11} color="#00e5a0" strokeWidth={1.5} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#5a6a90', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Daily Revenue</span>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 5 }}>
            {byDay.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: '#5a6a90' }}>{d.revenue > 0 ? fmt(d.revenue) : ''}</span>
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.04, duration: 0.5, ease: 'easeOut' }}
                  style={{ width: '100%', minHeight: 4, height: `${Math.max(4, (d.revenue / maxDay) * 80)}px`,
                    borderRadius: '3px 3px 0 0', transformOrigin: 'bottom',
                    background: d.revenue > 0
                      ? 'linear-gradient(180deg, #00e5a0, #00e5a060)'
                      : '#1e2333' }}
                />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: '#5a6a90' }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* App breakdown */}
        <div style={{ width: 170, borderRadius: 12, padding: '10px 12px', background: 'var(--surface)', border: '1px solid #1e2333',
          display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#5a6a90', textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0 }}>By Service</span>
          {Object.entries(APP_COLORS).map(([app, color]) => {
            const rev    = byApp[app] || 0
            const pct    = totalRevenue > 0 ? (rev / totalRevenue) * 100 : 0
            return (
              <div key={app}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#8494b8' }}>{TX_LABELS[app] ?? app}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, color }}>KES {fmt(rev)}</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: '#1e2333', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: pct / 100 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    style={{ height: '100%', background: color, borderRadius: 2, transformOrigin: 'left' }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent transactions */}
      <div style={{ borderRadius: 12, padding: '8px 12px', background: 'var(--surface)', border: '1px solid #1e2333', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#5a6a90', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Recent</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filtered.slice(0, 4).map(tx => (
            <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: tx.status === 'success' ? '#4ade80' : '#f87171', flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#8494b8', marginLeft: 4 }}>
                  {TX_LABELS[tx.app] ?? tx.app}
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#3a4560' }}>
                  {tx.phone.slice(-7)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#5a6a90' }}>
                  {tx.timestamp.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: tx.status === 'success' ? '#00e5a0' : '#f87171' }}>
                  {tx.status === 'success' ? `KES ${tx.amount}` : 'Failed'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
