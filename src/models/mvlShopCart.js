module.exports = (Sequelize) => {
  return [
    {
      cost: Sequelize.INTEGER,
      comment: Sequelize.TEXT,
      goods: {
        type: Sequelize.TEXT,
        defaultValue: '{}',
        allowNull: false,
        get () {
          try {
            return JSON.parse(this.getDataValue('goods'))
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
            val = '{}'
          }
          this.setDataValue('goods', val)
        }
      }
    },
    // Model options
    {
      indexes: []
    },
    // Model associations
    {
      belongsTo: [
        {
          model: 'mvlUser',
          as: 'Customer'
        }
      ]
    }
  ]
}
