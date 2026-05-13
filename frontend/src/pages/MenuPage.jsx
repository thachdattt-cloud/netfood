import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getMenuItems, getCategories } from '../services/menu.service'
import { useCartStore } from '../store/useCartStore'
import toast from 'react-hot-toast'

const CATEGORY_ICONS = {
  'do-uong': '🧃',
  'an-vat': '🍿',
  'com-chay': '🍚',
  'mi-bun': '🍜',
  'do-nhanh': '🍔',
}

export default function MenuPage() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState({})
  const [searchParams] = useSearchParams()
  const { addItem, setTable, tableId } = useCartStore()
  const tableNumber = searchParams.get('table')

  useEffect(() => {
    if (tableNumber) setTable(Number(tableNumber))
    fetchData()
  }, [tableNumber, activeCategory])

  const fetchData = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        getMenuItems({ categoryId: activeCategory, limit: 50 }),
        getCategories()
      ])
      setItems(menuRes.data.data)
      setCategories(catRes.data.data)
    } catch { toast.error('Không tải được menu') }
    finally { setLoading(false) }
  }

  const handleAdd = (item) => {
    addItem({ menuItemId: item.id, name: item.name, price: Number(item.price), image: item.image })
    toast.success(`Đã thêm ${item.name}!`, { icon: '🍜' })
  }

  const toggleLike = (id) => setLiked(prev => ({ ...prev, [id]: !prev[id] }))

  // Màu nền pastel cho card
  const cardBgs = ['#fff5f0', '#f0f7ff', '#f5fff0', '#fff9f0', '#f8f0ff', '#fff0f5']

  return (
    <div style={{ background: '#fffaf7', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #fff3e0 0%, #fce4ec 50%, #f3e5f5 100%)',
        padding: '48px 40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: '#ff6b2b22' }} />
        <div style={{ position: 'absolute', bottom: -60, right: 200, width: 160, height: 160, borderRadius: '50%', background: '#ffb34722' }} />
        <div style={{ position: 'absolute', top: 20, right: 320, width: 12, height: 12, borderRadius: '50%', background: '#ff6b2b88' }} />
        <div style={{ position: 'absolute', top: 60, right: 280, width: 8, height: 8, borderRadius: '50%', background: '#ffb34788' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 40 }}>🍜</span>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 800, color: '#1a1a1a', lineHeight: 1 }}>
                Thực đơn
              </h1>
            </div>
            <p style={{ color: '#666', fontSize: 16, marginBottom: 20 }}>
              Chọn món ngon mỗi ngày – không nhanh tận nơi!
            </p>
            {tableNumber && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#ff6b2b', color: 'white',
                padding: '8px 18px', borderRadius: 99, fontSize: 14, fontWeight: 600
              }}>
                💻 Máy số {tableNumber}
              </div>
            )}
          </div>

          {/* Food images */}
          <div style={{ display: 'flex', gap: -20, position: 'relative', width: 340, height: 200 }}>
            <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop&crop=center"
              alt="burger" style={{ width: 180, height: 180, objectFit: 'cover', borderRadius: '50%', position: 'absolute', right: 160, top: 0, boxShadow: '0 8px 24px #0002' }} />
            <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop&crop=center"
              alt="pizza" style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: '50%', position: 'absolute', right: 0, top: 20, boxShadow: '0 8px 24px #0002' }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
          <button onClick={() => setActiveCategory(null)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 99, border: 'none', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
            background: !activeCategory ? '#ff6b2b' : 'white',
            color: !activeCategory ? 'white' : '#444',
            boxShadow: !activeCategory ? '0 4px 12px #ff6b2b44' : '0 2px 8px #0001'
          }}>
            <span>⊞</span> Tất cả
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 99, border: 'none', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
              background: activeCategory === cat.id ? '#ff6b2b' : 'white',
              color: activeCategory === cat.id ? 'white' : '#444',
              boxShadow: activeCategory === cat.id ? '0 4px 12px #ff6b2b44' : '0 2px 8px #0001'
            }}>
              <span>{CATEGORY_ICONS[cat.slug] || '🍽️'}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#aaa' }}>Đang tải menu...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {items.map((item, idx) => (
              <div key={item.id} style={{
                background: cardBgs[idx % cardBgs.length],
                borderRadius: 20, overflow: 'hidden',
                boxShadow: '0 2px 12px #0001',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 32px #0002' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px #0001' }}>

                {/* Image */}
                <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, background: cardBgs[idx % cardBgs.length] }}>
                      {['🍕', '🍔', '🍜', '🧃', '🍿', '🌮'][idx % 6]}
                    </div>
                  )}

                  {/* Like button */}
                  <button onClick={() => toggleLike(item.id)} style={{
                    position: 'absolute', top: 12, right: 12,
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'white', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, boxShadow: '0 2px 8px #0002',
                    transition: 'transform 0.2s'
                  }}>
                    {liked[item.id] ? '❤️' : '🤍'}
                  </button>

                  {/* Badge bán chạy */}
                  {idx % 3 === 1 && (
                    <div style={{
                      position: 'absolute', top: 12, left: 12,
                      background: '#ff6b2b', color: 'white',
                      padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700
                    }}>🔥 Món bán chạy</div>
                  )}

                  {!item.isAvailable && (
                    <div style={{
                      position: 'absolute', inset: 0, background: '#0008',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: 16
                    }}>Hết hàng</div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '16px 20px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 6 }}>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#1a1a1a', flex: 1 }}>
                      {item.name}
                    </h3>
                    <span style={{ color: '#ff6b2b', fontWeight: 800, fontSize: 16, marginLeft: 8, whiteSpace: 'nowrap' }}>
                      {Number(item.price).toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  {item.description && (
                    <p style={{ color: '#888', fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
                      {item.description}
                    </p>
                  )}

                  <button
                    onClick={() => handleAdd(item)}
                    disabled={!item.isAvailable}
                    style={{
                      width: '100%', padding: '11px 0', border: 'none', borderRadius: 12,
                      background: item.isAvailable ? '#ff6b2b' : '#ddd',
                      color: 'white', fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 700, fontSize: 15, cursor: item.isAvailable ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all 0.2s', boxShadow: item.isAvailable ? '0 4px 12px #ff6b2b44' : 'none'
                    }}
                    onMouseEnter={e => { if (item.isAvailable) e.currentTarget.style.background = '#e55a1f' }}
                    onMouseLeave={e => { if (item.isAvailable) e.currentTarget.style.background = '#ff6b2b' }}
                  >
                    + Thêm vào giỏ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: 80, color: '#aaa' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
            <p>Chưa có món nào trong danh mục này</p>
          </div>
        )}
      </div>
    </div>
  )
}