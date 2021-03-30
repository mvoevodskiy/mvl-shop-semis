module.exports = (Sequelize) => {
  return [
    {
      name: Sequelize.STRING,
      article: Sequelize.STRING(100),
      price: Sequelize.DECIMAL(11, 2),
      weight: Sequelize.DECIMAL(11, 2),
      image: Sequelize.STRING,
      thumb: Sequelize.STRING,
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
    {},
    // Model associations
    {
      belongsTo: [
        {
          model: 'mvlUser',
          as: 'Creator'
        },
        {
          model: 'mvlShopCategory',
          as: 'Category'
        }
      ],
      hasMany: [
        {
          model: 'mvlShopOrderProduct',
          as: 'Goods',
          foreignKey: 'ProductId'
        }
      ]
    }
  ]
}
