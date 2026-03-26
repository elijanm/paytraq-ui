# PayTraq — Self-Service Kiosk Platform

A full-screen touch kiosk application built for a **3.5" capacitive display (800×480 px)** running on Raspberry Pi. PayTraq is a mini-app launcher housing multiple self-service payment terminals, all backed by a simulated M-Pesa Express (STK Push) checkout flow.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript (Vite) |
| Styling | Tailwind CSS + CSS custom properties |
| Fonts | Nunito (body) · Space Mono (display/monospace) |
| State | Zustand |
| Routing | React Router v6 (HashRouter) |
| Animation | Framer Motion |
| Icons | Lucide React |
| QR Scan | `@zxing/browser` |
| QR Generate | `qrcode.react` |

---

## Getting Started

```bash
npm install
npm run dev          # dev server at http://localhost:5173
npm run build        # production build → dist/
npm run preview      # preview the production build
```

---

## Mini-Apps

### Page 1

| App | Route | Description |
|---|---|---|
| Vending | `/vending` | Grid of products with cart, age verification for restricted items, sequential dispensing, and itemised receipt with configurable tax |
| Washing Machine | `/washing` | Washer / dryer time calculator — pay by KES amount, time calculated by rate |
| Pool Table | `/pool` | Game selector (stepper), price preview, table unlock animation on payment |
| Liquid Dispenser | `/liquid` | Select liquid type (Water, Cooking Oil, Juice, Milk), enter amount, volume calculated by rate |

### Page 2

| App | Route | Description |
|---|---|---|
| Warehouse Weight | `/warehouse` | Coming Soon placeholder |
| Soil Analytics | `/soil` | Zone selector with pH, moisture, nitrogen, temperature metrics, 7-day rain prediction chart, and live weather strip |
| Addons | `/addons` | Sub-app launcher: AflaBox, KPLC Token, Livestock, Locker Rental, Parking, Cold Storage |
| Support | `/support` | AI voice agent orb with quick-question chips and typewriter response simulation |

---

## Payment Flow

All apps share a common M-Pesa checkout modal (`MpesaCheckout`):

1. **Amount confirm** — item summary + total
2. **QR scan** or **phone number entry** (large touch numpad)
3. **STK Push sent** — 4-second simulated network round-trip (90% success rate)
4. **Dispensing screen** — type-specific animation (items, drum, ball, liquid fill)

---

## Age Verification (Vending)

When an age-restricted item (e.g. Beer, Wine, Whiskey) is in the cart, checkout is intercepted with a camera-based verification flow:

1. ID front scan
2. ID back scan
3. Blink detection
4. Look right / Look left (anti-spoofing)
5. Processing → Verified or Rejected

Each step uses a live webcam feed with an SVG overlay guide and a RAF-driven progress ring.

---

## Admin Panel

Access: tap the **PayTraq logo** on the home screen, or **long-press the back button** (900 ms) when in single-app mode.

Login via **PIN** (default: `1234`) or simulated **QR scan**.

### Admin tabs

| Tab | Features |
|---|---|
| Analytics | Revenue by day (bar chart), breakdown by app, recent transactions. Filter: Today / 7d / 30d |
| App Config | Toggle app visibility on home grid. Enable single-app mode (kiosk locks to one app). |
| App Settings | Per-app configuration — pool price per game, washer/dryer rate, liquid prices, vending tax rate, soil subscription price |
| System | Timezone, idle timeout, device info, reload kiosk. **Battery tab** includes a Shutdown button. |

---

## Shutdown Flow

Battery tab → **Shutdown Device** triggers a full-screen shutdown sequence:

1. Step log animates through: sync → flush log → close apps → save state → unmount → complete
2. Atomic **P** logo with three orbiting electron rings fades in
3. Screen fades to black after 10 seconds

---

## Screen Constraints

