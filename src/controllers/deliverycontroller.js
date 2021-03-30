const { MVLoaderBase } = require('mvloader')

class DeliveryController extends MVLoaderBase {
  constructor (App, ...config) {
    const localDefaults = {}
    super(localDefaults, ...config)
    this.App = App

    this.get = (deliveryNameOrId) => {
      if (typeof deliveryNameOrId !== 'object') {
        const payment = this.App.DB.models.mvlShopPayment.findOne({
          where: {
            [this.App.DB.S.Op.or]: {
              id: deliveryNameOrId,
              name: deliveryNameOrId
            }
          }
        })
        return payment
      }
      return (typeof deliveryNameOrId === 'object') ? deliveryNameOrId : this.failure('Unknown type of input parameter')
    }

    /**
     *
     * @param {int|mvlShopDelivery} deliveryNameOrId
     * @param {mvlShopOrder} order
     * @return {Promise<float>}
     */
    this.cost = async (deliveryNameOrId, order = null) => {
      const payment = this.get(deliveryNameOrId)
      if (payment) {
        let cost = payment.cost
        if (!this.MT.empty(payment.handler)) {
          cost = await this.call(payment.handler, 'cost', order)
        }
        console.log('DELIVERY COST', cost)
        return isNaN(cost) ? 0 : cost
      }
      return 0
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

module.exports = DeliveryController
