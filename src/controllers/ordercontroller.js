const { MVLoaderBase } = require('mvloader')
const { URL } = require('url')
const mt = require('mvtools')

class OrderController extends MVLoaderBase {
  constructor (App, ...config) {
    const localDefaults = {
      payment: 'cash',
      delivery: 'pickup',
      hostUrl: '',
      pageSuccess: '',
      pageFailure: ''
    }
    super(localDefaults, ...config)
    this.App = App
  }

  async init () {
    return super.init()
  }

  async initFinish () {
    super.initFinish()
    this.Shop = this.App.ext.semis.mvlShop
  }

  async get (orderId) {
    return (typeof orderId === 'number' || typeof orderId === 'string')
      ? this.App.DB.models.mvlShopOrder.findOne({
          where: { id: orderId }
        })
      : orderId
  }

  async submit (cartOrCustomerId, customerId, orderData = undefined) {
    const cart = await this.Shop.Cart.get(cartOrCustomerId)
    const customer = await this.getCustomer(customerId)

    if (cart.goods.length === 0 || this.MT.empty(customer)) return false
    orderData = await this.getOrderData(customer, cart, orderData)

    const goods = []
    for (const key in cart.goods) {
      if (Object.prototype.hasOwnProperty.call(cart.goods, key)) {
        const good = await this.App.DB.models.mvlShopOrderProduct.build(cart.goods[key])
        good.ProductId = cart.goods[key].productId
        good.ModId = cart.goods[key].modId
        goods.push(good)
      }
    }

    let where = {}

    let payment = null
    if (!mt.empty(orderData.extended.customerPaymentKey) || !mt.empty(orderData.extended.customerPaymentId)) {
      if (!mt.empty(orderData.extended.customerPaymentId)) where = { id: orderData.extended.customerPaymenId }
      else if (!mt.empty(orderData.extended.customerPaymentKey)) where = { key: orderData.extended.customerPaymentKey }
      const customerPayment = await this.App.DB.models.mvlShopCustomerPayment.findOne({ where })
      if (customerPayment !== null) {
        payment = await customerPayment.getPayment()
      }
    }
    if (payment === null) {
      where = !mt.empty(orderData.payment)
        ? {
            [this.App.DB.S.Op.or]: {
              id: orderData.payment,
              key: orderData.payment
            }
          }
        : { key: this.config.payment }
      payment = await this.App.DB.models.mvlShopPayment.findOne({ where })
    }
    if (payment === null) return this.failure('Payment not found')
    orderData.PaymentId = payment.id

    if (typeof orderData.delivery === 'number') where = { id: orderData.delivery }
    else if (typeof orderData.delivery === 'string') where = { key: orderData.delivery }
    else where = { key: this.config.delivery }
    const delivery = await this.App.DB.models.mvlShopDelivery.findOne({ where })
    if (delivery === null) return this.failure('Delivery not found')
    orderData.DeliveryId = delivery.id

    // console.log('ORDER DATA', orderData)

    const order = await this.App.DB.models.mvlShopOrder.build(orderData)
    const address = await this.App.DB.models.mvlShopOrderAddress.build(orderData)

    // console.log('ORDER COST BEFORE CREATE', order.cost)
    await this.create({ order, address, goods, payment, delivery })
    await this.Shop.OrderStatus.new(order)
    const success = !!order.id
    const responseData = {
      order,
      paymentLink: await this.Shop.Payment.link(order),
      pageLink: await this.getPageLink(success, order)
    }
    await this.Shop.Cart.clean(cart)
    return this.response(success, '', responseData)
  }

  async create ({ order, address, goods, payment, delivery }) {
    order.cost += await this.Shop.Delivery.cost(delivery, order)
    // console.log('ORDER COST WITH DELIVERY', order.cost)
    order.cost += await this.Shop.Payment.cost(payment, order)
    // console.log('ORDER COST WITH PAYMENT', order.cost)
    order.extended = order.extended || {}
    await order.save()
    await address.save()
    // console.log('ORDER CREATED. EXTENDED:', order.extended)

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
    orderData = this.MT.merge(
      {
        cost: cart.cost,
        cartCost: cart.cost,
        CustomerId: customer.id,
        extended: {}
      },
      (await customer.getProfile()).get({ plain: true }),
      orderData,
      { id: null }
    )
    // delete orderData.UserId
    return orderData
  }

  async getPageLink (success = true, order) {
    if (!mt.empty(this.config.hostUrl)) {
      // console.log('ORDER CONTROLLER. GET PAGE LINK. ORDER', order)
      const url = new URL(this.config.hostUrl)
      url.pathname = this.config[success ? 'pageSuccess' : 'pageFailure']
      url.searchParams.append('orderId', typeof order === 'number' ? order : order.id)
      const profile = await order.getCustomerProfile()
      if (!mt.empty(profile) && !mt.empty(profile.language) && typeof profile === 'object' && !mt.empty(profile.language)) url.searchParams.append('language', profile.language)
      return url.toString()
    }
    return ''
  }
}

module.exports = OrderController
