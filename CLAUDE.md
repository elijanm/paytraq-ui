# CLAUDE.md — Paytraq

## Project Overview

**Paytraq** is a full-screen touch kiosk application targeting a **3.5" capacitive display at 800×480px** running on Raspberry Pi. It is a mini-app launcher housing multiple self-service payment terminals. All transactions simulate M-Pesa Express (STK Push) checkout — users either scan a QR code or enter a phone number; the machine then simulates dispensing/activating on payment confirmation.

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | React + TypeScript | Vite for bundling |
| Styling | Tailwind CSS + CSS custom properties | No Inter/Roboto — use `Nunito` + `Space Mono` |
| State | Zustand | Lightweight, no boilerplate |
| Routing | React Router v6 | Hash-based (`HashRouter`) for Electron/kiosk |
| Icons | Lucide React | Fall back to local `/icons/<AppName>.png` if available |
| QR Scan | `@zxing/browser` | Webcam-based QR code reader |
| QR Generate | `qrcode.react` | For showing payment QR |
| Animation | Framer Motion | Page transitions + dispensing animations |
| Touch | `react-use-gesture` | Swipe/drag for cart |

---

## Screen Constraints — Critical

```
Viewport: 800 × 480px (fixed, no scroll)
Touch: Capacitive, 5-point
Font minimum: 14px body, 18px buttons (fat finger targets)
Button minimum: 48 × 48px touch area
Avoid: Hover-only states, tiny tap targets, scrollable nested lists
All pages MUST fit within 800×480 without outer scroll
```

Use `html, body { width: 800px; height: 480px; overflow: hidden; }` and design every screen to fit this box exactly.

---

## App Architecture

```
src/
├── main.tsx
├── App.tsx                  # Root router
├── theme.css                # CSS variables, font imports
├── store/
│   ├── cartStore.ts         # Vending cart state
│   └── paymentStore.ts      # M-Pesa STK simulation state
├── components/
│   ├── AppGrid.tsx          # Home screen mini-app launcher
│   ├── BackButton.tsx       # Consistent back navigation
│   ├── MpesaCheckout.tsx    # Shared checkout modal (QR + phone)
│   └── DispensingScreen.tsx # Shared post-payment animation
├── apps/
│   ├── Vending/
│   │   ├── index.tsx        # Grid of items
│   │   ├── CartDrawer.tsx   # Slide-up cart
│   │   └── items.ts         # Static product data
│   ├── PoolTable/
│   │   └── index.tsx
│   ├── WashingMachine/
│   │   └── index.tsx
│   ├── LiquidDispenser/
│   │   └── index.tsx
│   ├── WarehouseWeight/
│   │   └── index.tsx        # Coming soon
│   └── Addons/
│       ├── index.tsx        # 6-slot addon grid
│       └── AflaBox/
│           └──link to a page    # AflaBox mini-app
└── public/
    └── icons/               # Drop <AppName>.png here to override default icon
        ├── Vending.png
        ├── PoolTable.png
        └── ...
```

---

## Home Screen — `AppGrid.tsx`

Displays a **2×3 grid** of mini-app tiles centered in the 800×480 viewport.

### App Tiles

| Slot | App Name | Default Icon (Lucide) | Route |
|---|---|---|---|
| 1 | Vending | `ShoppingCart` | `/vending` |
| 2 | Washing Machine | `Wind` | `/washing` |
| 3 | Pool Table | `Circle` (billiard style) | `/pool` |
| 4 | Liquid Dispenser | `Droplets` | `/liquid` |
| 5 | Warehouse Weight | `Scale` | `/warehouse` |
| 6 | Addons | `LayoutGrid` | `/addons` |

### Icon Resolution Logic

```tsx
// For each app, check if /icons/<AppName>.png exists; if so use it, else use Lucide icon
function AppIcon({ name, LucideIcon }: { name: string; LucideIcon: React.FC }) {
  const [hasCustom, setHasCustom] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.onload = () => setHasCustom(true);
    img.onerror = () => setHasCustom(false);
    img.src = `/icons/${name}.png`;
  }, [name]);
  return hasCustom
    ? <img src={`/icons/${name}.png`} className="w-14 h-14 object-contain" />
    : <LucideIcon size={56} />;
}
```

### Tile Design

- Card size: ~220×160px with 24px gap
- Bold app name below icon, 18px `Space Mono`
- Colored accent per app (defined in theme)
- Framer Motion: `whileTap={{ scale: 0.94 }}`, staggered entrance `delay: index * 0.05`
- Dark slate background (`#0f1117`), cards with subtle glow border

---

## Shared M-Pesa Checkout Flow — `MpesaCheckout.tsx`

