import { HashRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import AppGrid from './components/AppGrid'
import LockScreen from './components/LockScreen'
import Vending from './apps/Vending'
import PoolTable from './apps/PoolTable'
import WashingMachine from './apps/WashingMachine'
import LiquidDispenser from './apps/LiquidDispenser'
import WarehouseWeight from './apps/WarehouseWeight'
import Addons from './apps/Addons'
import AflaBox from './apps/Addons/AflaBox'
import Livestock from './apps/Addons/Livestock'
import KPLCToken from './apps/Addons/KPLCToken'
import LockerRental from './apps/Addons/LockerRental'
import Parking from './apps/Addons/Parking'
import ColdStorage from './apps/Addons/ColdStorage'
import SoilAnalytics from './apps/SoilAnalytics'
import Support from './apps/Support'
import AdminApp from './admin'
import IdleReset from './components/IdleReset'

export default function App() {
  return (
    <HashRouter>
      <IdleReset />
      <LockScreen />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<AppGrid />} />
          <Route path="/vending" element={<Vending />} />
          <Route path="/pool" element={<PoolTable />} />
          <Route path="/washing" element={<WashingMachine />} />
          <Route path="/liquid" element={<LiquidDispenser />} />
          <Route path="/warehouse" element={<WarehouseWeight />} />
          <Route path="/addons" element={<Addons />} />
          <Route path="/addons/aflabox" element={<AflaBox />} />
          <Route path="/addons/livestock" element={<Livestock />} />
          <Route path="/addons/kplc" element={<KPLCToken />} />
          <Route path="/addons/lockers" element={<LockerRental />} />
          <Route path="/addons/parking" element={<Parking />} />
          <Route path="/addons/coldstorage" element={<ColdStorage />} />
          <Route path="/soil" element={<SoilAnalytics />} />
          <Route path="/support" element={<Support />} />
          <Route path="/admin" element={<AdminApp />} />
        </Routes>
      </AnimatePresence>
    </HashRouter>
  )
}
