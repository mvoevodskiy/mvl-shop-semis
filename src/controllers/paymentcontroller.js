const { MVLoaderBase } = require('mvloader')

class CartController extends MVLoaderBase {
  constructor (App, ...config) {
    const localDefaults = {}
    super(localDefaults, ...config)
    this.App = App

    this.get = (paymentNameOrId) => {
      if (typeof paymentNameOrId !== 'object') {
        const payment = this.App.DB.models.mvlShopPayment.findOne({
          where: {
            [this.App.DB.S.Op.or]: {
              id: paymentNameOrId,
              name: paymentNameOrId
            }
          }
        })
        return payment
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
      const payment = this.get(paymentNameOrId)
      if (payment) {
        let cost = payment.cost
        if (!this.MT.empty(payment.handler)) {
          cost = await this.call(payment.handler, 'cost', order)
        }
        console.log('PAYMENT COST', cost)
        return isNaN(cost) ? 0 : cost
      }
      return 0
    }

    /**
     *
     * @param {int|mvlShopPayment} paymentNameOrId
     * @param {mvlShopOrder} order
     * @return {Promise<string>}
     */
    this.link = async (paymentNameOrId, order) => {
      let payment
      if (order === undefined) {
        order = await this.App.ext.controllers.mvlShopOrder.get(paymentNameOrId)
        payment = await order.getPayment()
      } else {
        payment = this.get(paymentNameOrId)
      }
      if (order.cost !== 0 && !this.MT.empty(payment) && payment.handler) {
        /** @type {basicResponse} */
        const linkResponse = await this.call(payment.handler, 'link', [payment, order])
        if (linkResponse.success) return linkResponse.data.link
      }
      return 'https://ya.ru'
    }

    /**
     *
     * @param {string} handler
     * @param {string} methodName
     * @param {*} [params]
     * @return {basicResponse|*}
     */
    this.call = (handler, methodName, params = []) => this.App.ext.semis.mvlShop.call(handler, methodName, params)
  }

  async init () {
    return super.init()
  }

  async initFinish () {
    super.initFinish()
  }
}

module.exports = CartController
