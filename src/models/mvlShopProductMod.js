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
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      rank: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      image: Sequelize.STRING,
      thumb: Sequelize.STRING,
      extended: jsonField(Sequelize, 'extended')
    },
    // Model options
    {
      indexes: [
        {
          fields: ['article']
        },
        {
          fields: ['active']
        }
      ]
    },
    // Model associations
    {
      belongsTo: [
        {
          model: 'mvlUser',
          as: 'Creator'
        },
        {
          model: 'mvlShopProduct',
          as: 'Product'
        }
      ],
      hasMany: [
        {
          model: 'mvlShopProductModOption',
          as: 'Options',
          foreignKey: 'ModId'
        }
      ]
    }
  ]
}
