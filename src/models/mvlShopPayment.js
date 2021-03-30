module.exports = (Sequelize) => {
  return [
    {
      name: Sequelize.STRING,
      key: Sequelize.STRING,
      cost: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      rank: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      image: Sequelize.STRING,
      thumb: Sequelize.STRING,
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
      ]
    },
    // Model associations
    {
      belongsTo: [
        {
          model: 'mvlUser',
          as: 'Creator'
        }
      ]
    }
  ]
}
