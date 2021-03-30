module.exports = (Sequelize) => {
  return [
    {
      name: Sequelize.STRING,
      count: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 1
      },
      weight: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      cost: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      options: {
        type: Sequelize.TEXT,
        defaultValue: '{}',
        allowNull: false,
        get () {
          try {
            return JSON.parse(this.getDataValue('options'))
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
          this.setDataValue('options', val)
        }
      }

    },
    // Model options
    {
      indexes: [
      ]
    },
    // Model associations
    {
      belongsTo: [
        {
          model: 'mvlShopOrder',
          as: 'Order'
        },
        {
          model: 'mvlShopProduct',
          as: 'Product'
        }
      ]
    }
  ]
}