Used by **all payment apps**. Receives `amount`, `description`, `onSuccess`, `onCancel` as props.

### Checkout Modal Steps

```
Step 1: AMOUNT CONFIRM
  - Show item summary + total
  - Two CTA buttons: [Scan QR Code] [Enter Phone Number]

Step 2A: QR SCAN
  - Show QR code containing a payment URL / session token
  - Camera feed overlay with scan animation (zxing)
  - On scan → parse phone from QR payload → go to Step 3

Step 2B: PHONE ENTRY
  - Numpad (large, touch-friendly, 800×480 safe)
  - Format: +254 7XX XXX XXX
  - [Send STK Push] button

Step 3: STK PUSH SENT
  - Animated spinner + "Check your phone for M-Pesa prompt"
  - Show amount again
  - Simulate: after 4s auto-resolve → call onSuccess()
  - [Cancel] if user wants to abort

Step 4: onSuccess → navigate to DispensingScreen
```

### Simulated STK Logic

```ts
// paymentStore.ts
simulateSTK: async (phone: string, amount: number) => {
  set({ status: 'pending', phone, amount });
  await delay(4000); // simulate network round-trip
  // 90% success, 10% failure for realism
  const success = Math.random() > 0.1;
  set({ status: success ? 'success' : 'failed' });
  return success;
}
```

---

## Dispensing Screen — `DispensingScreen.tsx`

Shown after successful payment. Receives `type: 'vending' | 'pool' | 'washing' | 'liquid'`.

- Full 800×480 overlay
- Animated progress bar (3–8 seconds depending on type)
- Type-specific animation:
  - **Vending**: Items falling/dropping animation
  - **Pool**: Billiard ball rolling graphic
  - **Washing**: Rotating drum animation (CSS)
  - **Liquid**: Filling bar/glass animation
- "Thank you! Come again" after complete
- Auto-return to home after 5s idle

---

## Mini-App Specifications

---

### 1. Vending — `/vending`

**Layout**: Fixed 800×480. Top bar (logo + cart icon with count). Main: scrollable grid of item cards within a `400×380px` constrained area. Bottom: sticky "View Cart" button if cart > 0.

**Item Card** (~170×130px):
- Item image (80×60px)
- Name (14px)
- Price (KES XX.00, bold, accent color)
- `+` / `-` quantity controls

**Cart Drawer** (slide up from bottom, 800×220px):
- List of items with quantities and subtotals
- Total
- [Checkout] → opens `MpesaCheckout` with total amount

**Data model**:
```ts
interface VendingItem {
  id: string;
  name: string;
  price: number;      // KES
  image?: string;     // /products/<id>.jpg
  category: string;
  stock: number;
}
```

**Static seed data** (10–12 items): Soda, Water, Juice, Crisps, Chocolate, etc. with placeholder images or emoji fallbacks.

---

### 2. Pool Table — `/pool`

**Layout**: Center-focused, single screen.

- Large billiard table illustration or icon (top half)
- "Select number of games" stepper: `[ − ]  3  [ + ]`
- Price display: `3 games × KES 50 = KES 150`
- Price per game: KES 50 (configurable constant)
- [Play Now] → `MpesaCheckout` → `DispensingScreen` (unlocks table animation)

**Dispensing for pool**: Show "Table unlocked! Enjoy your X games 🎱" with animated balls.

---

### 3. Washing Machine — `/washing`

**Layout**: Center-focused, two modes.

- Toggle at top: `[Washer]` `[Dryer]`
- Amount input (numpad or slider): Enter KES amount
- Live display: "KES 100 → 45 minutes" (rate: 1 KES = ~0.45 min, configurable)
- Pricing constants:
  ```ts
  const WASHER_RATE = 0.45; // minutes per KES
  const DRYER_RATE  = 0.35; // minutes per KES
  ```
- Selected machine display (animated drum icon)
- [Start] → `MpesaCheckout` → `DispensingScreen`

**Dispensing for washing**: Rotating drum CSS animation with countdown timer showing remaining minutes.

---

### 4. Liquid Dispenser — `/liquid`

**Layout**: Similar to Washing Machine.

- Liquid type selector: 4 buttons (Water, Juice, Milk, Other) — icons
- Volume selector: 250ml / 500ml / 1L / Custom
- Price display: auto-calculated from volume + type rate
- Pricing:
  ```ts
  const LIQUID_PRICES: Record<string, number> = {
    Water: 2,   // KES per 100ml
    Juice: 8,
    Milk:  6,
    Other: 4,
  };
  ```
- [Dispense] → `MpesaCheckout` → `DispensingScreen`

**Dispensing for liquid**: Filling glass animation (CSS clip-path fill), liters counter ticking up.

---

