import { useState, useEffect } from 'react'
import { getMenuItems, getCategories, createMenuItem, updateMenuItem, deleteMenuItem, createCategory, toggleAvailable } from '../../services/menu.service'
import socket from '../../services/socket'
import toast from 'react-hot-toast'

const EMPTY_FORM = { name: '', description: '', price: '', categoryId: '', isAvailable: true, image: '' }

export default function AdminMenuPage() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showCatModal, setShowCatModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [catName, setCatName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [activeCategory, setActiveCategory] = useState(null)
  const [alerts, setAlerts] = useState([]) // Thông báo từ bếp

  useEffect(() => {
    fetchAll()
    socket.emit('join_admin')

    // Nghe thông báo hết hàng từ bếp
    socket.on('kitchen_alert', (alert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 10))
      toast(`⚠️ Bếp báo: ${alert.message}`, { icon: '🔔', duration: 8000, style: { background: '#2a1a00', color: '#ffb347', border: '1px solid #ff6b2b' } })
    })

    // Cập nhật trạng thái món realtime
    socket.on('menu_availability_changed', ({ itemId, isAvailable }) => {
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, isAvailable } : i))
    })

    return () => { socket.off('kitchen_alert'); socket.off('menu_availability_changed') }
  }, [activeCategory])

  const fetchAll = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        getMenuItems({ categoryId: activeCategory, limit: 100 }),
        getCategories()
      ])
      setItems(menuRes.data.data)
      setCategories(catRes.data.data)
    } catch { toast.error('Không tải được dữ liệu') }
    finally { setLoading(false) }
  }

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit = (item) => {
    setEditing(item)
    setForm({ name: item.name, description: item.description || '', price: item.price, categoryId: item.categoryId, isAvailable: item.isAvailable, image: item.image || '' })
    setShowModal(true)
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_PRESET || 'netfood')
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_NAME}/image/upload`, { method: 'POST', body: formData })
      const data = await res.json()
      setForm(f => ({ ...f, image: data.secure_url }))
      toast.success('Upload ảnh thành công!')
    } catch { toast.error('Upload ảnh thất bại') }
    finally { setUploading(false) }
  }

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.categoryId) return toast.error('Vui lòng điền đầy đủ!')
    try {
      const data = { ...form, price: Number(form.price), categoryId: Number(form.categoryId) }
      if (editing) { await updateMenuItem(editing.id, data); toast.success('Cập nhật thành công!') }
      else { await createMenuItem(data); toast.success('Thêm món thành công!') }
      setShowModal(false); fetchAll()
    } catch (err) { toast.error(err.response?.data?.message || 'Thất bại') }
  }

  const handleToggle = async (item) => {
    try {
      await toggleAvailable(item.id)
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i))
      toast.success(item.isAvailable ? `Đã tắt "${item.name}"` : `Đã bật "${item.name}"`)
    } catch { toast.error('Cập nhật thất bại') }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa món "${name}"?`)) return
    try { await deleteMenuItem(id); toast.success('Đã xóa!'); fetchAll() }
    catch { toast.error('Xóa thất bại') }
  }

  const handleAddCategory = async () => {
    if (!catName.trim()) return
    try {
      await createCategory({ name: catName })
      toast.success('Thêm danh mục thành công!')
      setCatName(''); setShowCatModal(false); fetchAll()
    } catch { toast.error('Thêm danh mục thất bại') }
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Thông báo từ bếp */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {alerts.slice(0, 3).map((alert, i) => (
            <div key={i} style={{ background: '#2a1a00', border: '1px solid #ff6b2b44', borderRadius: 10, padding: '12px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>⚠️</span>
                <div>
                  <p style={{ color: '#ffb347', fontWeight: 600, fontSize: 14 }}>{alert.message}</p>
                  <p style={{ color: '#888', fontSize: 12 }}>{new Date(alert.time).toLocaleTimeString('vi-VN')}</p>
                </div>
              </div>
              <button onClick={() => setAlerts(prev => prev.filter((_, idx) => idx !== i))}
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800 }}>🍜 Quản lý Menu</h1>
          <p style={{ color: '#888', marginTop: 4 }}>{items.length} món trong menu</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={() => setShowCatModal(true)}>+ Danh mục</button>
          <button className="btn btn-primary" onClick={openAdd}>+ Thêm món</button>
        </div>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <button className={`btn btn-sm ${!activeCategory ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveCategory(null)}>Tất cả</button>
        {categories.map(cat => (
          <button key={cat.id} className={`btn btn-sm ${activeCategory === cat.id ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveCategory(cat.id)}>
            {cat.name} <span style={{ opacity: 0.6 }}>({cat._count?.items || 0})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>Đang tải...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a', background: '#141414' }}>
                {['Ảnh', 'Tên món', 'Danh mục', 'Giá', 'Trạng thái', 'Thao tác'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: '#888', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #1e1e1e' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#141414'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 8, background: item.image ? `url(${item.image}) center/cover` : '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      {!item.image && '🍽️'}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <p style={{ fontWeight: 600 }}>{item.name}</p>
                    {item.description && <p style={{ color: '#666', fontSize: 12, marginTop: 2 }}>{item.description.slice(0, 40)}...</p>}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#888' }}>{item.category?.name}</td>
                  <td style={{ padding: '12px 16px', color: '#ff6b2b', fontWeight: 700 }}>{Number(item.price).toLocaleString('vi-VN')}đ</td>
                  <td style={{ padding: '12px 16px' }}>
                    {/* Toggle switch */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div onClick={() => handleToggle(item)} style={{
                        width: 44, height: 24, borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                        background: item.isAvailable ? '#22c55e' : '#ef4444', position: 'relative'
                      }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%', background: 'white',
                          position: 'absolute', top: 3, transition: 'all 0.2s',
                          left: item.isAvailable ? 23 : 3
                        }} />
                      </div>
                      <span style={{ fontSize: 12, color: item.isAvailable ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                        {item.isAvailable ? 'Còn hàng' : 'Hết hàng'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(item)}>Sửa</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id, item.name)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🍽️</div>
              <p>Chưa có món nào</p>
            </div>
          )}
        </div>
      )}

      {/* Modal thêm/sửa món */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: '#000a', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
          <div className="card" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{editing ? 'Sửa món' : 'Thêm món mới'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, color: '#888', marginBottom: 8, display: 'block' }}>Ảnh món ăn</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 80, height: 80, borderRadius: 10, border: '1px solid #2a2a2a', background: form.image ? `url(${form.image}) center/cover` : '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                    {!form.image && '🍽️'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                      {uploading ? 'Đang upload...' : '📷 Chọn ảnh'}
                      <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
                    </label>
                    <p style={{ color: '#666', fontSize: 12, marginTop: 6 }}>JPG, PNG tối đa 5MB</p>
                  </div>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#888', marginBottom: 6, display: 'block' }}>Tên món *</label>
                <input placeholder="VD: Mì xào bò" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#888', marginBottom: 6, display: 'block' }}>Mô tả</label>
                <textarea placeholder="Mô tả ngắn về món..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ resize: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: '#888', marginBottom: 6, display: 'block' }}>Giá (đ) *</label>
                  <input type="number" placeholder="25000" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#888', marginBottom: 6, display: 'block' }}>Danh mục *</label>
                  <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                    <option value="">Chọn danh mục</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="available" checked={form.isAvailable} onChange={e => setForm({ ...form, isAvailable: e.target.checked })} style={{ width: 16, height: 16, accentColor: '#ff6b2b' }} />
                <label htmlFor="available" style={{ fontSize: 14, cursor: 'pointer' }}>Còn hàng</label>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>Hủy</button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSubmit}>
                  {editing ? 'Lưu thay đổi' : 'Thêm món'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal thêm danh mục */}
      {showCatModal && (
        <div style={{ position: 'fixed', inset: 0, background: '#000a', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
          <div className="card" style={{ width: '100%', maxWidth: 380 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 20 }}>Thêm danh mục</h2>
            <input placeholder="VD: Đồ uống, Ăn vặt..." value={catName} onChange={e => setCatName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddCategory()} style={{ marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowCatModal(false)}>Hủy</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleAddCategory}>Thêm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}