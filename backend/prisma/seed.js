const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu...')

  // ==================== USERS ====================
  const hashedPassword = await bcrypt.hash('123456', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@netfood.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@netfood.com', password: hashedPassword, role: 'ADMIN' }
  })

  const kitchen = await prisma.user.upsert({
    where: { email: 'bep@netfood.com' },
    update: {},
    create: { name: 'Bếp trưởng', email: 'bep@netfood.com', password: hashedPassword, role: 'KITCHEN' }
  })

  const staff = await prisma.user.upsert({
    where: { email: 'nhanvien@netfood.com' },
    update: {},
    create: { name: 'Nhân viên', email: 'nhanvien@netfood.com', password: hashedPassword, role: 'STAFF' }
  })

  console.log('✅ Tạo users xong')

  // ==================== TABLES (Máy) ====================
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000'

  for (let i = 1; i <= 20; i++) {
    await prisma.table.upsert({
      where: { number: i },
      update: {},
      create: {
        number: i,
        qrCode: `${CLIENT_URL}/menu?table=${i}`,
        isActive: true
      }
    })
  }

  console.log('✅ Tạo 20 máy xong')

  // ==================== CATEGORIES ====================
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'do-uong' }, update: {}, create: { name: 'Đồ uống', slug: 'do-uong' } }),
    prisma.category.upsert({ where: { slug: 'an-vat' }, update: {}, create: { name: 'Ăn vặt', slug: 'an-vat' } }),
    prisma.category.upsert({ where: { slug: 'com-chay' }, update: {}, create: { name: 'Cơm - Cháy', slug: 'com-chay' } }),
    prisma.category.upsert({ where: { slug: 'mi-bun' }, update: {}, create: { name: 'Mì - Bún', slug: 'mi-bun' } }),
    prisma.category.upsert({ where: { slug: 'do-nhanh' }, update: {}, create: { name: 'Đồ ăn nhanh', slug: 'do-nhanh' } }),
  ])

  const [doUong, anVat, comChay, miBun, doNhanh] = categories
  console.log('✅ Tạo danh mục xong')

  // ==================== MENU ITEMS ====================
  const menuItems = [
    // Đồ uống
    { name: 'Trà đá', slug: 'tra-da', price: 5000, categoryId: doUong.id, description: 'Trà đá mát lạnh, uống là ghiền' },
    { name: 'Nước ngọt Coca', slug: 'nuoc-ngot-coca', price: 15000, categoryId: doUong.id, description: 'Coca Cola lon 330ml lạnh' },
    { name: 'Nước ngọt Pepsi', slug: 'nuoc-ngot-pepsi', price: 15000, categoryId: doUong.id, description: 'Pepsi lon 330ml lạnh' },
    { name: 'Nước tăng lực Redbull', slug: 'redbull', price: 20000, categoryId: doUong.id, description: 'Redbull tăng lực, chơi game không buồn ngủ' },
    { name: 'Nước tăng lực Sting', slug: 'sting', price: 12000, categoryId: doUong.id, description: 'Sting dâu/vàng lon 330ml' },
    { name: 'Nước suối', slug: 'nuoc-suoi', price: 8000, categoryId: doUong.id, description: 'Nước suối Aquafina 500ml' },
    { name: 'Cà phê đen đá', slug: 'ca-phe-den-da', price: 20000, categoryId: doUong.id, description: 'Cà phê đen đậm đà, tỉnh ngủ cực nhanh' },
    { name: 'Cà phê sữa đá', slug: 'ca-phe-sua-da', price: 25000, categoryId: doUong.id, description: 'Cà phê sữa đặc béo ngậy' },
    { name: 'Trà sữa trân châu', slug: 'tra-sua-tran-chau', price: 35000, categoryId: doUong.id, description: 'Trà sữa trân châu đen thơm ngon' },

    // Ăn vặt
    { name: 'Bắp rang bơ', slug: 'bap-rang-bo', price: 20000, categoryId: anVat.id, description: 'Bắp rang bơ thơm lừng, ăn khi cày game' },
    { name: 'Snack khoai tây', slug: 'snack-khoai-tay', price: 15000, categoryId: anVat.id, description: 'Pringles hoặc Lay\'s đủ vị' },
    { name: 'Xúc xích nướng', slug: 'xuc-xich-nuong', price: 15000, categoryId: anVat.id, description: 'Xúc xích nướng thơm ngon, 2 cái/phần' },
    { name: 'Trứng cút lắc', slug: 'trung-cut-lac', price: 20000, categoryId: anVat.id, description: 'Trứng cút lắc muối tỏi ớt, 10 viên' },
    { name: 'Khoai tây chiên', slug: 'khoai-tay-chien', price: 25000, categoryId: anVat.id, description: 'Khoai tây chiên giòn rụm, có sốt tương ớt' },
    { name: 'Bánh tráng nướng', slug: 'banh-trang-nuong', price: 20000, categoryId: anVat.id, description: 'Bánh tráng nướng mỡ hành trứng cút' },

    // Cơm - Cháo
    { name: 'Cơm trắng', slug: 'com-trang', price: 5000, categoryId: comChay.id, description: 'Cơm trắng dẻo ngon' },
    { name: 'Cơm chiên dương châu', slug: 'com-chien-duong-chau', price: 35000, categoryId: comChay.id, description: 'Cơm chiên dương châu trứng thơm béo' },
    { name: 'Cơm gà xối mỡ', slug: 'com-ga-xoi-mo', price: 45000, categoryId: comChay.id, description: 'Cơm gà xối mỡ giòn, kèm nước mắm tỏi' },
    { name: 'Cháo trắng', slug: 'chao-trang', price: 20000, categoryId: comChay.id, description: 'Cháo trắng loãng ăn khuya' },
    { name: 'Cháo gà', slug: 'chao-ga', price: 35000, categoryId: comChay.id, description: 'Cháo gà thơm ngọt, có gừng' },

    // Mì - Bún
    { name: 'Mì tôm trứng', slug: 'mi-tom-trung', price: 20000, categoryId: miBun.id, description: 'Mì tôm hảo hảo + trứng, ăn khuya cực đã' },
    { name: 'Mì xào bò', slug: 'mi-xao-bo', price: 45000, categoryId: miBun.id, description: 'Mì xào giòn với thịt bò và rau cải' },
    { name: 'Mì Ý sốt bò bằm', slug: 'mi-y-sot-bo-bam', price: 50000, categoryId: miBun.id, description: 'Spaghetti sốt bò bằm thơm ngon' },
    { name: 'Bún bò Huế', slug: 'bun-bo-hue', price: 40000, categoryId: miBun.id, description: 'Bún bò Huế cay nồng đúng vị' },
    { name: 'Phở bò', slug: 'pho-bo', price: 45000, categoryId: miBun.id, description: 'Phở bò tái nạm thơm ngon' },

    // Đồ ăn nhanh
    { name: 'Bánh mì trứng', slug: 'banh-mi-trung', price: 20000, categoryId: doNhanh.id, description: 'Bánh mì trứng ốp la, pate, chả lụa' },
    { name: 'Bánh mì thịt nướng', slug: 'banh-mi-thit-nuong', price: 30000, categoryId: doNhanh.id, description: 'Bánh mì thịt nướng sả ớt thơm lừng' },
    { name: 'Burger bò phô mai', slug: 'burger-bo-pho-mai', price: 50000, categoryId: doNhanh.id, description: 'Burger bò 100% beef patty, double cheese' },
    { name: 'Hotdog xúc xích', slug: 'hotdog-xuc-xich', price: 30000, categoryId: doNhanh.id, description: 'Hotdog xúc xích to với sốt mustard, ketchup' },
    { name: 'Pizza mini', slug: 'pizza-mini', price: 45000, categoryId: doNhanh.id, description: 'Pizza mini size 6 inch, topping thập cẩm' },
  ]

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { slug: item.slug },
      update: {},
      create: { ...item, isAvailable: true }
    })
  }

  console.log(`✅ Tạo ${menuItems.length} món ăn xong`)

  // ==================== SAMPLE ORDERS ====================
  const tables = await prisma.table.findMany({ take: 5 })
  const allMenuItems = await prisma.menuItem.findMany()

  const sampleOrders = [
    {
      tableId: tables[0].id,
      status: 'PREPARING',
      items: [
        { menuItemId: allMenuItems.find(m => m.slug === 'ca-phe-sua-da').id, quantity: 2 },
        { menuItemId: allMenuItems.find(m => m.slug === 'bap-rang-bo').id, quantity: 1 },
        { menuItemId: allMenuItems.find(m => m.slug === 'mi-tom-trung').id, quantity: 1 },
      ]
    },
    {
      tableId: tables[1].id,
      status: 'PENDING',
      items: [
        { menuItemId: allMenuItems.find(m => m.slug === 'nuoc-ngot-coca').id, quantity: 2 },
        { menuItemId: allMenuItems.find(m => m.slug === 'khoai-tay-chien').id, quantity: 1 },
      ]
    },
    {
      tableId: tables[2].id,
      status: 'READY',
      note: 'Mang nhanh lên nhé, đang đói',
      items: [
        { menuItemId: allMenuItems.find(m => m.slug === 'com-ga-xoi-mo').id, quantity: 2 },
        { menuItemId: allMenuItems.find(m => m.slug === 'tra-da').id, quantity: 2 },
      ]
    },
    {
      tableId: tables[3].id,
      status: 'DELIVERED',
      items: [
        { menuItemId: allMenuItems.find(m => m.slug === 'burger-bo-pho-mai').id, quantity: 1 },
        { menuItemId: allMenuItems.find(m => m.slug === 'redbull').id, quantity: 2 },
      ]
    },
    {
      tableId: tables[4].id,
      status: 'CONFIRMED',
      note: 'Mì ít cay',
      items: [
        { menuItemId: allMenuItems.find(m => m.slug === 'mi-xao-bo').id, quantity: 1 },
        { menuItemId: allMenuItems.find(m => m.slug === 'tra-sua-tran-chau').id, quantity: 1 },
        { menuItemId: allMenuItems.find(m => m.slug === 'xuc-xich-nuong').id, quantity: 2 },
      ]
    },
  ]

  for (const orderData of sampleOrders) {
    const itemsWithPrice = orderData.items.map(i => {
      const menuItem = allMenuItems.find(m => m.id === i.menuItemId)
      return { ...i, price: menuItem.price }
    })
    const total = itemsWithPrice.reduce((s, i) => s + Number(i.price) * i.quantity, 0)

    await prisma.order.create({
      data: {
        tableId: orderData.tableId,
        status: orderData.status,
        note: orderData.note || null,
        total,
        items: {
          create: itemsWithPrice.map(i => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            price: i.price
          }))
        }
      }
    })
  }

}

main()
  .catch((e) => { console.error('❌ Seed thất bại:', e); process.exit(1) })
  .finally(async () => await prisma.$disconnect())