### 5. Warehouse Weight — `/warehouse`

Full 800×480 "Coming Soon" page.

- Centered scale/weight icon (large, 120px)
- Title: "Warehouse Weight"
- Subtitle: "Coming Soon — Integration in progress"
- Animated pulsing dots or progress indicator
- [Back] button
- Accent color: amber/orange

---

### 6. Addons — `/addons`

**Layout**: 2×3 grid (same structure as home screen).

| Slot | App Name | Icon | Route |
|---|---|---|---|
| 1 | AflaBox | `/icons/AflaBox.png` or `Tv` | `/addons/aflabox` |
| 2–6 | (Empty) | `Plus` icon | No-op tap → toast "Coming Soon" |

Empty slots: dashed border card with centered `+` icon and "Add App" label. Tapping shows a `<Toast>` "Module coming soon".

#### AflaBox — `/addons/aflabox`

A sub-mini-app for AflaBox content/TV streaming terminal:
- Grid of content packages (Daily/Weekly/Monthly)
- Pricing per package
- [Subscribe] → shared `MpesaCheckout`
- Design: dark theme with AflaBox brand accent (use AflaBox logo from `/icons/AflaBox.png`)

---

## Theme & Design System

```css
/* theme.css */
:root {
  --bg:          #0c0e14;
  --surface:     #161924;
  --surface-2:   #1e2333;
  --border:      #2a3045;
  --text:        #e8ecf5;
  --text-muted:  #6b7a9e;

  /* App accent colors */
  --vending:     #22d3a5;
  --pool:        #a78bfa;
  --washing:     #38bdf8;
  --liquid:      #fb923c;
  --warehouse:   #f59e0b;
  --addons:      #f472b6;
  --mpesa:       #4caf50;

  --radius:      12px;
  --radius-lg:   18px;
  --font-display: 'Space Mono', monospace;
  --font-body:    'Nunito', sans-serif;
}
```

**Google Fonts import**:
```html
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

---

## Navigation Rules

- All mini-apps have a **Back button** (top-left, 48×48px min) returning to `/`
- Back from checkout modal → returns to the mini-app (not home)
- Back from dispensing screen → goes to `/` (transaction complete)
- No browser chrome — kiosk mode (`--kiosk` Chromium flag)
- No scroll bars visible (`scrollbar-width: none`)

---

## Raspberry Pi Deployment

```bash
# Install Chromium kiosk auto-start
# /etc/xdg/lxsession/LXDE-pi/autostart
@chromium-browser \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --check-for-update-interval=31536000 \
  --window-size=800,480 \
  --app=http://localhost:3000

# Build
npm run build
# Serve locally
npx serve -s dist -l 3000

# Or use electron-builder for fully offline kiosk
```

**Touch calibration**: Ensure `xinput` is configured for your specific 3.5" panel (common: Waveshare, Elecrow). Add udev rules if needed for `/dev/input/eventX`.

---

## Environment Variables

```env
VITE_MPESA_SIMULATE=true          # Use simulated STK (no real API calls)
VITE_MPESA_SHORTCODE=174379       # For future real integration
VITE_CURRENCY=KES
VITE_POOL_PRICE_PER_GAME=50
VITE_WASHER_RATE=0.45
VITE_DRYER_RATE=0.35
```

---

## Coding Standards

- All components typed with TypeScript interfaces
- No `any` types
- Zustand stores typed with interfaces
- All prices in integer cents (KES × 100) internally, display formatted as `KES XX.00`
- No external API calls except simulated STK store
- All assets in `/public/` — no CDN dependencies for offline kiosk resilience
- Framer Motion for all page transitions: `{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } }`
- `AnimatePresence` wrapping router outlet for smooth app-to-app transitions

---

## Key UX Rules (Touch Kiosk)

1. **No hover states as primary affordance** — all interactive states must work on tap
2. **Minimum 48px tap targets** — use padding to inflate small icons
3. **No nested scroll** — every screen fits in 800×480 fixed
4. **Timeout / idle reset** — after 90s inactivity, return to home screen
5. **Prevent right-click and text selection** — `user-select: none` globally
6. **Loading states** — every async action shows immediate visual feedback
7. **Large numpad for phone entry** — full-width, generous key sizes (~100×60px per key)
8. **High contrast text** — minimum 4.5:1 ratio against backgrounds

---

## Future Extensions (Stub Ready)

- Real M-Pesa Daraja API integration (replace `simulateSTK`)
- IoT GPIO signals to Raspberry Pi pins on payment success (dispensing hardware trigger)
- Admin panel (PIN-locked, `/admin`) for price configuration
- Transaction log to local SQLite via Electron IPC or Node.js sidecar
- Offline queue for payments when network unavailable
