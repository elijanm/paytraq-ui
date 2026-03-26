import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, ShieldAlert } from 'lucide-react'
import BackButton from '../../components/BackButton'
import CartDrawer from './CartDrawer'
import AgeVerification from './AgeVerification'
import MpesaCheckout from '../../components/MpesaCheckout'
import VendingDispensing, { type DispenseItem } from './VendingDispensing'
import { useCartStore } from '../../store/cartStore'
import { ITEMS } from './items'

type View = 'shop' | 'age_verify' | 'checkout' | 'dispensing'

const fmt = (n: number) => `KES ${(n / 100).toFixed(2)}`

function hasAgeRestrictedItems(cartItemIds: string[]) {
  return cartItemIds.some(id => ITEMS.find(i => i.id === id)?.ageRestricted)
}

export default function Vending() {
  const [cartOpen, setCartOpen]       = useState(false)
  const [view, setView]               = useState<View>('shop')
  const [dispenseList, setDispenseList] = useState<DispenseItem[]>([])
  const { items, addItem, updateQty, totalItems, total, clearCart } = useCartStore()

  const getQty = (id: string) => items.find(i => i.id === id)?.quantity ?? 0

  const handleCheckoutSuccess = () => {
    // Snapshot cart BEFORE clearing so dispensing screen can show each item
    const snapshot: DispenseItem[] = items.map(ci => ({
      id: ci.id, name: ci.name, quantity: ci.quantity, price: ci.price,
    }))
    setDispenseList(snapshot)
    clearCart()
    setView('dispensing')
  }

  // Called by CartDrawer "Checkout" button
  const handleCartCheckout = () => {
    setCartOpen(false)
    const needsVerify = hasAgeRestrictedItems(items.map(i => i.id))
    setView(needsVerify ? 'age_verify' : 'checkout')
  }

  if (view === 'dispensing') return <VendingDispensing items={dispenseList} />

  return (
    <motion.div
      style={{ width: 800, height: 480, background: 'var(--bg)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
    >
      {/* Topbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BackButton />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00e5a0', boxShadow: '0 0 8px #00e5a0' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Vending</span>
          </div>
        </div>

        {/* Age-restricted warning badge (shows only when 18+ item is in cart) */}
        <AnimatePresence>
          {hasAgeRestrictedItems(items.map(i => i.id)) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8,
                background: '#ffc13015', border: '1px solid #ffc13040' }}>
              <ShieldAlert size={11} color="#ffc130" strokeWidth={1.5} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#ffc130' }}>18 + items in cart</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setCartOpen(o => !o)}
          whileTap={{ scale: 0.94 }}
          style={{
            position: 'relative', display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 12,
            background: totalItems() > 0 ? '#00e5a015' : 'var(--surface-2)',
            border: `1px solid ${totalItems() > 0 ? '#00e5a040' : 'var(--border)'}`,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          <ShoppingCart size={18} color={totalItems() > 0 ? '#00e5a0' : 'var(--text-dim)'} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: totalItems() > 0 ? '#00e5a0' : 'var(--text-muted)' }}>
            {totalItems() > 0 ? fmt(total()) : 'Cart'}
          </span>
          {totalItems() > 0 && (
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              style={{ position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: '50%',
                background: '#00e5a0', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10 }}>
              {totalItems()}
            </motion.div>
          )}
        </motion.button>
      </div>

      {/* Items grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {ITEMS.map((item, i) => {
            const qty = getQty(item.id)
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                style={{
                  borderRadius: 14, padding: '12px 10px', position: 'relative',
                  background: qty > 0 ? '#00e5a00a' : 'var(--surface)',
                  border: `1px solid ${qty > 0 ? '#00e5a030' : item.ageRestricted ? '#ffc13022' : 'var(--border)'}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  transition: 'all 0.2s',
                }}
              >
                {/* 18 + badge */}
                {item.ageRestricted && (
                  <div style={{ position: 'absolute', top: 6, right: 6, padding: '1px 5px', borderRadius: 5,
                    background: '#ffc13020', border: '1px solid #ffc13045' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 7, color: '#ffc130', fontWeight: 700 }}>18+</span>
                  </div>
                )}

                <span style={{ fontSize: 30 }}>{item.emoji}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, color: 'var(--text)', textAlign: 'center', lineHeight: 1.2 }}>{item.name}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: '#00e5a0' }}>{fmt(item.price)}</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  {qty > 0 ? (
                    <>
                      <motion.button whileTap={{ scale: 0.88 }} onClick={() => updateQty(item.id, -1)}
                        style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</motion.button>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#00e5a0', width: 16, textAlign: 'center' }}>{qty}</span>
                      <motion.button whileTap={{ scale: 0.88 }} onClick={() => addItem({ id: item.id, name: item.name, price: item.price })}
                        style={{ width: 26, height: 26, borderRadius: 8, background: '#00e5a0', border: 'none', color: '#000', cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #00e5a040' }}>+</motion.button>
                    </>
                  ) : (
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => addItem({ id: item.id, name: item.name, price: item.price })}
                      style={{ padding: '4px 12px', borderRadius: 8, background: '#00e5a015', border: '1px solid #00e5a030', color: '#00e5a0', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700 }}>
                      Add
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* CTA bar */}
      <AnimatePresence>
        {totalItems() > 0 && !cartOpen && (
          <motion.div
            initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
            style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}
          >
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setCartOpen(true)}
              style={{ width: '100%', padding: '12px', borderRadius: 14, cursor: 'pointer',
                background: 'linear-gradient(135deg, #00e5a0, #00b37a)', border: 'none', color: '#000',
                fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 14,
                boxShadow: '0 4px 20px #00e5a040',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <ShoppingCart size={16} />
              View Cart — {totalItems()} item{totalItems() > 1 ? 's' : ''} · {fmt(total())}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart drawer */}
      <AnimatePresence>
        {cartOpen && (
          <CartDrawer
            onCheckout={handleCartCheckout}
            onClose={() => setCartOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Age Verification — intercepts checkout when 18+ items in cart ── */}
      <AnimatePresence>
        {view === 'age_verify' && (
          <AgeVerification
            onVerified={() => setView('checkout')}
            onCancel={() => setView('shop')}
          />
        )}
      </AnimatePresence>

      {/* M-Pesa checkout */}
      <AnimatePresence>
        {view === 'checkout' && (
          <MpesaCheckout
            amount={total()}
            description={`Vending — ${totalItems()} item(s)`}
            onSuccess={handleCheckoutSuccess}
            onCancel={() => setView('shop')}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
