const { Comanda, ItemPedido, ItemCardapio, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

module.exports = {
  async abrir(req, res) {
    const { numeroMesa } = req.body;
    if (!numeroMesa) {
      return res.status(400).json({ error: 'O número da mesa é obrigatório.' });
    }

    try {
      const existente = await Comanda.findOne({
        where: { numeroMesa, status: 'ABERTA' }
      });
      if (existente) {
        return res.status(409).json({ error: 'Já existe uma comanda aberta para esta mesa.', comanda: existente });
      }

      const novaComanda = await Comanda.create({
        numeroMesa,
        status: 'ABERTA'
      });
      return res.status(201).json(novaComanda);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao abrir comanda.' });
    }
  },

  async fechar(req, res) {
    const { id } = req.params;
    try {
      const comanda = await Comanda.findByPk(id);
      if (!comanda) {
        return res.status(404).json({ error: 'Comanda não encontrada.' });
      }

      if (comanda.status !== 'ABERTA') {
        return res.status(400).json({ error: `Não é possível fechar uma comanda com status ${comanda.status}.` });
      }

      await comanda.update({ status: 'FECHADA' });

      return res.json(comanda);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao fechar comanda.' });
    }
  },
  async indexAbertas(req, res) {
    try {
      const comandas = await Comanda.findAll({
        where: { status: 'ABERTA' },
        order: [['numeroMesa', 'ASC']]
      });
      return res.json(comandas);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar comandas abertas.' });
    }
  },
  async show(req, res) {
    const { id } = req.params;
    try {
      const comanda = await Comanda.findByPk(id, {
        include: {
          model: ItemPedido,
          as: 'itens',
          include: {
            model: ItemCardapio,
            as: 'item',
            attributes: ['nome', 'preco', 'tipo'] 
          },
          order: [['createdAt', 'ASC']]
        }
      });

      if (!comanda) {
        return res.status(404).json({ error: 'Comanda não encontrada.' });
      }
      const [totalResult] = await sequelize.query(
        'SELECT sp_calcular_total_comanda(:comandaId) AS total',
        {
          replacements: { comandaId: id },
          type: QueryTypes.SELECT
        }
      );
      const response = {
        ...comanda.toJSON(),
        valorTotal: totalResult.total || '0.00'
      };

      return res.json(response);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao buscar detalhes da comanda.' });
    }
  }
};