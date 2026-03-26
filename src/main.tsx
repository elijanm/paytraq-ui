import React from 'react'
import ReactDOM from 'react-dom/client'
import './theme.css'
import App from './App'

// Scale the 800×480 kiosk canvas to fit any viewport.
// Never scale above 1 — only shrink to fit smaller windows.
function applyKioskScale() {
  const root = document.getElementById('root')
  if (!root) return
  const scaleX = window.innerWidth  / 800
  const scaleY = window.innerHeight / 480
  const scale  = Math.min(1, scaleX, scaleY)   // cap at 1.0 — never upscale
  root.style.transform        = `scale(${scale})`
  root.style.transformOrigin  = 'top left'
}
applyKioskScale()
window.addEventListener('resize', applyKioskScale)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
