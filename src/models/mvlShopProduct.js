const jsonField = require('./_jsonField')
module.exports = (Sequelize) => {
  return [
    {
      name: Sequelize.STRING,
      article: Sequelize.STRING(100),
      price: {
        type: Sequelize.DECIMAL(11, 2),
        defaultValue: 0
      },
      weight: Sequelize.DECIMAL(11, 2),
      image: Sequelize.STRING,
      thumb: Sequelize.STRING,
      extended: jsonField(Sequelize, 'extended')
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
        },
        {
          model: 'mvlShopProductOption',
          as: 'Options',
          foreignKey: 'ProductId'
        },
        {
          model: 'mvlShopProductMod',
          as: 'Mods',
          foreignKey: 'ProductId'
        }
      ]
    }
  ]
}
