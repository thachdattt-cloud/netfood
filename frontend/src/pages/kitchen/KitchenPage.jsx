import { useState, useEffect } from 'react'
import { getOrders, updateOrderStatus } from '../../services/order.service'
import { getMenuItems, reportOutOfStock } from '../../services/menu.service'
import socket from '../../services/socket'
import toast from 'react-hot-toast'

const STATUS_FLOW = {
  PENDING:   { label: 'Chờ xác nhận', next: 'CONFIRMED', nextLabel: '✅ Xác nhận đơn',    color: '#eab308', bg: '#2a2000' },
  CONFIRMED: { label: 'Đã xác nhận',  next: 'PREPARING', nextLabel: '👨‍🍳 Bắt đầu làm',   color: '#38bdf8', bg: '#001a2a' },
  PREPARING: { label: 'Đang làm',     next: 'READY',     nextLabel: '🔔 Xong, báo khách', color: '#ff6b2b', bg: '#1a0d00' },
  READY:     { label: 'Sẵn sàng',     next: null,        color: '#22c55e', bg: '#002a10' },
  DELIVERED: { label: 'Đã giao',      next: null,        color: '#888',    bg: '#1a1a1a' },
  CANCELLED: { label: 'Đã huỷ',       next: null,        color: '#ef4444', bg: '#2a0000' }
}

export default function KitchenPage() {
  const [orders, setOrders] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('PENDING')
  const [showOutOfStock, setShowOutOfStock] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [outOfStockMsg, setOutOfStockMsg] = useState('')

  useEffect(() => {
    fetchOrders()
    fetchMenu()
    socket.emit('join_kitchen')

    socket.on('new_order', (order) => {
      setOrders(prev => [order, ...prev])
      toast(`🆕 Đơn mới — Máy ${order.table?.number}`, { icon: '🔔', duration: 6000 })
      try { new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play() } catch {}
    })

    // Nghe khi admin bật/tắt món
    socket.on('menu_availability_changed', ({ itemId, isAvailable, name }) => {
      setMenuItems(prev => prev.map(i => i.id === itemId ? { ...i, isAvailable } : i))
      if (isAvailable) toast.success(`✅ Admin đã bật lại món: ${name}`)
    })

    return () => { socket.off('new_order'); socket.off('menu_availability_changed') }
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await getOrders({ limit: 100 })
      setOrders(res.data.data)
    } catch { toast.error('Không tải được đơn') }
    finally { setLoading(false) }
  }

  const fetchMenu = async () => {
    try {
      const res = await getMenuItems({ limit: 100 })
      setMenuItems(res.data.data)
    } catch {}
  }

  const handleUpdate = async (id, status) => {
    try {
      await updateOrderStatus(id, status)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
      toast.success('Cập nhật thành công!')
    } catch { toast.error('Cập nhật thất bại') }
  }

  const handleReportOutOfStock = async () => {
    if (!selectedItem) return
    try {
      await reportOutOfStock(selectedItem.id, outOfStockMsg || `Hết món: ${selectedItem.name}`)
      toast.success(`Đã báo admin hết món "${selectedItem.name}"!`)
      setMenuItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, isAvailable: false } : i))
      setShowOutOfStock(false); setSelectedItem(null); setOutOfStockMsg('')
    } catch { toast.error('Báo thất bại') }
  }

  const visibleOrders = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status))
  const filtered = filter === 'ALL' ? visibleOrders : visibleOrders.filter(o => o.status === filter)

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800 }}>👨‍🍳 Màn hình Bếp</h1>
          <p style={{ color: '#888', marginTop: 4 }}>Nhận và xử lý đơn hàng realtime</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Nút báo hết hàng */}
          <button className="btn btn-danger btn-sm" onClick={() => setShowOutOfStock(true)}>
            ⚠️ Báo hết hàng
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
            <span style={{ color: '#22c55e', fontSize: 13 }}>Đang kết nối</span>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { key: 'ALL', label: 'Tất cả', count: visibleOrders.length },
          { key: 'PENDING', label: 'Chờ xác nhận', count: visibleOrders.filter(o => o.status === 'PENDING').length },
          { key: 'CONFIRMED', label: 'Đã xác nhận', count: visibleOrders.filter(o => o.status === 'CONFIRMED').length },
          { key: 'PREPARING', label: 'Đang làm', count: visibleOrders.filter(o => o.status === 'PREPARING').length },
          { key: 'READY', label: 'Sẵn sàng giao', count: visibleOrders.filter(o => o.status === 'READY').length },
        ].map(tab => (
          <button key={tab.key} className={`btn btn-sm ${filter === tab.key ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(tab.key)}>
            {tab.label}
            <span style={{ marginLeft: 6, background: filter === tab.key ? '#ffffff33' : '#ffffff11', padding: '1px 7px', borderRadius: 99, fontSize: 11 }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>Đang tải...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(order => {
            const st = STATUS_FLOW[order.status]
            const waitMins = Math.floor((Date.now() - new Date(order.createdAt)) / 60000)
            return (
              <div key={order.id} className="card" style={{ borderColor: st.color + '44', borderWidth: 1.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20 }}>💻 Máy {order.table?.number}</span>
                    <span style={{ color: '#555', fontSize: 12, marginLeft: 8 }}>#{order.id}</span>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 99, background: waitMins > 10 ? '#2a0000' : '#1a1a1a', color: waitMins > 10 ? '#ef4444' : '#888' }}>
                    ⏱ Chờ {waitMins} phút {waitMins > 10 ? '⚠️' : ''}
                  </span>
                </div>
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
                {order.note && (
                  <div style={{ background: '#1e1e1e', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 13, color: '#aaa' }}>📝 {order.note}</div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 12, color: '#555' }}>{new Date(order.createdAt).toLocaleTimeString('vi-VN')}</span>
                  <span style={{ fontWeight: 800, color: '#ff6b2b' }}>{Number(order.total).toLocaleString('vi-VN')}đ</span>
                </div>
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

      {/* Modal báo hết hàng */}
      {showOutOfStock && (
        <div style={{ position: 'fixed', inset: 0, background: '#000b', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
          <div className="card" style={{ width: '100%', maxWidth: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#ef4444' }}>⚠️ Báo hết hàng</h2>
              <button onClick={() => { setShowOutOfStock(false); setSelectedItem(null); setOutOfStockMsg('') }}
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: '#888', marginBottom: 8, display: 'block' }}>Chọn món hết hàng</label>
              <select value={selectedItem?.id || ''} onChange={e => setSelectedItem(menuItems.find(i => i.id === Number(e.target.value)))}
                style={{ marginBottom: 12 }}>
                <option value="">-- Chọn món --</option>
                {menuItems.filter(i => i.isAvailable).map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
              <label style={{ fontSize: 13, color: '#888', marginBottom: 8, display: 'block' }}>Ghi chú cho admin (tuỳ chọn)</label>
              <input placeholder="VD: Hết nguyên liệu, dự kiến 30 phút nữa có..."
                value={outOfStockMsg} onChange={e => setOutOfStockMsg(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => { setShowOutOfStock(false); setSelectedItem(null) }}>Hủy</button>
              <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleReportOutOfStock} disabled={!selectedItem}>
                Báo admin ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}