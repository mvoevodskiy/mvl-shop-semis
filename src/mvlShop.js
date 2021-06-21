const { MVLoaderBase } = require('mvloader')
const mt = require('mvtools')

class mvlShop extends MVLoaderBase {
  constructor (App, ...config) {
    const localDefaults = {
      controlRemains: false,
      allowZeroMod: true
    }
    super(localDefaults, ...config)
    this.App = App

    this.ERROR_CODES = {
      UNKNOWN_INPUT: 1,

      PRODUCT_NOT_FOUND: 10,
      PRODUCT_IS_EMPTY: 11,

      MOD_NOT_FOUND: 20,
      MOD_EMPTY_NOT_ALLOWED: 21,

      CART_NOT_FOUND: 30
    }

    /**
     *
     * @param {Object|string} controller
     * @param {string} methodName
     * @param {*} [params]
     * @return {basicResponse|*}
     */
    this.call = (controller, methodName, ...params) => {
      if (typeof controller === 'object') controller = controller.controller
      if (!mt.empty(controller)) {
        const method = mt.extract(controller + '.' + methodName)
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
    this.CustomerAccount = this.App.ext.controllers.mvlShopCustomerAccount
    this.CustomerAccountLog = this.App.ext.controllers.mvlShopCustomerAccountLog
    this.Delivery = this.App.ext.controllers.mvlShopDelivery
    this.Order = this.App.ext.controllers.mvlShopOrder
    this.OrderStatus = this.App.ext.controllers.mvlShopOrderStatus
    this.Payment = this.App.ext.controllers.mvlShopPayment
    this.Product = this.App.ext.controllers.mvlShopProduct
    this.ProductMod = this.App.ext.controllers.mvlShopProductMod
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
        mvlShopProduct: require('./controllers/productcontroller'),
        mvlShopCart: require('./controllers/cartcontroller'),
        mvlShopBackgroundPayment: require('./controllers/backgroundpaymentcontroller'),
        mvlShopCustomerPayment: require('./controllers/customerpaymentcontroller'),
        mvlShopCustomerAccount: require('./controllers/customeraccountcontroller'),
        mvlShopOrder: require('./controllers/ordercontroller'),
        mvlShopOrderStatus: require('./controllers/statuscontroller'),
        mvlShopPayment: require('./controllers/paymentcontroller'),
        mvlShopDelivery: require('./controllers/deliverycontroller'),
        mvlShopOverride: require('./controllers/overridecontroller')
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
            mvlShopProductOption: require('./models/mvlShopProductOption'),
            mvlShopProductMod: require('./models/mvlShopProductMod'),
            mvlShopProductModOption: require('./models/mvlShopProductModOption'),
            mvlShopCart: require('./models/mvlShopCart'),
            mvlShopOrder: require('./models/mvlShopOrder'),
            mvlShopOrderProduct: require('./models/mvlShopOrderProduct'),
            mvlShopOrderAddress: require('./models/mvlShopOrderAddress'),
            mvlShopOrderStatus: require('./models/mvlShopOrderStatus'),
            mvlShopPayment: require('./models/mvlShopPayment'),
            mvlShopDelivery: require('./models/mvlShopDelivery'),
            mvlShopCustomerAccount: require('./models/mvlShopCustomerAccount'),
            mvlShopCustomerAccountLog: require('./models/mvlShopCustomerAccountLog'),
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
