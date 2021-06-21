module.exports = (Sequelize) => {
  return [
    {
      token: Sequelize.STRING,
      name: Sequelize.STRING,
      key: Sequelize.STRING,
      mask: Sequelize.STRING,
      expireYear: Sequelize.INTEGER,
      expireMonth: Sequelize.INTEGER,
      expireDay: Sequelize.INTEGER,
      type: Sequelize.STRING,
      rank: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      controller: Sequelize.STRING,
      extended: {
        type: Sequelize.TEXT,
        defaultValue: '{}',
        allowNull: false,
        get () {
          try {
            return JSON.parse(this.getDataValue('extended'))
          } catch (e) {
            console.error('GETTER OF extended FIELD OF MODEL mvlShopPayment. RETURN EMPTY OBJECT. ERROR', e)
            return {}
          }
        },
        set (val) {
          try {
            val = typeof val === 'string' ? val : JSON.stringify(val)
          } catch (e) {
            console.error('SETTER OF extended FIELD OF MODEL mvlShopPayment. SETTING EMPTY OBJECT. ERROR', e)
            return '{}'
          }
          this.setDataValue('extended', val)
        }
      }
    },
    // Model options
    {
      indexes: [
        {
          fields: ['active']
        },
        {
          fields: ['key'],
          unique: true
        }
      ],
      scope: {
        active: {
          where: {
            active: true
          }
        }
      }
    },
    // Model associations
    {
      belongsTo: [
        {
          model: 'mvlUser',
          as: 'Creator'
        },
        {
          model: 'mvlShopPayment',
          as: 'Payment'
        }
      ]
    }
  ]
}
