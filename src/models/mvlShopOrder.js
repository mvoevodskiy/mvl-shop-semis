module.exports = (Sequelize) => {
  return [
    {
      num: Sequelize.STRING,
      cartCost: Sequelize.INTEGER,
      cost: Sequelize.INTEGER,
      comment: Sequelize.TEXT,
      extended: {
        type: Sequelize.TEXT,
        defaultValue: '{}',
        allowNull: false,
        get () {
          try {
            return JSON.parse(this.getDataValue('extended'))
          } catch (e) {
            console.error('GETTER OF extended FIELD OF MODEL mvlShopProduct. RETURN EMPTY OBJECT. ERROR', e)
            return {}
          }
        },
        set (val) {
          try {
            val = typeof val === 'string' ? val : JSON.stringify(val)
          } catch (e) {
            console.error('SETTER OF extended FIELD OF MODEL mvlShopProduct. SETTING EMPTY OBJECT. ERROR', e)
            return '{}'
          }
          this.setDataValue('extended', val)
        }
      }
    },
    // Model options
    {
      indexes: [],

      hooks: {
        afterCreate: (order, options) => {
          if (!order.num) {
            order.num = order.id
          }
        },
        afterBulkCreate: (orders, options) => {
          for (const order of orders) {
            if (!order.num) {
              order.num = order.id
            }
          }
        }
      }
    },
    // Model associations
    {
      belongsTo: [
        {
          model: 'mvlUser',
          as: 'Customer'
        },
        {
          model: 'mvlUserProfile',
          as: 'CustomerProfile'
        },
        {
          model: 'mvlShopOrderAddress',
          as: 'Address'
        },
        {
          model: 'mvlShopOrderStatus',
          as: 'Status'
        },
        {
          model: 'mvlShopPayment',
          as: 'Payment'
        },
        {
          model: 'mvlShopDelivery',
          as: 'Delivery'
        }
      ],
      hasMany: [
        {
          model: 'mvlShopOrderProduct',
          as: 'Goods',
          foreignKey: 'OrderId'
        }
      ]
    }
  ]
}
