import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Headphones, RotateCcw } from 'lucide-react'
import BackButton from '../../components/BackButton'

type AgentState = 'idle' | 'listening' | 'processing' | 'responding'

const QUICK_QUESTIONS = [
  'How do I make a payment?',
  'Payment failed – what now?',
  'Reset this machine',
  'Contact human support',
  'Machine not dispensing',
  'Get a receipt',
]

const RESPONSES: Record<string, string> = {
  'How do I make a payment?':
    'Select your service, confirm the amount, then choose to scan the QR code or enter your M-Pesa phone number. You\'ll receive a prompt on your phone. Approve within 30 seconds to complete.',
  'Payment failed – what now?':
    'If payment was deducted but nothing was dispensed, your M-Pesa will be reversed automatically within 24 hours. Tap "Try Again" to retry, or contact support at *483# on Safaricom.',
  'Reset this machine':
    'Only authorised staff can perform a full reset. If you\'re experiencing issues, please call the support line shown at the bottom of this screen or tap the back button to return home.',
  'Contact human support':
    'You can reach our support team at 0800 723 253 (toll-free) or WhatsApp +254 700 000 000. Operating hours: Monday–Saturday, 7 AM – 8 PM. We\'re happy to help!',
  'Machine not dispensing':
    'After a confirmed payment, dispensing usually takes 5–30 seconds. If nothing happens after 60 seconds, note the time and transaction and call 0800 723 253. You will be fully refunded.',
  'Get a receipt':
    'Your M-Pesa confirmation SMS is your receipt. For a printed receipt or email confirmation, please contact our support team with your M-Pesa transaction code.',
}

function useTypewriter(text: string, speed = 22) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    setDisplayed('')
    setDone(false)
    if (!text) return
    let i = 0
    const t = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { clearInterval(t); setDone(true) }
    }, speed)
    return () => clearInterval(t)
  }, [text, speed])
  return { displayed, done }
}

// Waveform bars that animate when listening
function Waveform({ active }: { active: boolean }) {
  const bars = 12
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 28 }}>
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          animate={active ? { scaleY: [0.3, 1, 0.3], opacity: [0.5, 1, 0.5] } : { scaleY: 0.15, opacity: 0.25 }}
          transition={active ? { duration: 0.7 + i * 0.05, repeat: Infinity, delay: i * 0.06, ease: 'easeInOut' } : { duration: 0.3 }}
          style={{ width: 3, borderRadius: 2, background: active ? '#818cf8' : '#3a4560', height: '100%', transformOrigin: 'center' }}
        />
      ))}
    </div>
  )
}

