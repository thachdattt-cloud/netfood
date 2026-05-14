import { useState, useEffect } from 'react'
import { getOrders, updateOrderStatus } from '../../services/order.service'
import socket from '../../services/socket'
import toast from 'react-hot-toast'

const STATUS_FLOW = {
  PENDING:   { label: 'Chờ xác nhận', next: 'CONFIRMED', nextLabel: '✅ Xác nhận đơn',    color: '#eab308', bg: '#2a2000' },
  CONFIRMED: { label: 'Đã xác nhận',  next: 'PREPARING', nextLabel: '👨‍🍳 Bắt đầu làm',   color: '#38bdf8', bg: '#001a2a' },
  PREPARING: { label: 'Đang làm',     next: 'READY',     nextLabel: '🔔 Xong, báo khách', color: '#ff6b2b', bg: '#1a0d00' },
  READY:     { label: 'Sẵn sàng',     next: null,        nextLabel: null,                  color: '#22c55e', bg: '#002a10' },
  DELIVERED: { label: 'Đã giao',      next: null,        nextLabel: null,                  color: '#888',    bg: '#1a1a1a' },
  CANCELLED: { label: 'Đã huỷ',       next: null,        nextLabel: null,                  color: '#ef4444', bg: '#2a0000' }
}

export default function KitchenPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('PENDING')

  useEffect(() => {
    fetchOrders()
    socket.emit('join_kitchen')

    socket.on('new_order', (order) => {
      setOrders(prev => [order, ...prev])
      toast(`🆕 Đơn mới — Máy ${order.table?.number}`, { icon: '🔔', duration: 6000 })
      // Rung chuông thông báo
      try { new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play() } catch {}
    })

    return () => socket.off('new_order')
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await getOrders({ limit: 100 })
      setOrders(res.data.data)
    } catch { toast.error('Không tải được đơn') }
    finally { setLoading(false) }
  }

  const handleUpdate = async (id, status) => {
    try {
      await updateOrderStatus(id, status)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
      toast.success('Cập nhật thành công!')
    } catch { toast.error('Cập nhật thất bại') }
  }

  // Bếp chỉ thấy đơn chưa giao (không thấy DELIVERED/CANCELLED)
  const visibleOrders = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status))
  const filtered = filter === 'ALL' ? visibleOrders : visibleOrders.filter(o => o.status === filter)

  const countByStatus = (s) => visibleOrders.filter(o => o.status === s).length

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800 }}>
            👨‍🍳 Màn hình Bếp
          </h1>
          <p style={{ color: '#888', marginTop: 4 }}>Nhận và xử lý đơn hàng realtime</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
          <span style={{ color: '#22c55e', fontSize: 13 }}>Đang kết nối</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { key: 'ALL',       label: 'Tất cả',        count: visibleOrders.length },
          { key: 'PENDING',   label: 'Chờ xác nhận',  count: countByStatus('PENDING') },
          { key: 'CONFIRMED', label: 'Đã xác nhận',   count: countByStatus('CONFIRMED') },
          { key: 'PREPARING', label: 'Đang làm',       count: countByStatus('PREPARING') },
          { key: 'READY',     label: 'Sẵn sàng giao', count: countByStatus('READY') },
        ].map(tab => (
          <button key={tab.key}
            className={`btn btn-sm ${filter === tab.key ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(tab.key)}>
            {tab.label}
            <span style={{ marginLeft: 6, background: filter === tab.key ? '#ffffff33' : '#ffffff11', padding: '1px 7px', borderRadius: 99, fontSize: 11 }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>Đang tải...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(order => {
            const st = STATUS_FLOW[order.status]
            const waitMins = Math.floor((Date.now() - new Date(order.createdAt)) / 60000)
            return (
              <div key={order.id} className="card" style={{ borderColor: st.color + '44', borderWidth: 1.5 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20 }}>
                      💻 Máy {order.table?.number}
                    </span>
                    <span style={{ color: '#555', fontSize: 12, marginLeft: 8 }}>#{order.id}</span>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: st.bg, color: st.color }}>
                    {st.label}
                  </span>
                </div>

                {/* Thời gian chờ */}
                <div style={{ marginBottom: 12 }}>
                  <span style={{
                    fontSize: 12, padding: '3px 10px', borderRadius: 99,
                    background: waitMins > 10 ? '#2a0000' : '#1a1a1a',
                    color: waitMins > 10 ? '#ef4444' : '#888'
                  }}>
                    ⏱ Chờ {waitMins} phút {waitMins > 10 ? '⚠️' : ''}
                  </span>
                </div>

                {/* Items */}
                <div style={{ marginBottom: 14 }}>
                  {order.items?.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #1e1e1e', fontSize: 14 }}>
                      <span>
                        <span style={{ fontWeight: 800, color: '#ff6b2b', marginRight: 8 }}>×{item.quantity}</span>
                        {item.menuItem?.name}
                      </span>
                      {item.note && <span style={{ fontSize: 11, color: '#888', fontStyle: 'italic' }}>{item.note}</span>}
                    </div>
                  ))}
                </div>

                {/* Ghi chú */}
                {order.note && (
                  <div style={{ background: '#1e1e1e', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 13, color: '#aaa' }}>
                    📝 {order.note}
                  </div>
                )}

                {/* Tổng + giờ */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 12, color: '#555' }}>{new Date(order.createdAt).toLocaleTimeString('vi-VN')}</span>
                  <span style={{ fontWeight: 800, color: '#ff6b2b' }}>{Number(order.total).toLocaleString('vi-VN')}đ</span>
                </div>

                {/* Action button — bếp chỉ xử lý đến READY */}
                {st.next && (
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => handleUpdate(order.id, st.next)}>
                    {st.nextLabel}
                  </button>
                )}

                {order.status === 'READY' && (
                  <div style={{ textAlign: 'center', padding: '10px', background: '#002a10', borderRadius: 8, color: '#22c55e', fontWeight: 600, fontSize: 14 }}>
                    ✅ Đã báo nhân viên mang ra
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <p>Không có đơn nào cần xử lý</p>
        </div>
      )}
    </div>
  )
}