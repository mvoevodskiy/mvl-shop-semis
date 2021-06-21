const jsonField = require('./_jsonField')
const priceField = require('./_priceField')

module.exports = (Sequelize) => {
  return [
    {
      type: Sequelize.STRING,
      amount: priceField(Sequelize, 'amount'),
      extended: jsonField(Sequelize, 'extended')
    },
    // Model options
    {
      indexes: [
        {
          fields: ['type']
        }
      ]
    },
    // Model associations
    {
      belongsTo: [
        {
          model: 'mvlShopCustomerAccount',
          as: 'Account'
        },
        {
          model: 'mvlShopOrder',
          as: 'Order'
        },
        {
          model: 'mvlUser',
          as: 'Customer'
        },
        {
          model: 'mvlUser',
          as: 'Creator'
        }
      ]
    }
  ]
}
