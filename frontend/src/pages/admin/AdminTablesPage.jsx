import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminTablesPage() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newNumber, setNewNumber] = useState('')

  useEffect(() => { fetchTables() }, [])

  const fetchTables = async () => {
    try {
      const res = await api.get('/tables')
      setTables(res.data.data)
    } catch { toast.error('Không tải được danh sách máy') }
    finally { setLoading(false) }
  }

  const handleAdd = async () => {
    if (!newNumber) return toast.error('Nhập số máy!')
    try {
      await api.post('/tables', { number: Number(newNumber) })
      toast.success(`Đã thêm máy số ${newNumber}!`)
      setNewNumber(''); setAdding(false); fetchTables()
    } catch (err) { toast.error(err.response?.data?.message || 'Thêm máy thất bại') }
  }

  const handleDelete = async (id, number) => {
    if (!window.confirm(`Xóa máy số ${number}?`)) return
    try {
      await api.delete(`/tables/${id}`)
      toast.success('Đã xóa máy!')
      fetchTables()
    } catch { toast.error('Xóa thất bại') }
  }

  const handlePrintQR = (table) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(table.qrCode)}`
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>QR Máy ${table.number}</title>
      <style>body{font-family:sans-serif;text-align:center;padding:40px;background:#fff}
      h2{margin-bottom:20px}img{border:2px solid #eee;border-radius:12px;padding:12px}
      p{color:#666;margin-top:16px;font-size:14px}</style></head>
      <body>
        <h2>🍜 NetFood — Máy số ${table.number}</h2>
        <img src="${qrUrl}" />
        <p>Quét QR để đặt đồ ăn</p>
        <p style="color:#999;font-size:12px">${table.qrCode}</p>
        <script>window.onload=()=>window.print()</script>
      </body></html>
    `)
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800 }}>💻 Quản lý Máy</h1>
          <p style={{ color: '#888', marginTop: 4 }}>{tables.length} máy đang hoạt động</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAdding(true)}>+ Thêm máy</button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="card" style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, color: '#888', marginBottom: 6, display: 'block' }}>Số máy</label>
            <input type="number" placeholder="VD: 15" value={newNumber}
              onChange={e => setNewNumber(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()} />
          </div>
          <button className="btn btn-primary" onClick={handleAdd}>Thêm</button>
          <button className="btn btn-outline" onClick={() => { setAdding(false); setNewNumber('') }}>Hủy</button>
        </div>
      )}

      {/* Tables grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>Đang tải...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {tables.map(table => {
            const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(table.qrCode)}`
            return (
              <div key={table.id} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontFamily: 'Syne, sans-serif', fontWeight: 800, marginBottom: 14, color: '#ff6b2b' }}>
                  💻 Máy số {table.number}
                </div>

                {/* QR code */}
                <div style={{ background: '#fff', borderRadius: 10, padding: 10, display: 'inline-block', marginBottom: 16 }}>
                  <img src={qrImgUrl} alt={`QR Máy ${table.number}`} width={120} height={120} />
                </div>

                <p style={{ fontSize: 11, color: '#555', marginBottom: 16, wordBreak: 'break-all', lineHeight: 1.4 }}>
                  {table.qrCode}
                </p>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => handlePrintQR(table)}>🖨️ In QR</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(table.id, table.number)}>✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tables.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💻</div>
          <p>Chưa có máy nào. Hãy thêm máy đầu tiên!</p>
        </div>
      )}
    </div>
  )
}
