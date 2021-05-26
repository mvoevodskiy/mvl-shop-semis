const { MVLoaderBase } = require('mvloader')

class StatusController extends MVLoaderBase {
  constructor (App, ...config) {
    const localDefaults = {}
    super(localDefaults, ...config)
    this.App = App

    this.get = async (statusNameOrKeyOrId) => {
      if (typeof statusNameOrKeyOrId !== 'object') {
        const payment = await this.App.DB.models.mvlShopOrderStatus.findOne({
          where: {
            [this.App.DB.S.Op.or]: {
              id: statusNameOrKeyOrId,
              name: statusNameOrKeyOrId,
              key: statusNameOrKeyOrId
            }
          },
          logging: console.log
        })
        return payment
      }
      return (typeof statusNameOrKeyOrId === 'object') ? statusNameOrKeyOrId : this.failure('Unknown type of input parameter')
    }

    // this.change = async ({ order, status }) => {
    //   order = await this.Order.get(order)
    //   status = await this.get(status)
    //   if (!this.MT.empty(order)) {
    //     const currentStatus = await order.getStatus()
    //     console.log('STATUS CHAN?GE. CURRENT STATUS TYPE', typeof currentStatus, currentStatus, 'NEW STATUS', status)
    //     if (this.MT.empty(currentStatus) || !currentStatus.finished || (currentStatus.fixed && currentStatus.rank < status.rank)) {
    //       return this.response(await order.setStatus(status))
    //     }
    //   }
    //   return this.failure('Empty order')
    // }

    this.new = async (order) => this.change({ order, status: 'new' })
    this.paid = async (order) => this.change({ order, status: 'paid' })
    this.done = async (order) => this.change({ order, status: 'done' })
    this.cancelled = async (order) => this.change({ order, status: 'calncelled' })

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
    this.Cart = this.App.ext.controllers.mvlShopCart
    this.Status = this.App.ext.controllers.mvlShopOrderStatus
    this.Payment = this.App.ext.controllers.mvlShopPayment
    this.Delivery = this.App.ext.controllers.mvlShopDelivery
    this.Order = this.App.ext.controllers.mvlShopOrder
  }

  async change ({ order, status }) {
    order = await this.Order.get(order)
    status = await this.get(status)
    if (!this.MT.empty(order)) {
      const currentStatus = await order.getStatus()
      // console.log('STATUS CHANGE. CURRENT STATUS TYPE', typeof currentStatus, currentStatus, 'NEW STATUS', status)
      if (this.MT.empty(currentStatus) || !currentStatus.finished || (currentStatus.fixed && currentStatus.rank < status.rank)) {
        return this.response(await order.setStatus(status), '', { order, status })
      }
    }
    return this.failure('Empty order')
  }
}

module.exports = StatusController
