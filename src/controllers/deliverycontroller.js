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
      const delivery = this.get(deliveryNameOrId)
      if (delivery) {
        let cost = delivery.cost
        if (!this.MT.empty(delivery.controller)) {
          cost = await this.call(delivery.controller, 'cost', delivery, order)
        }
        console.log('DELIVERY COST', cost)
        return isNaN(cost) ? 0 : cost
      }
      return 0
    }

    /**
     *
     * @param {string} controller
     * @param {string} methodName
     * @param {*} [params]
     * @return {basicResponse|*}
     */
    this.call = (controller, methodName, ...params) => this.App.ext.semis.mvlShop.call(controller, methodName, ...params)
  }

  async init () {
    return super.init()
  }

  async initFinish () {
    super.initFinish()
  }
}

module.exports = DeliveryController
