module.exports = {
  mvlShopOrderStatus: [
    {
      name: 'Новый',
      key: 'new',
      rank: 1,
      active: true,
      fixed: false
    },
    {
      name: 'Оплачен',
      key: 'paid',
      rank: 2,
      active: true,
      fixed: false
    },
    {
      name: 'Отправлен',
      key: 'done',
      rank: 3,
      active: true,
      fixed: true
    },
    {
      name: 'Отменён',
      key: 'cancelled',
      rank: 4,
      active: true,
      fixed: true
    }
  ],
  mvlShopDelivery: [
    {
      name: 'Самовывоз',
      key: 'pickup',
      rank: 1,
      active: true
    }
  ],
  mvlShopPayment: [
    {
      name: 'Наличными',
      key: 'cash',
      rank: 1,
      active: true
    }
  ]
}
