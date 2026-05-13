import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getOrders } from '../../services/order.service'
import { getMenuItems } from '../../services/menu.service'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, pending: 0, items: 0 })
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    const fetchStats = async () => {
      const [ordersRes, menuRes] = await Promise.all([
        getOrders({ limit: 10 }),
        getMenuItems({ limit: 1 })
      ])
      const orders = ordersRes.data.data
      setRecentOrders(orders)
      setStats({
        orders: ordersRes.data.pagination?.total || 0,
        revenue: orders.reduce((s, o) => s + Number(o.total), 0),
        pending: orders.filter(o => o.status === 'PENDING').length,
        items: menuRes.data.pagination?.total || 0
      })
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: 'Tổng đơn hàng', value: stats.orders, icon: '📋', color: '#38bdf8' },
    { label: 'Doanh thu hôm nay', value: stats.revenue.toLocaleString('vi-VN') + 'đ', icon: '💰', color: '#22c55e' },
    { label: 'Đơn chờ xử lý', value: stats.pending, icon: '⏳', color: '#ff6b2b' },
    { label: 'Số món trong menu', value: stats.items, icon: '🍽️', color: '#a78bfa' }
  ]

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
          📊 Dashboard
        </h1>
        <p style={{ color: '#888' }}>Tổng quan hoạt động của quán</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
        {statCards.map((s, i) => (
          <div key={i} className="card" style={{ borderLeft: `3px solid ${s.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ color: '#888', fontSize: 13 }}>{s.label}</span>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
            </div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 32 }}>
        {[
          { to: '/admin/menu', label: 'Quản lý Menu', icon: '🍜' },
          { to: '/admin/orders', label: 'Quản lý Đơn', icon: '📋' },
          { to: '/admin/tables', label: 'Quản lý Máy', icon: '💻' },
          { to: '/kitchen', label: 'Màn hình Bếp', icon: '👨‍🍳' }
        ].map((link, i) => (
          <Link key={i} to={link.to} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff6b2b'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.transform = 'none' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{link.icon}</div>
              <p style={{ fontWeight: 600, fontSize: 14 }}>{link.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card">
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 20 }}>Đơn hàng gần đây</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                {['#', 'Máy', 'Tổng tiền', 'Trạng thái', 'Thời gian'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#888', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #1e1e1e' }}>
                  <td style={{ padding: '10px 12px', color: '#888' }}>#{order.id}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>Máy {order.table?.number}</td>
                  <td style={{ padding: '10px 12px', color: '#ff6b2b', fontWeight: 600 }}>
                    {Number(order.total).toLocaleString('vi-VN')}đ
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#666', fontSize: 13 }}>
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
