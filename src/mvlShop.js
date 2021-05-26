const { MVLoaderBase } = require('mvloader')

class mvlShop extends MVLoaderBase {
  constructor (App, ...config) {
    const localDefaults = {}
    super(localDefaults, ...config)
    this.App = App

    /**
     *
     * @param {Object|string} controller
     * @param {string} methodName
     * @param {*} [params]
     * @return {basicResponse|*}
     */
    this.call = (controller, methodName, ...params) => {
      if (typeof controller === 'object') controller = controller.controller
      if (!this.MT.empty(controller)) {
        const method = this.MT.extract(controller + '.' + methodName)
        if (typeof method === 'function') {
          return method(...params)
        }
      }
      return this.failure('Method not found', { controller, methodName })
    }
  }

  async init () {
    return super.init()
  }

  async initFinish () {
    await super.initFinish()
    await this.initFillDB()
    this.assignControllers()
  }

  assignControllers () {
    this.Cart = this.App.ext.controllers.mvlShopCart
    this.CustomerPayment = this.App.ext.controllers.mvlShopCustomerPayment
    this.Delivery = this.App.ext.controllers.mvlShopDelivery
    this.Order = this.App.ext.controllers.mvlShopOrder
    this.OrderStatus = this.App.ext.controllers.mvlShopOrderStatus
    this.Payment = this.App.ext.controllers.mvlShopPayment
    this.CustomerPayment = this.App.ext.controllers.mvlShopCustomerPayment
    this.BackgroundPayment = this.App.ext.controllers.mvlShopBackgroundPayment
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
        mvlShopBackgroundPayment: require('./controllers/backgroundpaymentcontroller'),
        mvlShopCustomerPayment: require('./controllers/customerpaymentcontroller'),
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
            mvlShopDelivery: require('./models/mvlShopDelivery'),
            mvlShopCustomerPayment: require('./models/mvlShopCustomerPayment')
          }
        }
      },
      semis: {}
    }
  },
  db: {}
}

module.exports = { mvlShop }
