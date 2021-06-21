const { MVLoaderBase } = require('mvloader')
const mt = require('mvtools')

class CustomerAccountController extends MVLoaderBase {
  constructor (App, ...config) {
    const localDefaults = {}
    super(localDefaults, ...config)
    this.App = App
    this.Shop = null

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
        if (!mt.empty(delivery.controller)) {
          cost = await this.call(delivery.controller, 'cost', delivery, order)
        }
        // console.log('DELIVERY COST', cost)
        return isNaN(cost) ? 0 : cost
      }
      return 0
    }
  }

  async init () {
    return super.init()
  }

  async initFinish () {
    await super.initFinish()
    this.Shop = this.App.ext.semis.mvlShop
  }

  async get (accountOrTypeOrId, customer) {
    let account = accountOrTypeOrId
    if (typeof accountOrTypeOrId === 'number') {
      account = await this.App.DB.models.mvlShopCustomerAccount.findByPk(accountOrTypeOrId)
    } else if (typeof accountOrTypeOrId === 'string') {
      if (typeof customer === 'number') {
        account = await this.App.DB.models.mvlShopCustomerAccount.findOne({ where: { type: accountOrTypeOrId, CustomerId: customer } })
      } else if (customer instanceof this.App.DB.models.mvlUser) {
        const accounts = await customer.getAccounts({ where: { type: accountOrTypeOrId } })
        if (accounts.length) account = accounts[0]
      }
    }
    return (account instanceof this.App.DB.models.mvlShopCustomerAccount)
      ? account
      : (
          customer instanceof this.App.DB.models.mvlUser
            ? this.App.DB.models.mvlShopCustomerAccount.build({ CustomerId: customer.id, type: accountOrTypeOrId })
            : null
        )
  }

  /**
   *
   * @param {mvlShopCustomerAccount|number|string} account Instance of mvlShopCustomerAccount or Account ID or Account type
   * @param {mvlUser|number} customer Instance of mvlUser or mvlUserId or amount (delta). Required Customer (instance or id) if first parameter is account type
   * @param {number|Object<string,*>|undefined} [amount] Amount (delta) of values object. Required amount if second parameter is Customer
   * @param {Object<string,*>|undefined} [values] Values object if third parameter is amount. Optional
   * @return {Promise<void>}
   */
  async increase (account, customer, amount, values) {
    if (values === undefined) {
      values = amount || {}
      amount = customer
    }
    account = await this.get(account)
    if (account !== null) {
      // console.log('ACCOUNT ID', account.id, 'BALANCE', account.get('balance'), 'AMOUNT', amount)
      account.set('balance', account.get('balance') + amount)
      await account.save()
      // console.log('AFTER SAVE. ACCOUNT ID', account.id, 'BALANCE', account.get('balance'), 'AMOUNT', amount)
      await this.accountLog(account, amount, values)
    }
  }

  async accountLog (account, amount, values = {}) {
    return await account.createLog(mt.merge(values, { amount, type: account.type }))
  }
}

module.exports = CustomerAccountController
