import api from './api'
export const createOrder = (data) => api.post('/orders', data)
export const getOrders = (params) => api.get('/orders', { params })
export const getMyOrders = () => api.get('/orders/my')
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status })
