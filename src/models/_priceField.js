module.exports = function (Sequelize, field) {
  return {
    type: Sequelize.DECIMAL(10, 2),
    defaultValue: 0,
    allowNull: false,
    get () {
      return parseFloat(this.getDataValue(field))
    }
    // set (val) {
    //   try {
    //     val = typeof val === 'string' ? val : JSON.stringify(val)
    //   } catch (e) {
    //     console.error('SETTER OF ' + field + ' FIELD OF MODEL mvlShopProduct. SETTING EMPTY OBJECT. ERROR', e)
    //     return '{}'
    //   }
    //   this.setDataValue(field, val)
    // }
  }
}
