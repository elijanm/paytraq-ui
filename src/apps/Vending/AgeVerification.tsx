import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, ShieldX, CreditCard, X, ArrowRight, ArrowLeft, Eye, Loader2, CheckCircle } from 'lucide-react'

// ── Types & config ─────────────────────────────────────────────────────────
type Step = 'id_front' | 'id_back' | 'blink' | 'look_right' | 'look_left' | 'processing' | 'verified' | 'rejected'

const FLOW: Step[] = ['id_front', 'id_back', 'blink', 'look_right', 'look_left', 'processing']

interface StepCfg {
  label: string; instruction: string; hint: string
  type: 'id' | 'face'; duration: number; color: string
}

const CFG: Record<Step, StepCfg> = {
  id_front:   { label: 'ID Front',   instruction: 'Hold the front of your ID card facing the camera', hint: 'Keep the card steady and well-lit',            type: 'id',   duration: 3600, color: '#38d4ff' },
  id_back:    { label: 'ID Back',    instruction: 'Flip your ID card to show the back side',           hint: 'All text must be visible',                    type: 'id',   duration: 3100, color: '#38d4ff' },
  blink:      { label: 'Blink',      instruction: 'Look at the camera — blink slowly',                 hint: 'One natural blink confirms liveness',          type: 'face', duration: 2600, color: '#b48aff' },
  look_right: { label: 'Look Right', instruction: 'Turn your head slowly to the right  →',             hint: 'Keep your face within the oval',               type: 'face', duration: 2200, color: '#b48aff' },
  look_left:  { label: 'Look Left',  instruction: '←  Turn your head slowly to the left',             hint: 'Keep your face within the oval',               type: 'face', duration: 2200, color: '#b48aff' },
  processing: { label: 'Analysing',  instruction: 'Verifying identity…',                               hint: 'AI analysis in progress — please wait',        type: 'face', duration: 2400, color: '#ffc130' },
  verified:   { label: 'Verified',   instruction: 'Identity confirmed',                                hint: 'Age requirement met — you may proceed',        type: 'face', duration: 0,    color: '#4ade80' },
  rejected:   { label: 'Failed',     instruction: 'Verification unsuccessful',                         hint: 'Please see a member of staff for assistance',  type: 'face', duration: 0,    color: '#f87171' },
}

// Ramanujan ellipse circumference approximation
const ellipseC = (rx: number, ry: number) => {
  const h = ((rx - ry) / (rx + ry)) ** 2
  return Math.PI * (rx + ry) * (1 + 3 * h / (10 + Math.sqrt(4 - 3 * h)))
}

const CX = 210, CY = 245   // center of left panel (420 wide, 480 tall)
const FACE_RX = 85, FACE_RY = 110
const FACE_C   = ellipseC(FACE_RX, FACE_RY)     // ≈ 620px
const RING_R   = 128                              // outer progress circle
const RING_C   = 2 * Math.PI * RING_R            // ≈ 804px
const ID_W     = 272, ID_H = 172, ID_RX = 14    // ID card guide

// ── Camera hook ─────────────────────────────────────────────────────────────
function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasCamera, setHasCamera] = useState<boolean | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user', width: 420, height: 480 } })
      .then(s => {
        stream = s
        if (videoRef.current) { videoRef.current.srcObject = s }
        setHasCamera(true)
      })
      .catch(() => setHasCamera(false))
    return () => { stream?.getTracks().forEach(t => t.stop()) }
  }, [])

  return { videoRef, hasCamera }
}

