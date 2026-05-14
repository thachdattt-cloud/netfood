import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/useAuthStore'
import Navbar from './components/layout/Navbar'
import AdminSidebar from './components/layout/AdminSidebar'
import MenuPage from './pages/MenuPage'
import CartPage from './pages/CartPage'
import LoginPage from './pages/LoginPage'
import KitchenPage from './pages/kitchen/KitchenPage'
import StaffPage from './pages/staff/StaffPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminMenuPage from './pages/admin/AdminMenuPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminTablesPage from './pages/admin/AdminTablesPage'
import AdminStatsPage from './pages/admin/AdminStatsPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import OrderSuccessPage from './pages/OrderSuccessPage'

const ProtectedRoute = ({ roles }) => {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />
  return <Outlet />
}

const AdminLayout = () => (
  <div style={{ display: 'flex' }}>
    <AdminSidebar />
    <main style={{ marginLeft: 220, flex: 1, minHeight: '100vh' }}>
      <Outlet />
    </main>
  </div>
)

const UserLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
)

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e1e1e', color: '#f0f0f0', border: '1px solid #2a2a2a' },
        success: { iconTheme: { primary: '#22c55e', secondary: '#f0f0f0' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#f0f0f0' } }
      }} />
      <Routes>
        <Route element={<UserLayout />}>
          <Route path="/" element={<Navigate to="/menu" />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route element={<ProtectedRoute roles={['ADMIN', 'KITCHEN']} />}>
            <Route path="/kitchen" element={<KitchenPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={['ADMIN', 'STAFF']} />}>
            <Route path="/staff" element={<StaffPage />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/menu" element={<AdminMenuPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/tables" element={<AdminTablesPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/stats" element={<AdminStatsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}