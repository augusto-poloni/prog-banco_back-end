const { Model, DataTypes } = require('sequelize');

class Comanda extends Model {
  static init(sequelize) {
    super.init({
      numeroMesa: DataTypes.INTEGER,
      status: DataTypes.ENUM('ABERTA', 'FECHADA', 'PAGA'),
      dataFechamento: DataTypes.DATE 
    }, { sequelize });
  }

  static associate(models) {
    this.hasMany(models.ItemPedido, { foreignKey: 'comandaId', as: 'itens' });
  }
}
module.exports = Comanda;