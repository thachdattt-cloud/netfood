require('dotenv').config()
const express = require('express')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET', 'POST'] }
})

// Gắn io vào app để dùng trong controllers
app.set('io', io)

// Middlewares
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }))
app.use(express.json())

// Routes
app.use('/api/auth', require('./routes/auth.route'))
app.use('/api/menu', require('./routes/menuItem.route'))
app.use('/api/orders', require('./routes/order.route'))
app.use('/api/tables', require('./routes/table.route'))
app.use('/api/categories', require('./routes/category.route'))



// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'NetFood API đang chạy!' }))

// Socket.io — realtime
io.on('connection', (socket) => {
  console.log(`🔌 Client kết nối: ${socket.id}`)

  // Bếp join room riêng để nhận order mới
  socket.on('join_kitchen', () => {
    socket.join('kitchen')
    console.log(`👨‍🍳 Bếp đã join: ${socket.id}`)
  })

  // Khách join room theo số máy
  socket.on('join_table', (tableNumber) => {
    socket.join(`table_${tableNumber}`)
    console.log(`💻 Máy ${tableNumber} đã join: ${socket.id}`)
  })

  socket.on('disconnect', () => {
    console.log(`❌ Client ngắt kết nối: ${socket.id}`)
  })
})

// Error handler — phải để cuối cùng
app.use(require('./middlewares/error.middleware'))

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`🚀 NetFood server đang chạy trên port ${PORT}`))
