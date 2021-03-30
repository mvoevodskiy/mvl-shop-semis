module.exports = (Sequelize) => {
  return [
    {
      phone: Sequelize.STRING,
      email: Sequelize.STRING,
      country: Sequelize.STRING,
      zip: Sequelize.STRING,
      city: Sequelize.STRING,
      street: Sequelize.STRING,
      building: Sequelize.STRING,
      floor: Sequelize.STRING,
      room: Sequelize.STRING,
      metro: Sequelize.STRING
    },
    // Model options
    {},
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
