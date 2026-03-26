import { motion } from 'framer-motion'
import { X, Trash2 } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'

interface Props {
  onCheckout: () => void
  onClose: () => void
}

const fmt = (n: number) => `KES ${(n / 100).toFixed(2)}`
const ACCENT = '#00e5a0'

export default function CartDrawer({ onCheckout, onClose }: Props) {
  const { items, updateQty, removeItem, total } = useCartStore()

  return (
    <motion.div
      style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 240, borderRadius: '20px 20px 0 0',
        background: 'var(--surface)',
        border: '1px solid var(--border-hi)',
        borderBottom: 'none',
        boxShadow: '0 -16px 48px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column',
        zIndex: 40, overflow: 'hidden',
      }}
      initial={{ y: 240 }}
      animate={{ y: 0 }}
      exit={{ y: 240 }}
      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
    >
      {/* Top accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${ACCENT}80, transparent)` }} />

      {/* Handle */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10 }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border-hi)' }} />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px 8px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
            Cart
          </span>
          <div style={{ padding: '2px 8px', borderRadius: 6, background: `${ACCENT}20`, border: `1px solid ${ACCENT}30` }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: ACCENT }}>
              {items.reduce((s, i) => s + i.quantity, 0)} items
            </span>
          </div>
        </div>
        <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={14} />
        </button>
      </div>

      {/* Items list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 18px' }}>
        {items.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBlock: 5 }}>
            <span style={{ fontSize: 18 }}>{(item as any).image ?? '📦'}</span>
            <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text)' }}>{item.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => updateQty(item.id, -1)}
                style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>−</button>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: ACCENT, width: 16, textAlign: 'center' }}>{item.quantity}</span>
              <button onClick={() => updateQty(item.id, 1)}
                style={{ width: 24, height: 24, borderRadius: 6, background: `${ACCENT}20`, border: `1px solid ${ACCENT}30`, color: ACCENT, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>+</button>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: ACCENT, width: 60, textAlign: 'right' }}>{fmt(item.price * item.quantity)}</span>
            <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Checkout bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', borderTop: '1px solid var(--border)' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Total</p>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: ACCENT, margin: 0 }}>{fmt(total())}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onCheckout}
          style={{
            padding: '10px 24px', borderRadius: 12, cursor: 'pointer',
            background: `linear-gradient(135deg, ${ACCENT}, #00b37a)`,
            border: 'none', color: '#000',
            fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 13,
            boxShadow: `0 4px 16px ${ACCENT}40`,
          }}
        >
          Checkout →
        </motion.button>
      </div>
    </motion.div>
  )
}
