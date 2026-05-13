import { useState, useEffect } from 'react'
import { getOrders, updateOrderStatus } from '../../services/order.service'
import socket from '../../services/socket'
import toast from 'react-hot-toast'

const STATUS_LABELS = {
  PENDING: { label: 'Chờ xác nhận', color: '#eab308', bg: '#2a2000' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#38bdf8', bg: '#001a2a' },
  PREPARING: { label: 'Đang làm', color: '#ff6b2b', bg: '#1a0d00' },
  READY: { label: 'Sẵn sàng', color: '#22c55e', bg: '#002a10' },
  DELIVERED: { label: 'Đã giao', color: '#888', bg: '#1a1a1a' },
  CANCELLED: { label: 'Đã huỷ', color: '#ef4444', bg: '#2a0000' }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchOrders()
    socket.emit('join_kitchen')
    socket.on('new_order', (order) => {
      setOrders(prev => [order, ...prev])
      toast('🆕 Đơn mới từ máy ' + order.table?.number, { icon: '🔔' })
    })
    return () => socket.off('new_order')
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await getOrders({ limit: 100 })
      setOrders(res.data.data)
    } catch { toast.error('Không tải được đơn hàng') }
    finally { setLoading(false) }
  }

  const handleStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
      if (selected?.id === id) setSelected(prev => ({ ...prev, status }))
      toast.success('Cập nhật thành công!')
    } catch { toast.error('Cập nhật thất bại') }
  }

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800 }}>📋 Quản lý Đơn hàng</h1>
          <p style={{ color: '#888', marginTop: 4 }}>{orders.length} đơn hàng</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
          <span style={{ color: '#22c55e', fontSize: 13 }}>Realtime</span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['ALL', ...Object.keys(STATUS_LABELS)].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(s)}>
            {s === 'ALL' ? 'Tất cả' : STATUS_LABELS[s].label}
            <span style={{ opacity: 0.6, marginLeft: 4 }}>
              ({s === 'ALL' ? orders.length : orders.filter(o => o.status === s).length})
            </span>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20 }}>
        {/* Orders table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a', background: '#141414' }}>
                {['#', 'Máy', 'Món', 'Tổng tiền', 'Trạng thái', 'Thời gian', 'Thao tác'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: '#888', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => {
                const st = STATUS_LABELS[order.status]
                return (
                  <tr key={order.id}
                    style={{ borderBottom: '1px solid #1e1e1e', cursor: 'pointer', background: selected?.id === order.id ? '#1a0d00' : 'transparent' }}
                    onClick={() => setSelected(order)}
                    onMouseEnter={e => { if (selected?.id !== order.id) e.currentTarget.style.background = '#141414' }}
                    onMouseLeave={e => { if (selected?.id !== order.id) e.currentTarget.style.background = 'transparent' }}>
                    <td style={{ padding: '12px 14px', color: '#888' }}>#{order.id}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>Máy {order.table?.number}</td>
                    <td style={{ padding: '12px 14px', color: '#888' }}>{order.items?.length} món</td>
                    <td style={{ padding: '12px 14px', color: '#ff6b2b', fontWeight: 700 }}>
                      {Number(order.total).toLocaleString('vi-VN')}đ
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 500, background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#666', fontSize: 12 }}>
                      {new Date(order.createdAt).toLocaleTimeString('vi-VN')}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <select value={order.status}
                        onChange={e => { e.stopPropagation(); handleStatus(order.id, e.target.value) }}
                        onClick={e => e.stopPropagation()}
                        style={{ fontSize: 12, padding: '4px 8px', width: 'auto' }}>
                        {Object.keys(STATUS_LABELS).map(s => <option key={s} value={s}>{STATUS_LABELS[s].label}</option>)}
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Không có đơn hàng nào</div>
          )}
        </div>

        {/* Order detail panel */}
        {selected && (
          <div className="card" style={{ alignSelf: 'start', position: 'sticky', top: 80 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>Chi tiết #{ selected.id}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            <div style={{ marginBottom: 16, padding: '10px 14px', background: '#1e1e1e', borderRadius: 8 }}>
              <p style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>Máy số</p>
              <p style={{ fontWeight: 700, fontSize: 20, color: '#ff6b2b' }}>💻 Máy {selected.table?.number}</p>
            </div>
            <div style={{ marginBottom: 16 }}>
              <p style={{ color: '#888', fontSize: 13, marginBottom: 10 }}>Danh sách món</p>
              {selected.items?.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e1e1e' }}>
                  <span style={{ fontSize: 14 }}>
                    <span style={{ fontWeight: 700, color: '#ff6b2b', marginRight: 8 }}>×{item.quantity}</span>
                    {item.menuItem?.name}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>
                    {(Number(item.price) * item.quantity).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              ))}
            </div>
            {selected.note && (
              <div style={{ background: '#1e1e1e', borderRadius: 8, padding: '8px 12px', marginBottom: 16, fontSize: 13, color: '#888' }}>
                📝 {selected.note}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #2a2a2a', marginBottom: 16 }}>
              <span style={{ fontWeight: 600 }}>Tổng cộng</span>
              <span style={{ fontWeight: 800, color: '#ff6b2b', fontSize: 18 }}>
                {Number(selected.total).toLocaleString('vi-VN')}đ
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#555' }}>{new Date(selected.createdAt).toLocaleString('vi-VN')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
