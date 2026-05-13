import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/useCartStore'
import { createOrder } from '../services/order.service'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { items, tableId, updateQty, removeItem, clearCart, getTotal, setTable } = useCartStore()
  const total = getTotal()
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [tableInput, setTableInput] = useState('')
  const navigate = useNavigate()

  const handleOrder = async () => {
    if (!tableId) return toast.error('Vui lòng nhập số máy bạn đang ngồi!')
    if (items.length === 0) return toast.error('Giỏ hàng trống!')
    setLoading(true)
    try {
      await createOrder({
        tableId,
        note,
        items: items.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity, note: i.note }))
      })
      clearCart()
      toast.success('Đặt hàng thành công! Bếp đang chuẩn bị 🍜', { duration: 4000 })
      navigate('/order-success')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đặt hàng thất bại')
    } finally { setLoading(false) }
  }

  if (items.length === 0) return (
    <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center', padding: 24 }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
      <h2 style={{ fontFamily: 'Syne, sans-serif', marginBottom: 8 }}>Giỏ hàng trống</h2>
      <p style={{ color: '#888', marginBottom: 24 }}>Hãy chọn món từ thực đơn nhé!</p>
      <button className="btn btn-primary" onClick={() => navigate('/menu')}>Xem thực đơn</button>
    </div>
  )

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, marginBottom: 24 }}>
        Giỏ hàng
      </h1>

      {/* Chọn số máy */}
      <div className="card" style={{ marginBottom: 20, borderColor: tableId ? '#22c55e33' : '#ff6b2b33' }}>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 10 }}>💻 Bạn đang ngồi máy số mấy?</p>
        {tableId ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 18 }}>✅ Máy số {tableId}</span>
            <button className="btn btn-outline btn-sm" onClick={() => setTable(null)}>Đổi máy</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="number"
              placeholder="Nhập số máy (VD: 5)"
              value={tableInput}
              onChange={e => setTableInput(e.target.value)}
              style={{ flex: 1 }}
              min={1}
            />
            <button className="btn btn-primary" onClick={() => {
              if (!tableInput) return toast.error('Nhập số máy đi!')
              setTable(Number(tableInput))
              toast.success(`Đã chọn máy số ${tableInput}!`)
            }}>Xác nhận</button>
          </div>
        )}
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {items.map(item => (
          <div key={item.menuItemId} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 8, background: '#1e1e1e',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0
            }}>🍽️</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>{item.name}</p>
              <p style={{ color: '#ff6b2b', fontWeight: 700 }}>
                {(Number(item.price) * item.quantity).toLocaleString('vi-VN')}đ
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="btn btn-outline btn-sm"
                style={{ width: 32, height: 32, padding: 0, justifyContent: 'center' }}
                onClick={() => updateQty(item.menuItemId, item.quantity - 1)}>−</button>
              <span style={{ width: 24, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
              <button className="btn btn-outline btn-sm"
                style={{ width: 32, height: 32, padding: 0, justifyContent: 'center' }}
                onClick={() => updateQty(item.menuItemId, item.quantity + 1)}>+</button>
              <button className="btn btn-danger btn-sm"
                style={{ width: 32, height: 32, padding: 0, justifyContent: 'center', marginLeft: 4 }}
                onClick={() => removeItem(item.menuItemId)}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Note */}
      <div className="card" style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 14, color: '#888', marginBottom: 8, display: 'block' }}>Ghi chú cho bếp</label>
        <textarea value={note} onChange={e => setNote(e.target.value)}
          placeholder="VD: Ít cay, không hành..." rows={3} style={{ resize: 'none' }} />
      </div>

      {/* Summary */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: '#888' }}>Tổng món</span>
          <span>{items.reduce((s, i) => s + i.quantity, 0)} món</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #2a2a2a' }}>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18 }}>Tổng tiền</span>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#ff6b2b' }}>
            {total.toLocaleString('vi-VN')}đ
          </span>
        </div>
      </div>

      <button className="btn btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: 16 }}
        onClick={handleOrder} disabled={loading}>
        {loading ? 'Đang đặt...' : '🍜 Xác nhận đặt hàng'}
      </button>
    </div>
  )
}