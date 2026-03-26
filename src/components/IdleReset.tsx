import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLockStore } from '../store/lockStore'

const LOCK_TIMEOUT = 90_000   // 90s idle → lock screen
const NAV_TIMEOUT  = 91_000   // 1s after locking → navigate home

export default function IdleReset() {
  const navigate = useNavigate()
  const location = useLocation()
  const { lock, unlock } = useLockStore()
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetTimers = () => {
    if (lockTimer.current) clearTimeout(lockTimer.current)
    if (navTimer.current)  clearTimeout(navTimer.current)

    lockTimer.current = setTimeout(() => {
      lock()
      navTimer.current = setTimeout(() => {
        navigate('/')
      }, 1_000)
    }, LOCK_TIMEOUT)
  }

  // Unlock and reset timers on any interaction
  const onActivity = () => {
    unlock()
    resetTimers()
  }

  useEffect(() => {
    const events = ['touchstart', 'touchmove', 'mousedown', 'mousemove', 'keydown']
    events.forEach(e => window.addEventListener(e, onActivity))
    resetTimers()
    return () => {
      events.forEach(e => window.removeEventListener(e, onActivity))
      if (lockTimer.current) clearTimeout(lockTimer.current)
      if (navTimer.current)  clearTimeout(navTimer.current)
    }
  }, [location.pathname])

  return null
}
