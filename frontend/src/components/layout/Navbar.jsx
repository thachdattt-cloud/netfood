import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useCartStore } from '../../store/useCartStore'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { items } = useCartStore()
  const navigate = useNavigate()
  const totalItems = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid #f0e8e0',
      padding: '0 32px', height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 2px 12px #0001'
    }}>
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 26 }}>🍜</span>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#ff6b2b' }}>
          NetFood
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user ? (
          <>
            <span style={{ color: '#888', fontSize: 14 }}>Xin chào, {user.name}</span>
            {user.role === 'ADMIN' && (
              <Link to="/admin" style={{
                textDecoration: 'none', padding: '7px 16px', borderRadius: 8,
                border: '1.5px solid #e0d8d0', color: '#444', fontSize: 14, fontWeight: 500
              }}>Admin</Link>
            )}
            {user.role === 'KITCHEN' && (
              <Link to="/kitchen" style={{
                textDecoration: 'none', padding: '7px 16px', borderRadius: 8,
                border: '1.5px solid #e0d8d0', color: '#444', fontSize: 14, fontWeight: 500
              }}>Bếp</Link>
            )}
            <button onClick={() => { logout(); navigate('/') }} style={{
              padding: '7px 16px', borderRadius: 8, border: '1.5px solid #e0d8d0',
              background: 'white', color: '#444', fontSize: 14, fontWeight: 500, cursor: 'pointer'
            }}>Đăng xuất</button>
          </>
        ) : (
          <Link to="/login" style={{
            textDecoration: 'none', padding: '7px 16px', borderRadius: 8,
            border: '1.5px solid #e0d8d0', color: '#444', fontSize: 14, fontWeight: 500
          }}>Đăng nhập</Link>
        )}

        <Link to="/cart" style={{
          textDecoration: 'none', position: 'relative',
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#ff6b2b', color: 'white',
          padding: '8px 20px', borderRadius: 99, fontSize: 14, fontWeight: 700,
          boxShadow: '0 4px 12px #ff6b2b44'
        }}>
          🛒 Giỏ hàng
          {totalItems > 0 && (
            <span style={{
              background: 'white', color: '#ff6b2b',
              borderRadius: '50%', width: 22, height: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800
            }}>{totalItems}</span>
          )}
        </Link>
      </div>
    </nav>
  )
}