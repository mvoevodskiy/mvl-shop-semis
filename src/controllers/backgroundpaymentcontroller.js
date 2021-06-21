const { MVLoaderBase } = require('mvloader')

class BackgroundPaymentController extends MVLoaderBase {
  constructor (App, ...config) {
    const localDefaults = {}
    super(localDefaults, ...config)
    this.App = App

    /**
     * @param {number} id
     * @param {number} userId
     * @param {number} CreatorId
     * @param {boolean|null} active
     * @return {Promise<mvlShopCustomerPayment[]>}
     */
    // this.get = async ({ id = 0, userId = 0, CreatorId = 0, active = true }) => {
    //   const where = {}
    //   if (id) where.id = id
    //   if (userId) where.CreatorId = userId
    //   if (CreatorId) where.CreatorId = CreatorId
    //   if (active !== null && active !== undefined) where.active = active
    //   return this.App.DB.models.mvlShopCustomerPayment.findAll({ where, logging: console.log })
    // }
  }

  async init () {
    return super.init()
  }

  async initFinish () {
    super.initFinish()
    this.Shop = this.App.ext.semis.mvlShop
  }

  async pay (order) {
    order = await this.Shop.Order.get(order)
    let success = false
    const customerPayments = await this.App.ext.controllers.mvlShopCustomerPayment.getAll({ CreatorId: order.CustomerId })
    for (const customerPayment of customerPayments) {
      const extended = order.extended
      extended.customerPaymentKey = customerPayment.key
      order.set('extended', extended)
      order.set('PaymentId', customerPayment.PaymentId)
      await order.save()
      const response = await this.Shop.Payment.saved(order)
      success = response.success
      // console.log('BACKGROUND PAYMENT. CUSTOMER PAYMENT ID', customerPayment.id, 'SUCCESS? ', success)
      if (success) break
    }
    return this.response(success, '', { order })
  }
}

module.exports = BackgroundPaymentController
