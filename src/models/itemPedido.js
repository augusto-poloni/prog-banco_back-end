const { Model, DataTypes } = require('sequelize');

class ItemPedido extends Model {
  static init(sequelize) {
    super.init({
      quantidade: DataTypes.INTEGER,
      observacao: DataTypes.STRING,
      status: DataTypes.ENUM('PENDENTE', 'EM_PREPARO', 'PRONTO', 'ENTREGUE'),
    }, { sequelize });
  }

  static associate(models) {
    this.belongsTo(models.Comanda, { foreignKey: 'comandaId', as: 'comanda' });
    this.belongsTo(models.ItemCardapio, { foreignKey: 'itemCardapioId', as: 'item' });
  }
}
module.exports = ItemPedido;