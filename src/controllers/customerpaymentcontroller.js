const { MVLoaderBase } = require('mvloader')
const mt = require('mvtools')

class CustomerPaymentController extends MVLoaderBase {
  constructor (App, ...config) {
    const localDefaults = {}
    super(localDefaults, ...config)
    this.App = App

    this.get = async (customerPaymentOrIdOrKey, where = { active: true }) => {
      if (typeof customerPaymentOrIdOrKey !== 'object') {
        const customerPayment = await this.App.DB.models.mvlShopCustomerPayment.findOne({
          where: mt.merge(where, {
            [this.App.DB.S.Op.or]: {
              id: customerPaymentOrIdOrKey,
              key: customerPaymentOrIdOrKey
            }
          })
        })
        return customerPayment || this.failure('Customer payment not found or disabled')
      }
      return (typeof customerPaymentOrIdOrKey === 'object') ? customerPaymentOrIdOrKey : this.failure('Unknown type of input parameter')
    }

    /**
     * @param {number} id
     * @param {number} userId
     * @param {number} CreatorId
     * @param {boolean|null} active
     * @return {Promise<mvlShopCustomerPayment[]>}
     */
    this.getAll = async ({ id = 0, userId = 0, CreatorId = 0, active = true }) => {
      const where = {}
      if (id) where.id = id
      if (userId) where.CreatorId = userId
      if (CreatorId) where.CreatorId = CreatorId
      if (active !== null && active !== undefined) where.active = active
      return this.App.DB.models.mvlShopCustomerPayment.findAll({ where })
    }

    /**
     *
     * @param {number|mvlUser} creatorOrId
     * @param {number|mvlShopPayment} payment
     * @param {Object} values
     * @return {Promise<basicResponse>}
     */
    this.save = async (creatorOrId, payment, values) => {
      payment = await this.Shop.Payment.get(payment)
      values = await this.allValues(values, creatorOrId)
      const dbResponse = await this.App.DB.models.mvlShopCustomerPayment.findOrCreate({ where: { key: values.key } })
      const customerPayment = dbResponse[0]
      // console.log('CUSTOMER PAYMENT CONTROLLER. SAVED?', customerPayment)
      if (customerPayment !== null) {
        customerPayment.set(values)
        await customerPayment.save()
        await customerPayment.setPayment(payment)
        return this.success('', customerPayment)
      }
      return this.failure('Create failed')
    }

    this.allValues = (values, creator = null) => {
      const defValues = {
        key: '',
        rank: 0,
        active: true,
        controller: '',
        extended: {}
      }
      const allValues = this.MT.mergeRecursive(defValues, values)
      if (mt.empty(allValues.name)) allValues.name = allValues.key + ' ' + allValues.mask
      if (creator !== null) {
        allValues.CreatorId = typeof creator === 'object' ? creator.id : creator
      }
      return allValues
    }
  }

  async init () {
    return super.init()
  }

  async initFinish () {
    super.initFinish()
    this.Shop = this.App.ext.semis.mvlShop
  }
}

module.exports = CustomerPaymentController