// Central voice orb
function VoiceOrb({ state, onToggle }: { state: AgentState; onToggle: () => void }) {
  const isListening = state === 'listening'
  const isProcessing = state === 'processing'
  const orb1Color = isListening ? '#818cf8' : isProcessing ? '#38d4ff' : '#4ade80'
  const orb2Color = isListening ? '#a78bfa' : isProcessing ? '#818cf8' : '#22d3ee'

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 100, height: 100 }}>
      {/* Outer pulse rings */}
      {[0, 1].map(i => (
        <motion.div
          key={i}
          animate={(isListening || isProcessing) ? {
            scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5]
          } : { scale: 1, opacity: 0 }}
          transition={{ duration: 1.8, delay: i * 0.9, repeat: Infinity, ease: 'easeOut' }}
          style={{
            position: 'absolute', width: 90, height: 90, borderRadius: '50%',
            border: `1.5px solid ${orb1Color}`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Orb button */}
      <motion.button
        onClick={onToggle}
        whileTap={{ scale: 0.93 }}
        animate={{ boxShadow: isListening
          ? [`0 0 24px ${orb1Color}90, 0 0 48px ${orb1Color}50`, `0 0 40px ${orb1Color}bb, 0 0 70px ${orb1Color}60`, `0 0 24px ${orb1Color}90, 0 0 48px ${orb1Color}50`]
          : [`0 0 16px ${orb1Color}40`, `0 0 28px ${orb1Color}60`, `0 0 16px ${orb1Color}40`]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 76, height: 76, borderRadius: '50%', cursor: 'pointer', zIndex: 2,
          border: `2px solid ${orb1Color}60`,
          background: `radial-gradient(circle at 35% 35%, ${orb2Color}40, ${orb1Color}20, #0c0f18 80%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Inner shimmer */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', inset: 0, borderRadius: '50%',
            background: `conic-gradient(transparent, ${orb1Color}30, transparent, ${orb1Color}15, transparent)`,
            pointerEvents: 'none' }}
        />
        {isProcessing
          ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><RotateCcw size={24} color={orb1Color} strokeWidth={2} /></motion.div>
          : isListening
            ? <MicOff size={24} color={orb1Color} strokeWidth={2} />
            : <Mic size={24} color={orb1Color} strokeWidth={2} />
        }
      </motion.button>
    </div>
  )
}

export default function Support() {
  const [agentState, setAgentState] = useState<AgentState>('idle')
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [responseText, setResponseText] = useState('')
  const { displayed, done } = useTypewriter(responseText)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const simulateAnswer = (question: string) => {
    setAgentState('listening')
    setCurrentQuestion(question)
    setResponseText('')
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setAgentState('processing')
      timeoutRef.current = setTimeout(() => {
        setAgentState('responding')
        setResponseText(RESPONSES[question] ?? 'I\'m not sure about that. Please call 0800 723 253 for live assistance.')
      }, 1400)
    }, 900)
  }

  const handleOrbToggle = () => {
    if (agentState === 'idle') {
      setAgentState('listening')
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        setAgentState('processing')
        timeoutRef.current = setTimeout(() => {
          setAgentState('responding')
          setCurrentQuestion('How do I make a payment?')
          setResponseText(RESPONSES['How do I make a payment?'])
        }, 1200)
      }, 2000)
    } else {
      setAgentState('idle')
      setCurrentQuestion('')
      setResponseText('')
      clearTimeout(timeoutRef.current)
    }
  }

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const stateLabel: Record<AgentState, string> = {
    idle:       'Tap mic to ask a question',
    listening:  'Listening…',
    processing: 'Thinking…',
    responding: 'Here\'s what I found',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ width: 800, height: 480, background: 'var(--bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}
    >
      {/* Ambient glow */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 500px 300px at 50% 60%, #818cf808 0%, transparent 65%)' }} />

      {/* Header */}
      <div style={{ height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 14px', background: '#080b12', borderBottom: '1px solid #181d28', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BackButton />
          <div style={{ width: 28, height: 28, borderRadius: 9, background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px #818cf840' }}>
            <Headphones size={14} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--text)', letterSpacing: '0.06em' }}>SUPPORT</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#818cf8', marginTop: 1 }}>AI Voice Agent · Available 24 / 7</div>
          </div>
        </div>
        <div style={{ padding: '4px 12px', borderRadius: 20, background: '#4ade8018', border: '1px solid #4ade8030' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#4ade80' }}>● Online</span>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left: response + orb */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 20px', gap: 10 }}>

          {/* Response area */}
          <div style={{ width: '100%', flex: 1, borderRadius: 14, padding: '12px 14px',
            background: 'var(--surface)', border: '1px solid #1e2333',
            display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>

            {currentQuestion && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ maxWidth: '80%', padding: '7px 12px', borderRadius: '12px 12px 2px 12px',
                  background: '#818cf820', border: '1px solid #818cf830' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#c7d2fe' }}>{currentQuestion}</span>
                </div>
              </div>
            )}

            <AnimatePresence>
              {responseText && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}
                >
                  <div style={{ width: 22, height: 22, borderRadius: 8, flexShrink: 0,
                    background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                    <Headphones size={11} color="#fff" strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1, padding: '7px 12px', borderRadius: '2px 12px 12px 12px',
                    background: '#0f1724', border: '1px solid #1e2d40' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text)', lineHeight: 1.6 }}>
                      {displayed}
                      {!done && <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }}>▋</motion.span>}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!currentQuestion && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#3a4560', textAlign: 'center', lineHeight: 1.7 }}>
                  Tap the mic or choose a question<br />to get instant help
                </span>
              </div>
            )}
          </div>

          {/* Orb + state */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <VoiceOrb state={agentState} onToggle={handleOrbToggle} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Waveform active={agentState === 'listening'} />
              <motion.span
                key={agentState}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#5a6a90' }}>
                {stateLabel[agentState]}
              </motion.span>
              <Waveform active={agentState === 'listening'} />
            </div>
          </div>
        </div>

        {/* Right: quick questions */}
        <div style={{ width: 230, flexShrink: 0, borderLeft: '1px solid #181d28',
          display: 'flex', flexDirection: 'column', padding: '12px 10px', gap: 6, overflow: 'hidden' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#5a6a90', letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: 4 }}>Quick Questions</div>
          {QUICK_QUESTIONS.map((q, i) => {
            const isActive = q === currentQuestion
            return (
              <motion.button
                key={q}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => simulateAnswer(q)}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: '100%', borderRadius: 10, padding: '9px 11px',
                  border: `1px solid ${isActive ? '#818cf850' : '#1e2333'}`,
                  background: isActive ? '#818cf815' : 'var(--surface)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}
              >
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: isActive ? '#c7d2fe' : 'var(--text-dim)', lineHeight: 1.3 }}>{q}</span>
              </motion.button>
            )
          })}

          {/* Helpline */}
          <div style={{ marginTop: 'auto', padding: '10px 10px', borderRadius: 10, background: '#4ade8010', border: '1px solid #4ade8025' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#4ade80', marginBottom: 3 }}>Live Helpline</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--text)', letterSpacing: '0.04em' }}>0800 723 253</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#5a6a90', marginTop: 2 }}>Mon–Sat · 7AM–8PM</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
