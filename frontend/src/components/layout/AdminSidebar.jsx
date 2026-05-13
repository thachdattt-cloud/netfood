import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

const links = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/menu', label: 'Quản lý Menu', icon: '🍜' },
  { to: '/admin/orders', label: 'Đơn hàng', icon: '📋' },
  { to: '/admin/tables', label: 'Quản lý Máy', icon: '💻' },
  { to: '/admin/stats', label: 'Thống kê', icon: '📈' },
  { to: '/kitchen', label: 'Màn hình Bếp', icon: '👨‍🍳' }
]

export default function AdminSidebar() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  return (
    <aside style={{
      width: 220, background: '#0d0d0d', borderRight: '1px solid #1e1e1e',
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, zIndex: 50, paddingTop: 20
    }}>
      <div style={{ padding: '12px 20px 24px', borderBottom: '1px solid #1e1e1e' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#ff6b2b' }}>🍜 NetFood</span>
        <p style={{ fontSize: 11, color: '#555', marginTop: 4 }}>Admin Panel</p>
      </div>

      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {links.map(link => (
          <NavLink key={link.to} to={link.to} end={link.end} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, marginBottom: 4,
                background: isActive ? '#1a0d00' : 'transparent',
                color: isActive ? '#ff6b2b' : '#888',
                fontWeight: isActive ? 600 : 400, fontSize: 14,
                transition: 'all 0.15s', cursor: 'pointer'
              }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#141414'; e.currentTarget.style.color = '#f0f0f0' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888' } }}>
                <span style={{ fontSize: 16 }}>{link.icon}</span>
                {link.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '16px 10px', borderTop: '1px solid #1e1e1e' }}>
        <button className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => { logout(); navigate('/') }}>
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
