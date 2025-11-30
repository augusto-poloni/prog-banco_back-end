const { Comanda, sequelize } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  async vendasDiarias(req, res) {
    const { data } = req.query;
    
    if (!data) {
      return res.status(400).json({ error: 'Data é obrigatória (YYYY-MM-DD)' });
    }

    try {
      const startOfDay = new Date(data + 'T00:00:00');
      const endOfDay = new Date(data + 'T23:59:59');
      const comandas = await Comanda.findAll({
        where: {
          status: { [Op.in]: ['FECHADA', 'PAGA'] },
          updatedAt: {
            [Op.between]: [startOfDay, endOfDay]
          }
        }
      });
      
      return res.json({ data, totalVendas: comandas.length, detalhes: comandas });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao gerar relatório.' });
    }
  }
};