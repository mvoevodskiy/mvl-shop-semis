const { MVLoaderBase } = require('mvloader')

class mvlShop extends MVLoaderBase {
  constructor (App, ...config) {
    const localDefaults = {}
    super(localDefaults, ...config)
    this.App = App

    /**
     *
     * @param {Object|string} handler
     * @param {string} methodName
     * @param {*} [params]
     * @return {basicResponse|*}
     */
    this.call = (handler, methodName, params = []) => {
      if (typeof handler === 'object') handler = handler.handler
      if (!this.MT.empty(handler)) {
        const method = this.MT.extract(handler + '.' + methodName)
        if (typeof method === 'function') {
          return method(...params)
        }
      }
      return this.failure('Method not found', { handler, methodName })
    }
  }

  async init () {
    return super.init()
  }

  async initFinish () {
    await super.initFinish()
    await this.initFillDB()
  }

  async initFillDB () {
    if (!(await this.App.DB.models.mvlShopOrderStatus.count())) {
      const promises = []
      const defaults = require('./defaultvalues')
      for (const objClass in defaults) {
        if (Object.prototype.hasOwnProperty.call(defaults, objClass)) {
          // console.log('FILENAME', filename)
          try {
            for (const object of defaults[objClass]) {
              promises.push(
                (() => this.App.DB.models[objClass].create(object))()
              )
            }
          } catch (e) {
            console.log(e)
          }
        }
      }
      return Promise.all(promises)
    }
  }
}

mvlShop.exportConfig = {
  ext: {
    classes: {
      semis: {},
      controllers: {
        mvlShopCart: require('./controllers/cartcontroller'),
        mvlShopOrder: require('./controllers/ordercontroller'),
        mvlShopOrderStatus: require('./controllers/statuscontroller'),
        mvlShopPayment: require('./controllers/paymentcontroller'),
        mvlShopDelivery: require('./controllers/deliverycontroller')
      },
      handlers: {}
    },
    configs: {
      controllers: {},
      handlers: {
        DBHandler: {
          sequelize: {},
          models: {
            mvlShopCategory: require('./models/mvlShopCategory'),
            mvlShopProduct: require('./models/mvlShopProduct'),
            mvlShopCart: require('./models/mvlShopCart'),
            mvlShopOrder: require('./models/mvlShopOrder'),
            mvlShopOrderProduct: require('./models/mvlShopOrderProduct'),
            mvlShopOrderAddress: require('./models/mvlShopOrderAddress'),
            mvlShopOrderStatus: require('./models/mvlShopOrderStatus'),
            mvlShopPayment: require('./models/mvlShopPayment'),
            mvlShopDelivery: require('./models/mvlShopDelivery')
          }
        }
      },
      semis: {}
    }
  },
  db: {}
}

module.exports = { mvlShop }
