const { Model, DataTypes } = require('sequelize');

class Comanda extends Model {
  static init(sequelize) {
    super.init({
      numeroMesa: { 
        type: DataTypes.INTEGER, 
        field: 'numero_mesa' 
      },
      status: DataTypes.ENUM('ABERTA', 'FECHADA', 'PAGA'),
      valorTotal: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'valor_total'
      },
      dataFechamento: {
        type: DataTypes.DATE,
        field: 'data_fechamento'
      }
    }, { 
      sequelize, 
      tableName: 'comandas', 
      underscored: true 
    });
  }

}
module.exports = Comanda;