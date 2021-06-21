const jsonField = require('./_jsonField')
module.exports = (Sequelize) => {
  return [
    {
      key: Sequelize.STRING,
      value: jsonField(Sequelize, 'value')
    },
    // Model options
    {
      indexes: [
        {
          fields: ['key']
        }
      ]
    },
    // Model associations
    {
      belongsTo: [
        {
          model: 'mvlShopProduct',
          as: 'Product'
        }
      ]
    }
  ]
}
