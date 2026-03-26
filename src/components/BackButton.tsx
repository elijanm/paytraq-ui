import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminStore } from '../store/adminStore'

interface Props { to?: string }

export default function BackButton({ to: _to = '/' }: Props) {
  const navigate  = useNavigate()
  const timerRef  = useRef<ReturnType<typeof setTimeout>>()
  const hintRef   = useRef<ReturnType<typeof setTimeout>>()
  const didLongPress = useRef(false)
  const [held, setHeld] = useState(false)
  const [hint, setHint] = useState(false)

  const { singleAppMode } = useAdminStore()

  const onPointerDown = () => {
    didLongPress.current = false

    // Only set up long-press admin shortcut in single-app mode.
    // In normal mode a short tap just goes home — no long-press needed.
    if (!singleAppMode) return

    hintRef.current = setTimeout(() => setHint(true), 500)
    timerRef.current = setTimeout(() => {
      didLongPress.current = true
      setHeld(true)
      setHint(false)
      navigate('/admin')
    }, 900)
  }

  const cancel = () => {
    clearTimeout(timerRef.current)
    clearTimeout(hintRef.current)
    setHint(false)
    setHeld(false)
  }

  const onPointerUp = () => {
    const wasLongPress = didLongPress.current
    cancel()
    if (wasLongPress) return
    if (!singleAppMode) {
      // Defer by one tick so the browser's click event fires on THIS button
      // (still mounted) rather than on whatever lands at the same coordinates
      // in the newly-rendered AppGrid (its logo button, which opens /admin).
      setTimeout(() => navigate('/'), 10)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <motion.button
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={cancel}
        whileTap={{ scale: 0.92 }}
        style={{
          width: 40, height: 40, borderRadius: 12,
          background: held ? '#00e5a015' : 'var(--surface-2)',
          border: `1px solid ${held ? '#00e5a040' : 'var(--border-hi)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: singleAppMode ? 0.35 : 1,
          color: 'var(--text-dim)', cursor: singleAppMode ? 'default' : 'pointer',
          transition: 'background 0.15s, border-color 0.15s',
          flexShrink: 0,
        }}
      >
        <ChevronLeft size={20} strokeWidth={2} />
      </motion.button>

      {/* Admin hint tooltip — only shows in single-app mode on long-press */}
      <AnimatePresence>
        {hint && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'absolute', top: 44, left: 0, zIndex: 100,
              background: '#0a0d14', border: '1px solid #00e5a030',
              borderRadius: 8, padding: '5px 10px', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 5,
              boxShadow: '0 4px 16px #00000080',
            }}
          >
            <Shield size={10} color="#00e5a0" strokeWidth={2} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#00e5a0' }}>Admin…</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
