const { Model, DataTypes } = require('sequelize');

class ItemPedido extends Model {
  static init(sequelize) {
    super.init({
      quantidade: DataTypes.INTEGER,
      observacao: DataTypes.STRING,
      status: DataTypes.ENUM('PENDENTE', 'EM_PREPARO', 'PRONTO', 'ENTREGUE'),
      
      comandaId: {
        type: DataTypes.INTEGER,
        field: 'id_comanda'
      },
      itemCardapioId: {
        type: DataTypes.INTEGER,
        field: 'id_produto'
      }
    }, { 
      sequelize, 
      tableName: 'pedidos', 
      underscored: true 
    });
  }
}
module.exports = ItemPedido;