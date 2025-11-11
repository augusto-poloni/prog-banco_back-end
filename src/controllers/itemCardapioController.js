const { ItemCardapio } = require('../models');

module.exports = {
  async index(req, res) {
    try {
      const itens = await ItemCardapio.findAll({
        where: { disponivel: true },
        order: [['tipo', 'ASC'], ['nome', 'ASC']]
      });
      return res.json(itens);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar itens do cardápio.' });
    }
  },

  async store(req, res) {
    const { nome, descricao, preco, tipo, disponivel } = req.body;

    if (!nome || !preco || !tipo) {
      return res.status(400).json({ error: 'Nome, preço e tipo são obrigatórios.' });
    }
    if (tipo !== 'PRATO' && tipo !== 'BEBIDA') {
      return res.status(400).json({ error: "Tipo deve ser 'PRATO' ou 'BEBIDA'." });
    }

    try {
      const novoItem = await ItemCardapio.create({
        nome,
        descricao,
        preco,
        tipo,
        disponivel: disponivel !== undefined ? disponivel : true
      });
      return res.status(201).json(novoItem);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao criar item no cardápio.' });
    }
  },

  async update(req, res) {
    const { id } = req.params;
    const { nome, descricao, preco, tipo, disponivel } = req.body;

    try {
      const item = await ItemCardapio.findByPk(id);
      if (!item) {
        return res.status(404).json({ error: 'Item do cardápio não encontrado' });
      }

      await item.update({ nome, descricao, preco, tipo, disponivel });
      return res.json(item);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao atualizar item.' });
    }
  },

  async delete(req, res) {
    const { id } = req.params;
    try {
      const item = await ItemCardapio.findByPk(id);
      if (!item) {
        return res.status(404).json({ error: 'Item não encontrado.' });
      }

      await item.update({ disponivel: false });

      return res.status(204).send(); 
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao deletar item.' });
    }
  }
};