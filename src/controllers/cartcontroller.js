const { MVLoaderBase } = require('mvloader')

class CartController extends MVLoaderBase {
  constructor (App, ...config) {
    const localDefaults = {}
    super(localDefaults, ...config)
    this.App = App

    /**
     *
     * @param {mvlShopCart|int} cartOrCustomerId
     * @return {Promise<mvlShopCart|boolean>}
     */
    this.get = async (cartOrCustomerId) => {
      if (typeof cartOrCustomerId === 'number') {
        let cart = await this.App.DB.models.mvlShopCart.findOne({ where: { CustomerId: cartOrCustomerId } })
        if (cart === null) cart = await this.App.DB.models.mvlShopCart.build({ CustomerId: cartOrCustomerId })
        return cart
      }
      return (typeof cartOrCustomerId === 'object' && typeof cartOrCustomerId.goods === 'object') ? cartOrCustomerId : false
    }

    this.set = async (cart) => {
      cart.cost = (await this.status(cart)).cost
      return cart.save()
    }

    this.add = async (cartOrCustomerId, product, count, options = {}) => {
      const cart = await this.get(cartOrCustomerId)
      product = await this.getProduct(product)
      // console.log(product)
      if (this.MT.empty(cart)) return this.failure('Empty cart')
      if (this.MT.empty(product)) return this.failure('Empty product')
      const key = this.getKey(product, options)
      if (key in cart.goods) return this.change(cart, key, count)
      const goods = cart.goods
      const good = this.getGood(product, count)
      goods[key] = good
      cart.set('goods', goods)
      return this.set(cart)
    }

    this.change = async (cartOrCustomerId, key, count) => {
      console.log('CART CHANGE. KEY', key, 'COUNT', count)
      const cart = await this.get(cartOrCustomerId)
      if (cart) {
        const goods = cart.goods
        goods[key].count += count
        goods[key].cost = goods[key].price * goods[key].count
        cart.set('goods', goods)
        return this.set(cart)
      }
      return this.failure('No cart')
    }

    this.remove = async (cartOrCustomerId, key) => {
      const cart = await this.get(cartOrCustomerId)
      if (cart) {
        const goods = cart.goods
        delete goods[key]
        cart.set('goods', goods)
        return this.set(cart)
      }
      return this.failure('No cart')
    }

    this.clean = async (cartOrCustomerId, key) => {
      const cart = await this.get(cartOrCustomerId)
      if (cart) {
        cart.set('goods', {})
        return this.set(cart)
      }
      return this.failure('No cart')
    }

    this.status = async (cartOrCustomerId) => {
      const cart = await this.get(cartOrCustomerId)
      let totalCount = 0
      let count = 0
      let cost = 0
      let weight = 0
      if (cart) {
        for (const key in cart.goods) {
          if (Object.prototype.hasOwnProperty.call(cart.goods, key)) {
            totalCount += cart.goods[key].count
            count++
            cost += cart.goods[key].price * cart.goods[key].count
            weight += cart.goods[key].weight * cart.goods[key].count
          }
        }
      }
      return { count, totalCount, cost, weight }
    }

    this.getKey = (product, options) => this.MT.md5(product.id + product.price + JSON.stringify(options))

    this.getProduct = async (productId) => {
      return (typeof product === 'number') ? await this.App.DB.models.mvlShopProduct.findByPk(productId) : productId
    }

    this.getGood = (product, count = 1, options = {}) => {
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        count,
        cost: product.price * count,
        weight: product.weight,
        options
      }
    }
  }

  async init () {
    return super.init()
  }

  async initFinish () {
    super.initFinish()
  }
}

module.exports = CartController
