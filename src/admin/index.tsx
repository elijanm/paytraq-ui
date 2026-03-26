import { useAdminStore } from '../store/adminStore'
import AdminLogin     from './AdminLogin'
import AdminDashboard from './AdminDashboard'

export default function AdminApp() {
  const isLoggedIn = useAdminStore(s => s.isLoggedIn)
  return isLoggedIn ? <AdminDashboard /> : <AdminLogin />
}