```
Viewport : 800 × 480 px  (fixed, no outer scroll)
Touch    : Capacitive 5-point
Min font : 14 px body · 18 px buttons
Min tap  : 48 × 48 px touch area
```

---

## Project Structure

```
src/
├── App.tsx                      # Root router
├── theme.css                    # CSS variables + font imports
├── store/
│   ├── adminStore.ts            # Admin config, app settings, analytics
│   ├── cartStore.ts             # Vending cart state
│   ├── lockStore.ts             # Lock screen state
│   └── paymentStore.ts          # M-Pesa STK simulation
├── components/
│   ├── AppGrid.tsx              # Home screen page-swipeable grid
│   ├── BackButton.tsx           # Back nav (long-press → admin in single-app mode)
│   ├── DispensingScreen.tsx     # Shared post-payment animation
│   ├── IdleReset.tsx            # Auto-return to home after inactivity
│   ├── LockScreen.tsx           # Inactivity lock with atomic P logo + clock
│   ├── MpesaCheckout.tsx        # Shared M-Pesa checkout modal
│   ├── PrintReceiptModal.tsx    # Thermal receipt preview + print
│   └── StatusMenu.tsx           # WiFi + Battery dropdown (includes shutdown)
├── apps/
│   ├── Vending/
│   │   ├── index.tsx
│   │   ├── AgeVerification.tsx
│   │   ├── CartDrawer.tsx
│   │   ├── VendingDispensing.tsx
│   │   └── items.ts
│   ├── PoolTable/index.tsx
│   ├── WashingMachine/index.tsx
│   ├── LiquidDispenser/index.tsx
│   ├── WarehouseWeight/index.tsx
│   ├── SoilAnalytics/index.tsx
│   ├── Support/index.tsx
│   └── Addons/
│       ├── index.tsx
│       ├── AflaBox/index.tsx
│       ├── KPLCToken/index.tsx
│       ├── Livestock/index.tsx
│       ├── LockerRental/index.tsx
│       ├── Parking/index.tsx
│       └── ColdStorage/index.tsx
└── admin/
    ├── index.tsx
    ├── AdminLogin.tsx           # PIN + QR login
    ├── AdminDashboard.tsx
    └── tabs/
        ├── Analytics.tsx
        ├── AppConfig.tsx
        ├── AppSettings.tsx
        └── SystemSettings.tsx
public/
├── icons/                       # Drop <AppName>.png here to override Lucide icon
└── products/                    # Product images for vending items
```

---

## Custom App Icons

Drop a PNG at `public/icons/<AppName>.png` to override the default Lucide icon for any tile:

```
public/icons/Vending.png
public/icons/PoolTable.png
public/icons/WashingMachine.png
public/icons/LiquidDispenser.png
public/icons/WarehouseWeight.png
public/icons/SoilAnalytics.png
public/icons/Addons.png
public/icons/Support.png
public/icons/AflaBox.png
```

---

## Raspberry Pi Deployment

```bash
npm run build

# Serve locally
npx serve -s dist -l 3000

# Chromium kiosk autostart — /etc/xdg/lxsession/LXDE-pi/autostart
@chromium-browser \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --check-for-update-interval=31536000 \
  --window-size=800,480 \
  --app=http://localhost:3000
```

---

## Environment Variables

Create a `.env` file at the project root:

```env
VITE_MPESA_SIMULATE=true
VITE_MPESA_SHORTCODE=174379
VITE_CURRENCY=KES
VITE_POOL_PRICE_PER_GAME=50
VITE_WASHER_RATE=0.45
VITE_DRYER_RATE=0.35
```

---

## Future Extensions

- Real M-Pesa Daraja API (replace `simulateSTK`)
- GPIO signals to Raspberry Pi pins on payment success (hardware dispense trigger)
- Admin panel PIN change + remote access
- Transaction log to local SQLite via Electron IPC or Node.js sidecar
- Offline payment queue for low-connectivity environments
