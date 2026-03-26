import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Printer, CheckCircle } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'

export interface ReceiptLine {
  label: string
  value: string
  highlight?: boolean
}

interface Props {
  title: string
  lines: ReceiptLine[]
  onDone: () => void
}

type Phase = 'prompt' | 'printing' | 'done'

export default function PrintReceiptModal({ title, lines, onDone }: Props) {
  const [phase, setPhase] = useState<Phase>('prompt')
  const [progress, setProgress] = useState(0)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const qrRef = useRef<HTMLDivElement>(null)

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
  const txnId = useRef(Math.random().toString(36).slice(2, 9).toUpperCase()).current

  // QR payload — compact JSON with all receipt info
  const qrPayload = JSON.stringify({
    app: 'Paytraq',
    txn: txnId,
    title,
    date: `${dateStr} ${timeStr}`,
    data: lines.reduce<Record<string, string>>((acc, l) => { acc[l.label] = l.value; return acc }, {}),
  })

  // Read the QR canvas data URL once it renders
  useEffect(() => {
    const timer = setTimeout(() => {
      const canvas = qrRef.current?.querySelector('canvas')
      if (canvas) setQrDataUrl(canvas.toDataURL('image/png'))
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handlePrint = () => {
    setPhase('printing')
    setProgress(0)

    const receiptHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Receipt — ${txnId}</title>
  <style>
    @page { size: 80mm auto; margin: 6mm 4mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #000; width: 72mm; }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .small { font-size: 9px; color: #555; }
    .dim { color: #777; }
    .dash { border-top: 1px dashed #aaa; margin: 6px 0; }
    .row { display: flex; justify-content: space-between; align-items: baseline; margin: 3px 0; }
    .hi { font-weight: bold; font-size: 12px; }
    .spacer { height: 5px; }
    .qr-wrap { display: flex; justify-content: center; margin: 8px 0 4px; }
    .qr-wrap img { width: 90px; height: 90px; image-rendering: pixelated; }
    .qr-hint { font-size: 8px; color: #666; text-align: center; margin-top: 2px; }
  </style>
</head>
<body>
  <div class="center bold" style="font-size:16px;letter-spacing:3px;margin-bottom:2px;">PAYTRAQ</div>
  <div class="center small">Self-Service Terminal</div>
  <div class="dash"></div>
  <div class="center bold" style="font-size:13px;">${title}</div>
  <div class="spacer"></div>
  <div class="row"><span class="dim">Date</span><span>${dateStr}</span></div>
  <div class="row"><span class="dim">Time</span><span>${timeStr}</span></div>
  <div class="row"><span class="dim">Txn #</span><span>${txnId}</span></div>
  <div class="dash"></div>
  ${lines.map(l => `<div class="row"><span class="dim">${l.label}</span><span class="${l.highlight ? 'hi' : ''}">${l.value}</span></div>`).join('\n  ')}
  <div class="dash"></div>
  <div class="qr-wrap"><img src="${qrDataUrl}" alt="QR Code" /></div>
  <div class="qr-hint">Scan to view receipt details</div>
  <div class="dash"></div>
  <div class="spacer"></div>
  <div class="center small">Thank you for using Paytraq</div>
  <div class="center small" style="margin-top:2px;">Powered by M-Pesa</div>
  <div class="spacer"></div>
</body>
</html>`

    const pw = window.open('', '_blank', 'width=320,height=560,toolbar=0,menubar=0,scrollbars=0')
    if (pw) {
      pw.document.open()
      pw.document.write(receiptHtml)
      pw.document.close()
      pw.focus()
      setTimeout(() => { pw.print(); pw.close() }, 400)
    }

    const start = Date.now()
    const dur = 2400
    const iv = setInterval(() => {
      const p = Math.min((Date.now() - start) / dur, 1)
      setProgress(p)
      if (p >= 1) { clearInterval(iv); setPhase('done'); setTimeout(onDone, 1200) }
    }, 40)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}
    >
      {/* Hidden QR canvas — used to generate data URL */}
      <div ref={qrRef} style={{ position: 'absolute', left: -9999, top: -9999, opacity: 0, pointerEvents: 'none' }}>
        <QRCodeCanvas value={qrPayload} size={200} />
      </div>

      <AnimatePresence mode="wait">

        {phase === 'prompt' && (
          <motion.div
            key="prompt"
            initial={{ scale: 0.88, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
          >
            {/* Receipt paper preview */}
            <div style={{ width: 280, position: 'relative' }}>
              {/* Tear top */}
              <svg width="280" height="12" viewBox="0 0 280 12" style={{ display: 'block' }}>
                <path d={Array.from({ length: 14 }, (_, i) => {
                  const x = i * 20
                  return `${i === 0 ? 'M' : 'L'}${x},${i % 2 === 0 ? 0 : 10} L${x + 10},${i % 2 === 0 ? 10 : 0}`
                }).join(' ') + ' L280,0 Z'} fill="#1e2333" />
              </svg>

              <div style={{ background: '#f8f7f2', padding: '14px 18px 12px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14, color: '#0c0e14', letterSpacing: '0.15em' }}>PAYTRAQ</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 8, color: '#8a93a6', marginTop: 1 }}>Self-Service Terminal</div>
                  <div style={{ borderTop: '1px dashed #ccd', margin: '7px 0 5px' }} />
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 11, color: '#0c0e14' }}>{title}</div>
                </div>

                {/* Date / Txn */}
                <div style={{ fontFamily: 'monospace', fontSize: 8, color: '#8a93a6', display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span>{dateStr} {timeStr}</span>
                  <span>#{txnId}</span>
                </div>
                <div style={{ borderTop: '1px dashed #ccd', marginBottom: 6 }} />

                {/* Lines */}
                {lines.map((line, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#8a93a6' }}>{line.label}</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: line.highlight ? 700 : 400, fontSize: line.highlight ? 11 : 9, color: '#0c0e14' }}>{line.value}</span>
                  </div>
                ))}

                <div style={{ borderTop: '1px dashed #ccd', margin: '7px 0 8px' }} />

                {/* QR code */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  {qrDataUrl
                    ? <img src={qrDataUrl} alt="QR" style={{ width: 72, height: 72, imageRendering: 'pixelated' }} />
                    : <div style={{ width: 72, height: 72, background: '#e8eaf0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontFamily: 'monospace', fontSize: 8, color: '#8a93a6' }}>QR…</div>
                      </div>
                  }
                  <div style={{ fontFamily: 'monospace', fontSize: 7, color: '#8a93a6' }}>Scan for receipt data</div>
                </div>

                <div style={{ borderTop: '1px dashed #ccd', margin: '7px 0 6px' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 8, color: '#8a93a6' }}>Thank you for using Paytraq</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 7, color: '#aab0c0', marginTop: 1 }}>Powered by M-Pesa</div>
                </div>
              </div>

              {/* Tear bottom */}
              <svg width="280" height="12" viewBox="0 0 280 12" style={{ display: 'block', transform: 'scaleY(-1)' }}>
                <path d={Array.from({ length: 14 }, (_, i) => {
                  const x = i * 20
                  return `${i === 0 ? 'M' : 'L'}${x},${i % 2 === 0 ? 0 : 10} L${x + 10},${i % 2 === 0 ? 10 : 0}`
                }).join(' ') + ' L280,0 Z'} fill="#1e2333" />
              </svg>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <motion.button whileTap={{ scale: 0.93 }} onClick={handlePrint}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 14, cursor: 'pointer', background: 'linear-gradient(135deg, #00e5a0, #00a871)', border: 'none', color: '#000', fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 14, boxShadow: '0 6px 24px #00e5a040' }}>
                <Printer size={16} strokeWidth={2} />
                Print Receipt
              </motion.button>
              <motion.button whileTap={{ scale: 0.93 }} onClick={onDone}
                style={{ padding: '12px 24px', borderRadius: 14, cursor: 'pointer', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14 }}>
                Skip
              </motion.button>
            </div>
          </motion.div>
        )}

        {phase === 'printing' && (
          <motion.div key="printing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative', width: 100, height: 80 }}>
              <div style={{ width: 100, height: 54, borderRadius: 12, background: 'var(--surface)', border: '1.5px solid var(--border)', position: 'absolute', bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Printer size={28} color="#00e5a0" strokeWidth={1.5} />
                <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', width: 50, height: 4, borderRadius: 2, background: 'var(--border)' }} />
              </div>
              <motion.div animate={{ y: [0, -8, 0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity }}
                style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 44, height: 28, background: '#f8f7f2', borderRadius: '2px 2px 0 0', display: 'flex', flexDirection: 'column', gap: 3, padding: '4px 6px' }}>
                {[0,1,2].map(i => (
                  <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.5, delay: i * 0.15, repeat: Infinity }}
                    style={{ height: 2, borderRadius: 1, background: '#c4c9d4' }} />
                ))}
              </motion.div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#00e5a0' }}>Printing…</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{Math.round(progress * 100)}%</div>
            </div>
            <div style={{ width: 200, height: 5, borderRadius: 3, background: 'var(--surface-2)', overflow: 'hidden' }}>
              <motion.div animate={{ width: `${progress * 100}%` }} style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #00e5a0aa, #00e5a0)', boxShadow: '0 0 10px #00e5a060' }} />
            </div>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div key="done" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.4 }} style={{ color: '#00e5a0' }}>
              <CheckCircle size={60} strokeWidth={1.4} />
            </motion.div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#00e5a0' }}>Receipt Printed!</div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  )
}
