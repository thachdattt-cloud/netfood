import { useState, useEffect } from 'react'
import { getOrders, updateOrderStatus } from '../../services/order.service'
import socket from '../../services/socket'
import toast from 'react-hot-toast'

export default function StaffPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
    socket.emit('join_kitchen')

    socket.on('order_status_updated', ({ orderId, status, tableId }) => {
      if (status === 'READY') {
        toast(`🔔 Máy ${tableId} — Đồ sẵn sàng! Mang ra ngay!`, { icon: '🍜', duration: 8000 })
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
      }
    })

    socket.on('new_order', () => fetchOrders())
    return () => { socket.off('order_status_updated'); socket.off('new_order') }
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await getOrders({ limit: 100 })
      setOrders(res.data.data.filter(o => ['READY', 'CONFIRMED', 'PREPARING'].includes(o.status)))
    } catch { toast.error('Không tải được đơn') }
    finally { setLoading(false) }
  }

  const handleDeliver = async (id, tableNumber) => {
    try {
      await updateOrderStatus(id, 'DELIVERED')
      setOrders(prev => prev.filter(o => o.id !== id))
      toast.success(`✅ Đã giao đơn cho máy ${tableNumber}!`)
    } catch { toast.error('Cập nhật thất bại') }
  }

  const readyOrders = orders.filter(o => o.status === 'READY')
  const otherOrders = orders.filter(o => o.status !== 'READY')

  return (
    <div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800 }}>🛎️ Màn hình Nhân viên</h1>
          <p style={{ color: '#888', marginTop: 4 }}>Nhận thông báo và mang đồ cho khách</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
          <span style={{ color: '#22c55e', fontSize: 13 }}>Đang kết nối</span>
        </div>
      </div>

      {readyOrders.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 16, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 8 }}>
            🔔 Cần mang ngay
            <span style={{ background: '#22c55e', color: 'white', borderRadius: 99, padding: '2px 10px', fontSize: 14 }}>{readyOrders.length}</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {readyOrders.map(order => (
              <div key={order.id} className="card" style={{ borderColor: '#22c55e', borderWidth: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22 }}>💻 Máy {order.table?.number}</span>
                  <span style={{ background: '#002a10', color: '#22c55e', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>Sẵn sàng!</span>
                </div>
                <div style={{ marginBottom: 14 }}>
                  {order.items?.map(item => (
                    <div key={item.id} style={{ padding: '6px 0', borderBottom: '1px solid #1e1e1e', fontSize: 14 }}>
                      <span style={{ fontWeight: 700, color: '#ff6b2b', marginRight: 8 }}>×{item.quantity}</span>
                      {item.menuItem?.name}
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', background: '#22c55e' }}
                  onClick={() => handleDeliver(order.id, order.table?.number)}>
                  ✅ Đã mang ra — Xác nhận giao
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {otherOrders.length > 0 && (
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 16, color: '#888' }}>⏳ Bếp đang xử lý</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {otherOrders.map(order => (
              <div key={order.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>💻 Máy {order.table?.number}</span>
                  <span style={{ color: '#888', fontSize: 13 }}>{order.items?.length} món</span>
                  <span style={{ color: '#ff6b2b', fontWeight: 700 }}>{Number(order.total).toLocaleString('vi-VN')}đ</span>
                </div>
                <span style={{
                  padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                  background: order.status === 'PREPARING' ? '#1a0d00' : '#001a2a',
                  color: order.status === 'PREPARING' ? '#ff6b2b' : '#38bdf8'
                }}>
                  {order.status === 'PREPARING' ? '👨‍🍳 Đang làm' : '✅ Đã xác nhận'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😴</div>
          <p>Chưa có đơn nào cần xử lý</p>
        </div>
      )}
    </div>
  )
}