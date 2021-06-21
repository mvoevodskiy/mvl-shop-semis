const jsonField = require('./_jsonField')
module.exports = (Sequelize) => {
  return [
    {
      key: Sequelize.STRING,
      value: jsonField(Sequelize, 'value')
    },
    // Model options
    {},
    // Model associations
    {
      belongsTo: [
        {
          model: 'mvlShopProduct',
          as: 'Product'
        },
        {
          model: 'mvlShopProductMod',
          as: 'Mod'
        }
      ]
    }
  ]
}
