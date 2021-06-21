const jsonField = require('./_jsonField')
const priceField = require('./_priceField')

module.exports = (Sequelize) => {
  return [
    {
      type: Sequelize.STRING,
      balance: priceField(Sequelize, 'balance'),
      rank: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      extended: jsonField(Sequelize, 'extended')
    },
    // Model options
    {
      indexes: [
        {
          fields: ['CustomerId', 'type'],
          unique: true
        },
        {
          fields: ['active']
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
          as: 'Customer'
        }
      ],
      hasMany: [
        {
          model: 'mvlShopCustomerAccountLog',
          as: 'Logs',
          foreignKey: 'AccountId'
        }
      ]
    }
  ]
}
