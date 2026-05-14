import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const ROLES = [
  { value: 'CUSTOMER', label: '👤 Khách hàng', color: '#888',    bg: '#1a1a1a' },
  { value: 'STAFF',    label: '🛎️ Nhân viên',  color: '#38bdf8', bg: '#001a2a' },
  { value: 'KITCHEN',  label: '👨‍🍳 Bếp',        color: '#ff6b2b', bg: '#1a0d00' },
  { value: 'ADMIN',    label: '⚡ Admin',       color: '#a78bfa', bg: '#1a0d2a' },
]

const EMPTY_FORM = { name: '', email: '', password: '', role: 'STAFF' }

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [filterRole, setFilterRole] = useState('ALL')

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users?limit=100')
      setUsers(res.data.data)
    } catch { toast.error('Không tải được danh sách') }
    finally { setLoading(false) }
  }

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) return toast.error('Điền đầy đủ thông tin!')
    setSubmitting(true)
    try {
      await api.post('/users', form)
      toast.success('Tạo tài khoản thành công!')
      setShowModal(false)
      setForm(EMPTY_FORM)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Tạo thất bại')
    } finally { setSubmitting(false) }
  }

  const handleRoleChange = async (id, role) => {
    try {
      await api.patch(`/users/${id}/role`, { role })
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
      toast.success('Đã cập nhật role!')
    } catch { toast.error('Cập nhật thất bại') }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa tài khoản "${name}"?`)) return
    try {
      await api.delete(`/users/${id}`)
      setUsers(prev => prev.filter(u => u.id !== id))
      toast.success('Đã xóa tài khoản!')
    } catch { toast.error('Xóa thất bại') }
  }

  const getRoleInfo = (role) => ROLES.find(r => r.value === role) || ROLES[0]
  const filtered = filterRole === 'ALL' ? users : users.filter(u => u.role === filterRole)

  return (
    <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800 }}>👥 Quản lý Tài khoản</h1>
          <p style={{ color: '#888', marginTop: 4 }}>{users.length} tài khoản trong hệ thống</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Tạo tài khoản</button>
      </div>

      {/* Role filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <button className={`btn btn-sm ${filterRole === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilterRole('ALL')}>
          Tất cả ({users.length})
        </button>
        {ROLES.map(r => (
          <button key={r.value} className={`btn btn-sm ${filterRole === r.value ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterRole(r.value)}>
            {r.label} ({users.filter(u => u.role === r.value).length})
          </button>
        ))}
      </div>

      {/* Bảng users */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>Đang tải...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a', background: '#141414' }}>
                {['#', 'Tên', 'Email', 'Role', 'Ngày tạo', 'Thao tác'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: '#888', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => {
                const roleInfo = getRoleInfo(user.role)
                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid #1e1e1e' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#141414'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px', color: '#555' }}>#{user.id}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{user.name}</td>
                    <td style={{ padding: '12px 16px', color: '#888' }}>{user.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {/* Dropdown đổi role ngay trong bảng */}
                      <select value={user.role}
                        onChange={e => handleRoleChange(user.id, e.target.value)}
                        style={{
                          background: roleInfo.bg, color: roleInfo.color,
                          border: `1px solid ${roleInfo.color}44`,
                          borderRadius: 99, padding: '4px 10px', fontSize: 12,
                          fontWeight: 600, cursor: 'pointer', width: 'auto'
                        }}>
                        {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#666', fontSize: 12 }}>
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(user.id, user.name)}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
              <p>Không có tài khoản nào</p>
            </div>
          )}
        </div>
      )}

      {/* Modal tạo tài khoản */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: '#000b', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
          <div className="card" style={{ width: '100%', maxWidth: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>Tạo tài khoản mới</h2>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM) }}
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, color: '#888', marginBottom: 6, display: 'block' }}>Họ tên *</label>
                <input placeholder="VD: Nguyễn Văn A" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#888', marginBottom: 6, display: 'block' }}>Email *</label>
                <input type="email" placeholder="email@netfood.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#888', marginBottom: 6, display: 'block' }}>Mật khẩu *</label>
                <input type="password" placeholder="Tối thiểu 6 ký tự" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#888', marginBottom: 10, display: 'block' }}>Vai trò *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {ROLES.map(r => (
                    <button key={r.value} onClick={() => setForm({ ...form, role: r.value })}
                      style={{
                        padding: '12px 16px', borderRadius: 10, border: `2px solid`,
                        borderColor: form.role === r.value ? r.color : '#2a2a2a',
                        background: form.role === r.value ? r.bg : 'transparent',
                        color: form.role === r.value ? r.color : '#888',
                        cursor: 'pointer', fontWeight: 600, fontSize: 14,
                        transition: 'all 0.15s', textAlign: 'left'
                      }}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => { setShowModal(false); setForm(EMPTY_FORM) }}>Hủy</button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                  onClick={handleCreate} disabled={submitting}>
                  {submitting ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}