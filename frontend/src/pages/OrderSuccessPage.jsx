import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import socket from '../services/socket'

export default function OrderSuccessPage() {
  const navigate = useNavigate()
  const [statusMsg, setStatusMsg] = useState('Đơn hàng đã được gửi đến bếp!')

  useEffect(() => {
    socket.on('order_status_updated', ({ status }) => {
      const messages = {
        CONFIRMED: '✅ Bếp đã xác nhận đơn của bạn!',
        PREPARING: '👨‍🍳 Bếp đang chuẩn bị món...',
        READY: '🎉 Món của bạn đã sẵn sàng! Nhân viên sẽ mang đến ngay.',
        DELIVERED: '✅ Đã giao xong. Chúc bạn ngon miệng!'
      }
      if (messages[status]) setStatusMsg(messages[status])
    })
    return () => socket.off('order_status_updated')
  }, [])

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: 72, marginBottom: 24, animation: 'bounce 1s infinite' }}>🍜</div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
          Đặt hàng thành công!
        </h1>
        <div className="card" style={{ marginBottom: 24, borderColor: '#22c55e33' }}>
          <p style={{ color: '#22c55e', fontWeight: 500 }}>{statusMsg}</p>
        </div>
        <p style={{ color: '#888', marginBottom: 28, lineHeight: 1.6 }}>
          Bếp sẽ chuẩn bị món và nhân viên sẽ mang đến tận máy của bạn.
          Trang này sẽ tự cập nhật trạng thái theo thời gian thực.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/menu')} style={{ marginRight: 12 }}>
          Đặt thêm món
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/')}>Về trang chủ</button>
      </div>
    </div>
  )
}
