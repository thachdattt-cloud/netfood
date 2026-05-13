import { useState, useEffect } from 'react'
import { getOrders } from '../../services/order.service'

export default function AdminStatsPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('today')

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    try {
      const res = await getOrders({ limit: 500 })
      setOrders(res.data.data)
    } finally { setLoading(false) }
  }

  const now = new Date()

  const filterByPeriod = (orders) => {
    return orders.filter(o => {
      const d = new Date(o.createdAt)
      if (period === 'today') return d.toDateString() === now.toDateString()
      if (period === 'week') return (now - d) < 7 * 86400000
      if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      return true
    }).filter(o => o.status !== 'CANCELLED')
  }

  const filtered = filterByPeriod(orders)
  const revenue = filtered.reduce((s, o) => s + Number(o.total), 0)
  const avgOrder = filtered.length ? revenue / filtered.length : 0

  // Doanh thu theo giờ (hôm nay)
  const hourlyData = Array.from({ length: 24 }, (_, h) => {
    const hourOrders = orders.filter(o => {
      const d = new Date(o.createdAt)
      return d.toDateString() === now.toDateString() && d.getHours() === h && o.status !== 'CANCELLED'
    })
    return { hour: h, revenue: hourOrders.reduce((s, o) => s + Number(o.total), 0), count: hourOrders.length }
  })

  const maxRevenue = Math.max(...hourlyData.map(d => d.revenue), 1)

  // Top món bán chạy
  const itemCount = {}
  filtered.forEach(order => {
    order.items?.forEach(item => {
      const name = item.menuItem?.name || 'Unknown'
      itemCount[name] = (itemCount[name] || 0) + item.quantity
    })
  })
  const topItems = Object.entries(itemCount).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Doanh thu theo trạng thái
  const statusCount = {}
  filtered.forEach(o => { statusCount[o.status] = (statusCount[o.status] || 0) + 1 })

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800 }}>📊 Thống kê doanh thu</h1>
          <p style={{ color: '#888', marginTop: 4 }}>Phân tích hoạt động kinh doanh</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['today', 'Hôm nay'], ['week', '7 ngày'], ['month', 'Tháng này'], ['all', 'Tất cả']].map(([val, label]) => (
            <button key={val} className={`btn btn-sm ${period === val ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setPeriod(val)}>{label}</button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Tổng đơn hàng', value: filtered.length, icon: '📋', color: '#38bdf8' },
          { label: 'Doanh thu', value: revenue.toLocaleString('vi-VN') + 'đ', icon: '💰', color: '#22c55e' },
          { label: 'Đơn TB', value: Math.round(avgOrder).toLocaleString('vi-VN') + 'đ', icon: '📈', color: '#a78bfa' },
          { label: 'Đơn chờ', value: orders.filter(o => o.status === 'PENDING').length, icon: '⏳', color: '#ff6b2b' }
        ].map((s, i) => (
          <div key={i} className="card" style={{ borderLeft: `3px solid ${s.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#888', fontSize: 13 }}>{s.label}</span>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
            </div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Biểu đồ doanh thu theo giờ */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 20 }}>
            📈 Doanh thu theo giờ (hôm nay)
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 180, paddingBottom: 28, position: 'relative' }}>
            {hourlyData.map(d => (
              <div key={d.hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                  {d.count > 0 && (
                    <div style={{
                      position: 'absolute', bottom: '100%', marginBottom: 4,
                      background: '#1e1e1e', border: '1px solid #2a2a2a',
                      borderRadius: 6, padding: '3px 6px', fontSize: 10, whiteSpace: 'nowrap',
                      color: '#ff6b2b', fontWeight: 600, zIndex: 1
                    }}>
                      {(d.revenue / 1000).toFixed(0)}k
                    </div>
                  )}
                  <div style={{
                    width: '80%', height: Math.max(4, (d.revenue / maxRevenue) * 140),
                    background: d.revenue > 0 ? 'linear-gradient(to top, #ff6b2b, #ffb347)' : '#1e1e1e',
                    borderRadius: '4px 4px 0 0', transition: 'height 0.3s'
                  }} />
                </div>
                <span style={{ fontSize: 9, color: '#555', position: 'absolute', bottom: 6 }}>
                  {d.hour}h
                </span>
              </div>
            ))}
          </div>
          {hourlyData.every(d => d.revenue === 0) && (
            <p style={{ textAlign: 'center', color: '#555', fontSize: 13, marginTop: 8 }}>Chưa có đơn hàng hôm nay</p>
          )}
        </div>

        {/* Top món + trạng thái */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Top món */}
          <div className="card">
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 16 }}>🏆 Top món bán chạy</h3>
            {topItems.length === 0 ? (
              <p style={{ color: '#555', fontSize: 13 }}>Chưa có dữ liệu</p>
            ) : topItems.map(([name, count], i) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{
                  width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                  background: i === 0 ? '#2a1a00' : i === 1 ? '#1a1a2a' : '#1a1a1a',
                  color: i === 0 ? '#ffb347' : i === 1 ? '#94a3b8' : '#888'
                }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{name}</p>
                  <div style={{ height: 4, background: '#1e1e1e', borderRadius: 2 }}>
                    <div style={{
                      height: '100%', borderRadius: 2,
                      background: i === 0 ? '#ff6b2b' : '#2a2a2a',
                      width: `${(count / topItems[0][1]) * 100}%`
                    }} />
                  </div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#ff6b2b' }}>{count}</span>
              </div>
            ))}
          </div>

          {/* Trạng thái đơn */}
          <div className="card">
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 16 }}>📦 Theo trạng thái</h3>
            {Object.entries(statusCount).map(([status, count]) => (
              <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e1e1e', fontSize: 14 }}>
                <span style={{ color: '#888' }}>{status}</span>
                <span style={{ fontWeight: 700 }}>{count}</span>
              </div>
            ))}
            {Object.keys(statusCount).length === 0 && <p style={{ color: '#555', fontSize: 13 }}>Chưa có dữ liệu</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
