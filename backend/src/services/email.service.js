const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  // App password của Gmail
  }
})

// Gửi email xác nhận đơn hàng cho khách
exports.sendOrderConfirmation = async ({ to, orderid, items, total, tableNumber }) => {
  const itemsHtml = items.map(i => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${i.menuItem?.name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">×${i.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;color:#ff6b2b;font-weight:bold">
        ${(Number(i.price) * i.quantity).toLocaleString('vi-VN')}đ
      </td>
    </tr>
  `).join('')

  await transporter.sendMail({
    from: `"NetFood 🍜" <${process.env.EMAIL_USER}>`,
    to,
    subject: `✅ Xác nhận đơn hàng #${orderid} — NetFood`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
        <div style="background:#ff6b2b;padding:24px;text-align:center;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0;font-size:24px">🍜 NetFood</h1>
          <p style="color:#fff8;margin:8px 0 0">Đặt hàng thành công!</p>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px">
          <p>Đơn hàng <strong>#${orderid}</strong> từ <strong>Máy ${tableNumber}</strong> đã được tiếp nhận.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <thead>
              <tr style="background:#f9f9f9">
                <th style="padding:8px;text-align:left">Món</th>
                <th style="padding:8px;text-align:center">SL</th>
                <th style="padding:8px;text-align:right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="text-align:right;font-size:18px;font-weight:bold;color:#ff6b2b;border-top:2px solid #eee;padding-top:12px">
            Tổng: ${Number(total).toLocaleString('vi-VN')}đ
          </div>
          <p style="color:#888;font-size:13px;margin-top:16px">Bếp đang chuẩn bị món cho bạn. Vui lòng chờ trong giây lát!</p>
        </div>
      </div>
    `
  })
}

// Gửi email khi đơn sẵn sàng
exports.sendOrderReady = async ({ to, orderId, tableNumber }) => {
  await transporter.sendMail({
    from: `"NetFood 🍜" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🎉 Đơn #${orderId} đã sẵn sàng!`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;text-align:center;padding:32px">
        <div style="font-size:64px">🍜</div>
        <h2 style="color:#ff6b2b">Món của bạn đã sẵn sàng!</h2>
        <p>Đơn hàng <strong>#${orderId}</strong> tại <strong>Máy ${tableNumber}</strong> sẽ được mang đến ngay!</p>
        <p style="color:#888;font-size:13px">Chúc bạn ngon miệng!</p>
      </div>
    `
  })
}