// ── SVG guide overlay ────────────────────────────────────────────────────────
function GuideOverlay({ step, progress }: { step: Step; progress: number }) {
  const cfg      = CFG[step]
  const isFace   = cfg.type === 'face'
  const color    = step === 'verified' ? '#4ade80' : step === 'rejected' ? '#f87171' : cfg.color
  const ringOff  = RING_C * (1 - progress)

  return (
    <svg
      width="420" height="480"
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}
    >
      <defs>
        <mask id="ageMask">
          <rect width="420" height="480" fill="white" />
          {isFace
            ? <ellipse cx={CX} cy={CY} rx={FACE_RX} ry={FACE_RY} fill="black" />
            : <rect x={CX - ID_W / 2} y={CY - ID_H / 2} width={ID_W} height={ID_H} rx={ID_RX} fill="black" />
          }
        </mask>
        <filter id="ageGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Vignette with guide cutout */}
      <rect width="420" height="480" fill="rgba(4,6,12,0.72)" mask="url(#ageMask)" />

      {/* Guide outline */}
      {isFace ? (
        <ellipse cx={CX} cy={CY} rx={FACE_RX} ry={FACE_RY}
          fill="none" stroke={`${color}60`} strokeWidth="1.5"
          style={{ filter: `drop-shadow(0 0 4px ${color}80)` }} />
      ) : (
        <rect x={CX - ID_W / 2} y={CY - ID_H / 2} width={ID_W} height={ID_H} rx={ID_RX}
          fill="none" stroke={`${color}60`} strokeWidth="1.5"
          style={{ filter: `drop-shadow(0 0 4px ${color}80)` }} />
      )}

      {/* Progress ring (circle, centered on guide) */}
      {!['verified', 'rejected'].includes(step) && (
        <circle
          cx={CX} cy={CY} r={RING_R}
          fill="none"
          stroke={`${color}25`} strokeWidth="2.5"
        />
      )}
      {!['verified', 'rejected'].includes(step) && progress > 0 && (
        <circle
          cx={CX} cy={CY} r={RING_R}
          fill="none"
          stroke={color} strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={RING_C}
          strokeDashoffset={ringOff}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ filter: `drop-shadow(0 0 5px ${color})`, transition: 'stroke-dashoffset 0.06s linear, stroke 0.4s ease' }}
        />
      )}

      {/* Corner brackets for ID */}
      {!isFace && (() => {
        const l = CX - ID_W / 2, r = CX + ID_W / 2
        const t = CY - ID_H / 2, b = CY + ID_H / 2
        const s = 18
        const corners = [[l, t, 1, 1], [r, t, -1, 1], [l, b, 1, -1], [r, b, -1, -1]] as const
        return corners.map(([x, y, dx, dy], i) => (
          <g key={i} filter="url(#ageGlow)">
            <line x1={x} y1={y} x2={x + dx * s} y2={y} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <line x1={x} y1={y} x2={x} y2={y + dy * s} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          </g>
        ))
      })()}

      {/* ID scan line */}
      {!isFace && step !== 'verified' && step !== 'rejected' && (
        <motion.line
          x1={CX - ID_W / 2 + 8} x2={CX + ID_W / 2 - 8}
          animate={{ y1: [CY - ID_H / 2 + 8, CY + ID_H / 2 - 8, CY - ID_H / 2 + 8], y2: [CY - ID_H / 2 + 8, CY + ID_H / 2 - 8, CY - ID_H / 2 + 8] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          stroke={`${color}cc`} strokeWidth="1.5"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      )}

      {/* Success / fail overlay */}
      {step === 'verified' && (
        <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          style={{ transformOrigin: `${CX}px ${CY}px`, transformBox: 'fill-box' }}>
          <circle cx={CX} cy={CY} r="46" fill="#4ade8025" stroke="#4ade8060" strokeWidth="2" />
          <circle cx={CX} cy={CY} r="32" fill="#4ade8040" />
          {/* Checkmark path */}
          <motion.path d={`M ${CX-16} ${CY} l 10 12 l 22 -24`}
            fill="none" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />
        </motion.g>
      )}
      {step === 'rejected' && (
        <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          style={{ transformOrigin: `${CX}px ${CY}px`, transformBox: 'fill-box' }}>
          <circle cx={CX} cy={CY} r="46" fill="#f8717125" stroke="#f8717160" strokeWidth="2" />
          <circle cx={CX} cy={CY} r="32" fill="#f8717140" />
          <line x1={CX - 14} y1={CY - 14} x2={CX + 14} y2={CY + 14} stroke="#f87171" strokeWidth="4" strokeLinecap="round" />
          <line x1={CX + 14} y1={CY - 14} x2={CX - 14} y2={CY + 14} stroke="#f87171" strokeWidth="4" strokeLinecap="round" />
        </motion.g>
      )}

      {/* Blink eye indicators */}
      {step === 'blink' && (
        <g>
          {[CX - 30, CX + 30].map((ex, i) => (
            <motion.ellipse key={i} cx={ex} cy={CY - 62}
              rx="12" ry="8"
              fill={`${color}cc`}
              animate={{ ry: [8, 0.5, 8, 8, 8] }}
              transition={{ duration: 1.6, delay: i * 0.05, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
          {[CX - 30, CX + 30].map((ex, i) => (
            <motion.circle key={i} cx={ex} cy={CY - 62} r="4" fill="rgba(0,0,0,0.7)"
              animate={{ ry: [4, 0.3, 4, 4, 4] }}
              transition={{ duration: 1.6, delay: i * 0.05, repeat: Infinity }}
            />
          ))}
        </g>
      )}

      {/* Direction arrows */}
      {(step === 'look_right' || step === 'look_left') && (() => {
        const dir = step === 'look_right' ? 1 : -1
        const ax  = CX + dir * (FACE_RX + 38)
        return (
          <motion.g
            animate={{ x: [0, dir * 8, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.path
              d={dir > 0
                ? `M ${ax - 12} ${CY} l 18 0 m -8 -8 l 8 8 l -8 8`
                : `M ${ax + 12} ${CY} l -18 0 m 8 -8 l -8 8 l 8 8`}
              fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 6px ${color})` }}
            />
          </motion.g>
        )
      })()}
    </svg>
  )
}

// ── Fake camera placeholder ─────────────────────────────────────────────────
function CameraPlaceholder({ step }: { step: Step }) {
  const isFace = CFG[step].type === 'face'
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#060810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: 0.18 }}>
        <span style={{ fontSize: isFace ? 72 : 52 }}>{isFace ? '😐' : '🪪'}</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          {isFace ? 'Camera feed' : 'Document scanner'}
        </span>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
interface Props { onVerified: () => void; onCancel: () => void }

export default function AgeVerification({ onVerified, onCancel }: Props) {
  const [step, setStep]       = useState<Step>('id_front')
  const [progress, setProgress] = useState(0)
  const { videoRef, hasCamera } = useCamera()

  const rafRef    = useRef<number>()
  const startRef  = useRef(0)
  const stepRef   = useRef(step)
  stepRef.current = step

  const runStep = useCallback((s: Step) => {
    const { duration } = CFG[s]
    if (!duration) return   // terminal states
    setProgress(0)
    startRef.current = performance.now()

    const tick = (now: number) => {
      if (stepRef.current !== s) return
      const p = Math.min((now - startRef.current) / duration, 1)
      setProgress(p)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setTimeout(() => {
          if (stepRef.current !== s) return
          const idx = FLOW.indexOf(s)
          if (idx < 0) return
          if (s === 'processing') {
            const result: Step = Math.random() > 0.12 ? 'verified' : 'rejected'
            setStep(result)
            if (result === 'verified') setTimeout(onVerified, 1800)
          } else {
            const next = FLOW[idx + 1]
            setStep(next)
          }
        }, 320)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [onVerified])

  useEffect(() => {
    runStep(step)
    return () => cancelAnimationFrame(rafRef.current!)
  }, [step, runStep])

  const cfg        = CFG[step]
  const doneSteps  = FLOW.slice(0, FLOW.indexOf(step))
  const isTerminal = step === 'verified' || step === 'rejected'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'absolute', inset: 0, zIndex: 80, display: 'flex', overflow: 'hidden' }}
    >
      {/* ── Left: camera 420px ── */}
      <div style={{ width: 420, height: 480, flexShrink: 0, position: 'relative', overflow: 'hidden', background: '#050810' }}>

        {/* Camera video */}
        <video
          ref={videoRef}
          autoPlay playsInline muted
          style={{ width: '100%', height: '100%', objectFit: 'cover',
            transform: CFG[step].type === 'face' ? 'scaleX(-1)' : 'none',  // mirror for face
            display: hasCamera === false ? 'none' : 'block' }}
        />
        {hasCamera === false && <CameraPlaceholder step={step} />}

        {/* SVG guide + progress ring overlay */}
        <GuideOverlay step={step} progress={progress} />

        {/* Processing spinner overlay */}
        {step === 'processing' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(4,6,12,0.55)', pointerEvents: 'none' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}>
              <Loader2 size={36} color="#ffc130" strokeWidth={1.5} />
            </motion.div>
          </div>
        )}

        {/* Bottom label strip */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 14px',
          background: 'linear-gradient(transparent, rgba(4,6,12,0.9))',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <motion.div
              animate={{ opacity: isTerminal ? 1 : [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: isTerminal ? 0 : Infinity }}
              style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color,
                boxShadow: `0 0 8px ${cfg.color}` }}
            />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: cfg.color, fontWeight: 600 }}>
              {cfg.label}
            </span>
          </div>
          {!isTerminal && (
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: '#5a6a90' }}>
              {FLOW.indexOf(step) + 1} / {FLOW.length}
            </span>
          )}
        </div>
      </div>

      {/* ── Right: info panel 380px ── */}
      <div style={{ flex: 1, height: 480, display: 'flex', flexDirection: 'column',
        background: '#080b14', borderLeft: '1px solid #111724', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderBottom: '1px solid #111724', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 10,
              background: 'linear-gradient(135deg, #38d4ff, #b48aff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 12px #38d4ff40' }}>
              <ShieldCheck size={15} color="#000" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--text)', letterSpacing: '0.05em' }}>
                AGE VERIFICATION
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#5a6a90', marginTop: 1 }}>
                18 + required for selected items
              </div>
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onCancel}
            style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--surface-2)',
              border: '1px solid #1e2333', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#5a6a90' }}>
            <X size={13} strokeWidth={2} />
          </motion.button>
        </div>

        {/* Step list */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #111724', flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {FLOW.map((s, i) => {
              const isDone    = doneSteps.includes(s)
              const isActive  = s === step
              const isPending = !isDone && !isActive
              const scfg     = CFG[s]
              const Icon = s === 'id_front' || s === 'id_back' ? CreditCard
                : s === 'blink' ? Eye
                : s === 'look_right' ? ArrowRight
                : s === 'look_left' ? ArrowLeft
                : Loader2

              return (
                <motion.div key={s}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 8,
                    background: isActive ? `${scfg.color}12` : 'transparent',
                    border: `1px solid ${isActive ? scfg.color + '30' : 'transparent'}` }}>
                  <div style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                    background: isDone ? '#4ade8025' : isActive ? `${scfg.color}25` : '#0f1420',
                    border: `1px solid ${isDone ? '#4ade8050' : isActive ? scfg.color + '50' : '#1e2333'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isDone
                      ? <CheckCircle size={11} color="#4ade80" strokeWidth={2} />
                      : <Icon size={11} color={isActive ? scfg.color : '#3a4560'} strokeWidth={1.5} />
                    }
                  </div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 10,
                    color: isDone ? '#4ade80' : isActive ? scfg.color : '#3a4560',
                    fontWeight: isActive ? 700 : 400 }}>
                    {scfg.label}
                  </span>
                  {isActive && !isTerminal && (
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%',
                        background: scfg.color, boxShadow: `0 0 6px ${scfg.color}` }}
                    />
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Current instruction */}
        <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14,
                color: cfg.color, lineHeight: 1.4 }}>{cfg.instruction}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#5a6a90', lineHeight: 1.5 }}>
                {cfg.hint}
              </div>

              {/* Progress bar */}
              {!isTerminal && (
                <div style={{ height: 4, borderRadius: 2, background: '#1e2333', overflow: 'hidden', marginTop: 4 }}>
                  <div style={{ height: '100%', background: `linear-gradient(90deg, ${cfg.color}88, ${cfg.color})`,
                    borderRadius: 2, width: `${progress * 100}%`, transition: 'width 0.06s linear' }} />
                </div>
              )}

              {/* Step-specific visual hint */}
              {step === 'blink' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 10,
                  background: '#b48aff12', border: '1px solid #b48aff20', marginTop: 4 }}>
                  <motion.div
                    animate={{ scaleY: [1, 0.08, 1, 1, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ fontSize: 22, display: 'flex', gap: 6, lineHeight: 1 }}>
                    👁️ 👁️
                  </motion.div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#b48aff' }}>
                    Detecting blink…
                  </span>
                </div>
              )}
              {step === 'look_right' && (
                <motion.div animate={{ x: [0, 6, 0] }} transition={{ duration: 0.7, repeat: Infinity }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10,
                    background: '#b48aff12', border: '1px solid #b48aff20', marginTop: 4 }}>
                  <ArrowRight size={18} color="#b48aff" strokeWidth={2} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#b48aff' }}>Turn right…</span>
                </motion.div>
              )}
              {step === 'look_left' && (
                <motion.div animate={{ x: [0, -6, 0] }} transition={{ duration: 0.7, repeat: Infinity }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10,
                    background: '#b48aff12', border: '1px solid #b48aff20', marginTop: 4 }}>
                  <ArrowLeft size={18} color="#b48aff" strokeWidth={2} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#b48aff' }}>Turn left…</span>
                </motion.div>
              )}

              {/* Result card */}
              {step === 'verified' && (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  style={{ borderRadius: 12, padding: '12px 14px', background: '#4ade8015', border: '1px solid #4ade8030',
                    display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShieldCheck size={22} color="#4ade80" strokeWidth={1.5} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: '#4ade80', letterSpacing: '0.04em' }}>IDENTITY CONFIRMED</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#4ade8099', marginTop: 2 }}>Proceeding to payment…</div>
                  </div>
                </motion.div>
              )}
              {step === 'rejected' && (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ borderRadius: 12, padding: '12px 14px', background: '#f8717115', border: '1px solid #f8717130',
                    display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ShieldX size={22} color="#f87171" strokeWidth={1.5} />
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: '#f87171', letterSpacing: '0.04em' }}>VERIFICATION FAILED</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#f8717199', marginTop: 2 }}>Age-restricted items removed from cart</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <motion.button whileTap={{ scale: 0.95 }}
                      onClick={() => { setStep('id_front'); setProgress(0) }}
                      style={{ flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer',
                        background: '#38d4ff15', border: '1px solid #38d4ff30',
                        fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, color: '#38d4ff' }}>
                      Retry
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={onCancel}
                      style={{ flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer',
                        background: '#f8717115', border: '1px solid #f8717130',
                        fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, color: '#f87171' }}>
                      Cancel
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Anti-spoofing note */}
        {!isTerminal && (
          <div style={{ padding: '8px 16px', borderTop: '1px solid #111724', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: '#2a3045', lineHeight: 1.5, textAlign: 'center' }}>
              🔒  Live detection active · Data is not stored · Powered by on-device AI
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
