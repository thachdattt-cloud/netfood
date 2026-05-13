import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/auth.service'
import { useAuthStore } from '../store/useAuthStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await login(form)
      setAuth(res.data.data.user, res.data.data.token)
      toast.success('Đăng nhập thành công!')
      const role = res.data.data.user.role
      if (role === 'ADMIN') navigate('/admin')
      else if (role === 'KITCHEN') navigate('/kitchen')
      else navigate('/menu')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: 48 }}>🍜</span>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, marginTop: 12 }}>
            Net<span style={{ color: '#ff6b2b' }}>Food</span>
          </h1>
          <p style={{ color: '#888', marginTop: 8 }}>Đăng nhập để tiếp tục</p>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: '#888', marginBottom: 6, display: 'block' }}>Email</label>
            <input type="email" placeholder="your@email.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#888', marginBottom: 6, display: 'block' }}>Mật khẩu</label>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '12px 20px', marginTop: 8 }}
            disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#888', fontSize: 14 }}>
          Chưa có tài khoản?{' '}
          <Link to="/register" style={{ color: '#ff6b2b', textDecoration: 'none', fontWeight: 500 }}>
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  )
}
