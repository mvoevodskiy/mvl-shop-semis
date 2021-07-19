const { MVLoaderBase } = require('mvloader')
const mt = require('mvtools')

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
      // console.log(cartOrCustomerId)
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

    this.add = async (cartOrCustomerId, productOrId, modOrId, count, options = {}) => {
      const cart = await this.get(cartOrCustomerId)
      const { product, mod } = await this.getProductAndMod(productOrId, modOrId)
      // console.log(product)
      if (mt.empty(cart)) return this.failure('Empty cart', {}, this.Shop.ERROR_CODES.CART_NOT_FOUND)
      if (mt.empty(product)) return this.failure('Empty product', {}, this.Shop.ERROR_CODES.PRODUCT_IS_EMPTY)
      if ((mt.empty(mod) || !mod.id) && !this.Shop.config.allowZeroMod) return this.failure('Empty mod', {}, this.Shop.ERROR_CODES.MOD_EMPTY_NOT_ALLOWED)
      const key = this.getKey(product, mod, options)
      if (key in cart.goods) return this.change(cart, key, cart.goods[key].count + count)
      const goods = cart.goods
      goods[key] = this.getGood(product, mod, count)
      cart.set('goods', goods)
      return this.set(cart)
    }

    this.change = async (cartOrCustomerId, key, count) => {
      // console.log('CART CHANGE. KEY', key, 'COUNT', count)
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

    this.clean = async (cartOrCustomerId) => {
      const cart = await this.get(cartOrCustomerId)
      if (cart) {
        cart.set('goods', {})
        cart.set('cost', 0)
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
      cart.cost = cost
      return { count, totalCount, cost, weight }
    }

    this.getKey = (product, mod, options) => this.MT.md5(product.id + product.price + mod.id + mod.price + JSON.stringify(options))

    /**
     *
     * @param {mvlShopProduct|number} productOrId
     * @param {mvlShopProductMod|number|null} modOrId
     * @return {Promise<{product: mvlShopProduct|null, mod: mvlShopProductMod|null}>}
     */
    this.getProductAndMod = async (productOrId, modOrId = null) => {
      const product = await this.Shop.Product.get(productOrId)
      let mod = modOrId
      if (typeof modOrId === 'number') {
        mod = await this.App.DB.models.mvlShopProductMod.findByPk(modOrId)
      }
      if (!(mod instanceof this.App.DB.models.mvlShopProductMod) && product instanceof this.App.DB.models.mvlShopProduct) {
        mod = this.App.DB.models.mvlShopProductMod.build({
          id: null,
          name: product.name,
          price: product.price,
          weight: product.weight
        })
      }
      return { product, mod }
    }

    this.getGood = (product, mod, count = 1, options = {}) => {
      const isMod = mod instanceof this.App.DB.models.mvlShopProductMod
      return {
        productId: product.id,
        modId: isMod ? mod.id : null,
        name: isMod && !mt.empty(mod.name) ? (this.App.config.goodFullNames ? product.name + ' ' + mod.name : mod.name) : product.name,
        price: isMod ? mod.price : product.price,
        count,
        cost: (isMod ? mod.price : product.price) * count,
        weight: isMod && mod.weight ? mod.weight : product.weight,
        options
      }
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

module.exports = CartController
