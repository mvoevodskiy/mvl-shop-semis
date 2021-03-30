const { MVLoaderBase } = require('mvloader')

class OrderController extends MVLoaderBase {
  constructor (App, ...config) {
    const localDefaults = {
      defaults: {
        payment: 'cash',
        delivery: 'pickup'
      }
    }
    super(localDefaults, ...config)
    this.App = App
  }

  async init () {
    return super.init()
  }

  async initFinish () {
    super.initFinish()
    this.Cart = this.App.ext.controllers.mvlShopCart
    this.Status = this.App.ext.controllers.mvlShopOrderStatus
    this.Payment = this.App.ext.controllers.mvlShopPayment
    this.Delivery = this.App.ext.controllers.mvlShopDelivery
    this.Order = this.App.ext.controllers.mvlShopOrder
  }

  async get (orderId) {
    return (typeof orderId === 'number') ? this.App.DB.models.mvlShopOrder.findByPk(orderId) : orderId
  }

  async submit (cartOrCustomerId, customerId, orderData = undefined) {
    const cart = await this.Cart.get(cartOrCustomerId)
    const customer = await this.getCustomer(customerId)

    if (cart.goods.length === 0 || this.MT.empty(customer)) return false
    orderData = await this.getOrderData(customer, cart, orderData)

    const goods = []
    for (const key in cart.goods) {
      if (Object.prototype.hasOwnProperty.call(cart.goods, key)) {
        const good = await this.App.DB.models.mvlShopOrderProduct.build(cart.goods[key])
        good.ProductId = cart.goods[key].productId
        goods.push(good)
      }
    }

    let where = {}

    if (typeof orderData.payment === 'number') where = { id: orderData.payment }
    else if (typeof orderData.payment === 'string') where = { key: orderData.payment }
    else where = { key: this.config.defaults.payment }
    const payment = await this.App.DB.models.mvlShopPayment.findOne({ where })
    if (payment === null) return this.failure('Payment not found')
    orderData.PaymentId = payment.id

    if (typeof orderData.delivery === 'number') where = { id: orderData.delivery }
    else if (typeof orderData.delivery === 'string') where = { key: orderData.delivery }
    else where = { key: this.config.defaults.delivery }
    const delivery = await this.App.DB.models.mvlShopDelivery.findOne({ where })
    if (delivery === null) return this.failure('Delivery not found')
    orderData.DeliveryId = delivery.id

    const order = await this.App.DB.models.mvlShopOrder.build(orderData)
    const address = await this.App.DB.models.mvlShopOrderAddress.build(orderData)

    await this.create({ order, address, goods, payment, delivery })
    await this.Status.new(order)
    const responseData = {
      order,
      paymentLink: await this.Payment.link(order)
    }
    await this.Cart.clean(cart)
    return this.response(!!order.id, '', responseData)
  }

  async create ({ order, address, goods, payment, delivery }) {
    order.cost += await this.Delivery.cost(delivery, order)
    order.cost += await this.Payment.cost(payment, order)
    await order.save()
    await address.save()

    await order.setAddress(address)
    await this.saveGoods(goods)
    await order.setGoods(goods)
  }

  async saveGoods (goods) {
    const promises = []
    for (const good of goods) {
      // good.ProductId = good.productId
      promises.push(good.save())
    }
    return Promise.all(promises)
  }

  async getCustomer (customerId) {
    return (typeof customerId === 'number') ? this.App.DB.models.mvlUser.findByPk(customerId) : customerId
  }

  async getOrderData (customer, cart, orderData = {}) {
    return this.MT.merge(
      {
        cost: cart.cost,
        cartCost: cart.cost,
        CustomerId: customer.id
      },
      (await customer.getProfile()).get({ plain: true }),
      orderData,
      { id: null }
    )
  }
}

module.exports = OrderController
