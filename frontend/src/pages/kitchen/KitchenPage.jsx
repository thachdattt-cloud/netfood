import { useState, useEffect } from 'react'
import { getOrders, updateOrderStatus } from '../../services/order.service'
import socket from '../../services/socket'
import toast from 'react-hot-toast'

const STATUS_FLOW = {
  PENDING: { label: 'Chờ xác nhận', next: 'CONFIRMED', nextLabel: 'Xác nhận', color: '#eab308', bg: '#2a2000' },
  CONFIRMED: { label: 'Đã xác nhận', next: 'PREPARING', nextLabel: 'Bắt đầu làm', color: '#38bdf8', bg: '#001a2a' },
  PREPARING: { label: 'Đang làm', next: 'READY', nextLabel: 'Xong — báo khách', color: '#ff6b2b', bg: '#1a0d00' },
  READY: { label: 'Sẵn sàng phục vụ', next: 'DELIVERED', nextLabel: 'Đã giao', color: '#22c55e', bg: '#002a10' },
  DELIVERED: { label: 'Đã giao', next: null, color: '#888', bg: '#1a1a1a' },
  CANCELLED: { label: 'Đã huỷ', next: null, color: '#ef4444', bg: '#2a0000' }
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
      toast('🆕 Đơn mới từ máy ' + order.table?.number, { icon: '🔔', duration: 5000 })
    })

    return () => socket.off('new_order')
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await getOrders({ limit: 50 })
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

  const filtered = orders.filter(o => filter === 'ALL' || o.status === filter)

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800 }}>
            👨‍🍳 Màn hình bếp
          </h1>
          <p style={{ color: '#888', marginTop: 4 }}>Đơn hàng realtime — cập nhật ngay lập tức</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
          <span style={{ color: '#22c55e', fontSize: 13 }}>Đang kết nối</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY'].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(s)}>
            {s === 'ALL' ? 'Tất cả' : STATUS_FLOW[s]?.label}
            <span style={{ marginLeft: 4, opacity: 0.7 }}>
              ({orders.filter(o => s === 'ALL' || o.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {/* Orders grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>Đang tải đơn hàng...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(order => {
            const statusInfo = STATUS_FLOW[order.status]
            return (
              <div key={order.id} className="card" style={{ borderColor: statusInfo.bg !== '#1a1a1a' ? statusInfo.color + '33' : '#2a2a2a' }}>
                {/* Order header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18 }}>
                      💻 Máy {order.table?.number}
                    </span>
                    <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>#{order.id}</span>
                  </div>
                  <span className={`badge badge-${order.status.toLowerCase()}`}>{statusInfo.label}</span>
                </div>

                {/* Items */}
                <div style={{ marginBottom: 16 }}>
                  {order.items?.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e1e1e' }}>
                      <span style={{ fontSize: 14 }}>
                        <span style={{ fontWeight: 700, color: '#ff6b2b', marginRight: 8 }}>×{item.quantity}</span>
                        {item.menuItem?.name}
                      </span>
                      {item.note && <span style={{ fontSize: 12, color: '#888', fontStyle: 'italic' }}>{item.note}</span>}
                    </div>
                  ))}
                </div>

                {order.note && (
                  <div style={{ background: '#1e1e1e', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 13, color: '#888' }}>
                    📝 {order.note}
                  </div>
                )}

                {/* Time + Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontSize: 12, color: '#666' }}>
                    {new Date(order.createdAt).toLocaleTimeString('vi-VN')}
                  </span>
                  <span style={{ fontWeight: 700, color: '#ff6b2b' }}>
                    {Number(order.total).toLocaleString('vi-VN')}đ
                  </span>
                </div>

                {/* Action button */}
                {statusInfo.next && (
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => handleUpdate(order.id, statusInfo.next)}>
                    {statusInfo.nextLabel}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <p>Không có đơn nào ở trạng thái này</p>
        </div>
      )}
    </div>
  )
}
