import { motion } from 'framer-motion'

const C    = '#38d4ff'
const SIZE = 150
const CX   = SIZE / 2
const CY   = SIZE / 2
const OR   = 38
const IS   = 24

type ClothType = 'shirt' | 'sock' | 'shorts' | 'towel'

function ClothingShape({ type, color, size }: { type: ClothType; color: string; size: number }) {
  const s = size
  if (type === 'shirt') return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
      <path d="M6 2 L2 5 L4 6 L4 15 L16 15 L16 6 L18 5 L14 2 L12 4 Q10 6 8 4 Z"
        fill={color + 'cc'} stroke={color} strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  )
  if (type === 'sock') return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
      <path d="M7 2 L13 2 L13 11 L17 15 Q17 18 13 18 L9 18 Q5 18 5 14 L5 2 Z"
        fill={color + 'cc'} stroke={color} strokeWidth="0.8" strokeLinejoin="round" />
      <line x1="7" y1="5" x2="13" y2="5" stroke={color + '60'} strokeWidth="0.8" />
    </svg>
  )
  if (type === 'shorts') return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
      <path d="M2 4 L18 4 L16 18 L12 18 L10 12 L8 18 L4 18 Z"
        fill={color + 'cc'} stroke={color} strokeWidth="0.8" strokeLinejoin="round" />
      <line x1="2" y1="8" x2="18" y2="8" stroke={color + '60'} strokeWidth="0.8" />
    </svg>
  )
  return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
      <rect x="2" y="3" width="16" height="14" rx="2"
        fill={color + 'cc'} stroke={color} strokeWidth="0.8" />
      <line x1="2" y1="8" x2="18" y2="8" stroke={color + '50'} strokeWidth="0.8" />
      <line x1="2" y1="12" x2="18" y2="12" stroke={color + '50'} strokeWidth="0.8" />
    </svg>
  )
}

function Bubble({ x, size, dur, delay }: { x: number; size: number; dur: number; delay: number }) {
  return (
    <motion.div
      initial={{ y: 0, opacity: 0.7, scale: 1 }}
      animate={{ y: [-2, -28, -38], opacity: [0.7, 0.5, 0], scale: [1, 1.1, 0.2] }}
      transition={{ duration: dur, delay, repeat: Infinity, repeatDelay: dur * 0.4, ease: 'easeOut' }}
      style={{
        position: 'absolute', bottom: 14, left: x,
        width: size, height: size, borderRadius: '50%',
        border: `1px solid ${C}60`,
        background: `radial-gradient(circle at 35% 35%, ${C}40, ${C}10)`,
        pointerEvents: 'none',
      }}
    />
  )
}

const ITEMS: { type: ClothType; color: string }[] = [
  { type: 'shirt',  color: '#38d4ff' },
  { type: 'sock',   color: '#ff9044' },
  { type: 'shorts', color: '#b48aff' },
  { type: 'towel',  color: '#00e5a0' },
]

const BUBBLES = [
  { x: CX - 18, size: 5,  dur: 1.8, delay: 0    },
  { x: CX - 4,  size: 7,  dur: 2.2, delay: 0.5  },
  { x: CX + 10, size: 4,  dur: 1.6, delay: 1.1  },
  { x: CX + 20, size: 6,  dur: 2.0, delay: 0.3  },
  { x: CX - 10, size: 4,  dur: 1.4, delay: 1.7  },
]

export default function WashingAnim({ size = 150 }: { size?: number }) {
  const scale = size / SIZE
  return (
    <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left',
      width: SIZE, height: SIZE, position: 'relative' }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ position: 'absolute', top: 0, left: 0 }}>
        <rect x="4" y="4" width={SIZE - 8} height={SIZE - 8} rx="22"
          fill="#0c0f18" stroke={C + '25'} strokeWidth="2" />
        <circle cx={CX} cy={CY} r="66" fill="#080b12" stroke={C + '50'} strokeWidth="4" />
        <circle cx={CX} cy={CY} r="58" fill="#060810" stroke={C + '18'} strokeWidth="1.5" />
        {[0,45,90,135,180,225,270,315].map(a => {
          const rad = a * Math.PI / 180
          const px  = CX + OR * Math.cos(rad)
          const py  = CY + OR * Math.sin(rad)
          return <circle key={a} cx={px} cy={py} r="3.5"
            fill={C + '12'} stroke={C + '35'} strokeWidth="1" />
        })}
        <motion.ellipse cx={CX} cy={CY + 50} rx="46" ry="9" fill={C + '18'}
          animate={{ ry: [9, 11, 8, 10, 9] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.path
          d={`M ${CX-40} ${CY+44} Q ${CX} ${CY+40} ${CX+40} ${CY+44}`}
          stroke={C + '50'} strokeWidth="1.5" fill="none"
          animate={{ d: [
            `M ${CX-40} ${CY+44} Q ${CX} ${CY+40} ${CX+40} ${CY+44}`,
            `M ${CX-40} ${CY+42} Q ${CX} ${CY+46} ${CX+40} ${CY+42}`,
            `M ${CX-40} ${CY+44} Q ${CX} ${CY+40} ${CX+40} ${CY+44}`,
          ]}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>

      {BUBBLES.map((b, i) => <Bubble key={i} {...b} />)}

      {ITEMS.map((item, i) => {
        const startDeg = (360 / ITEMS.length) * i
        return (
          <motion.div key={i}
            style={{ position: 'absolute', left: CX, top: CY, width: 0, height: 0 }}
            animate={{ rotate: [startDeg, startDeg + 360] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}>
            <motion.div
              style={{ position: 'absolute', left: OR - IS / 2, top: -IS / 2, width: IS, height: IS }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}>
              <ClothingShape type={item.type} color={item.color} size={IS} />
            </motion.div>
          </motion.div>
        )
      })}

      <motion.div animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.03, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', inset: 0, borderRadius: '50%',
          border: `2px solid ${C}30`, pointerEvents: 'none' }} />
    </div>
  )
}
