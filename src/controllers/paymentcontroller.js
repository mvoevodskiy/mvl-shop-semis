const { MVLoaderBase } = require('mvloader')
const mt = require('mvtools')

class PaymentController extends MVLoaderBase {
  constructor (App, ...config) {
    const localDefaults = {}
    super(localDefaults, ...config)
    this.App = App

    this.get = async (paymentNameOrId) => {
      if (typeof paymentNameOrId !== 'object') {
        const payment = await this.App.DB.models.mvlShopPayment.findOne({
          where: {
            active: true,
            [this.App.DB.S.Op.or]: {
              id: paymentNameOrId,
              name: paymentNameOrId
            }
          }
        })
        return payment || this.failure('Payment not found or disabled')
      }
      return (typeof paymentNameOrId === 'object') ? paymentNameOrId : this.failure('Unknown type of input parameter')
    }

    /**
     *
     * @param {int|mvlShopPayment} paymentNameOrId
     * @param {mvlShopOrder} order
     * @return {Promise<float>}
     */
    this.cost = async (paymentNameOrId, order = null) => {
      const payment = await this.get(paymentNameOrId)
      if (payment) {
        let cost = payment.cost
        if (!this.MT.empty(payment.controller)) {
          cost = await this.call(payment.controller, 'cost', payment, order)
        }
        console.log('PAYMENT COST', cost)
        return isNaN(cost) ? 0 : cost
      }
      return 0
    }

    /**
     *
     * @param {mvlShopOrder|int} order
     * @return {Promise<string>}
     */
    this.link = async (order) => {
      // console.log(paymentNameOrId)
      // console.log(order)
      // console.log('PAYMENT LINK. ORDER ID', order.id)
      order = await this.Shop.Order.get(order)
      if (order.cost !== 0) {
        // console.log('PAYMENT LINK. TRY TO CALL CONTROLLER', payment.controller)
        /** @type {basicResponse} */
        const response = await this.executeExternal('link', order)
        // console.log('PAYMENT LINK. RESPONSE', response)
        if (response.success) return response.data.link || ''
      }
      return ''
    }

    this.saved = async (order) => {
      order = await this.Shop.Order.get(order)
      if (order.cost !== 0) {
        // console.log('PAYMENT LINK. TRY TO CALL CONTROLLER', payment.controller)
        /** @type {basicResponse} */
        const response = await this.executeExternal('saved', order)
        return response
      } else await this.Shop.Status.paid(order)
      return this.success()
    }

    this.executeExternal = async (method, orderOrId, externalRequired = false) => {
      // console.log(paymentNameOrId)
      // console.log(order)
      // let payment
      let success = true
      let message = ''
      let data = {}
      const { order, payment } = await this.getPaymentAndOrder(orderOrId)
      // console.log('PAYMENT LINK. ORDER ID', order.id)
      if (!mt.empty(payment)) {
        if (!mt.empty(payment.controller)) {
          const response = await this.call(payment.controller, method, order, payment)
          message = response.message
          data = response.data
          if (!response.success) {
            if (response.message === 'Method not found' && !externalRequired) {
              message = ''
            } else {
              success = false
            }
          }
        }
      } else {
        success = false
        message = 'Payment not found'
      }
      return this.response(success, message, data)
    }

    /**
     *
     * @param {string} controller
     * @param {string} methodName
     * @param {*} [params]
     * @return {basicResponse|*}
     */
    this.call = (controller, methodName, ...params) => this.Shop.call(controller, methodName, ...params)
  }

  async init () {
    return super.init()
  }

  async initFinish () {
    super.initFinish()
    this.Shop = this.App.ext.semis.mvlShop
  }

  async savePaymentDataToUser ({ user, payment, paymentData }) {
    // if (typeof user === 'number') user = await this.DB.models.mvlUser.findByPk(user)
    // if (!this.MT.empty(user)) const profile = await user.getProfile()
    // payment = await this.get(payment)
    // if (!this.MT.empty(profile) && !this.MT.empty(payment)) {
    //   const extended = profile.extended
    //
    // }
  }

  async getPaymentAndOrder (orderOrId) {
    // console.log(paymentNameOrId)
    // console.log(orderOrId)
    const order = await this.Shop.Order.get(orderOrId)
    const payment = await order.getPayment()
    console.log('PAYMENT CONTROLLER. GET PAYMENT AND ORDER. ORDER', order.get({ plain: true }), 'PAYMENT', payment.get({ plain: true }))
    return { payment, order }
  }
}

module.exports = PaymentController
