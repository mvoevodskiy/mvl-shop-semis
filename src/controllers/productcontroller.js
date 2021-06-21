const { MVLoaderBase } = require('mvloader')
const mt = require('mvtools')

class ProductController extends MVLoaderBase {
  constructor (App, ...config) {
    const localDefaults = {}
    super(localDefaults, ...config)
    this.App = App
    this.Shop = null

    // /**
    //  *
    //  * @param {int|mvlShopDelivery} productOrId
    //  * @param {mvlShopOrder} order
    //  * @return {Promise<float>}
    //  */
    // this.cost = async (productOrId, order = null) => {
    //   const product = this.get(productOrId)
    //   if (product) {
    //     let cost = product.cost
    //     if (!mt.empty(product.controller)) {
    //       cost = await this.call(product.controller, 'cost', product, order)
    //     }
    //     console.log('PRODUCT COST', cost)
    //     return isNaN(cost) ? 0 : cost
    //   }
    //   return 0
    // }
  }

  async init () {
    return super.init()
  }

  async initFinish () {
    await super.initFinish()
    this.Shop = this.App.ext.semis.mvlShop
  }

  async get (productOrId) {
    let product = productOrId
    if (typeof productOrId === 'number') {
      product = await this.App.DB.models.mvlShopPayment.findByPk(productOrId)
    }
    return (product instanceof this.App.DB.models.mvlShopProduct) ? product : null
  }

  /**
   *
   * @param {string} controller
   * @param {string} methodName
   * @param {*} [params]
   * @return {basicResponse|*}
   */
  async call (controller, methodName, ...params) {
    return this.Shop.call(controller, methodName, ...params)
  }
}

module.exports = ProductController
