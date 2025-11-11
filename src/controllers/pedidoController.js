const { ItemPedido, Comanda, ItemCardapio } = require('../models');

module.exports = {
  async adicionarItem(req, res) {
    const { id: comandaId } = req.params; // ID da Comanda
    const { itemCardapioId, quantidade, observacao } = req.body;

    if (!itemCardapioId || !quantidade || quantidade < 1) {
      return res.status(400).json({ error: 'ID do item e quantidade (mínimo 1) são obrigatórios.' });
    }

    try {
      const comanda = await Comanda.findByPk(comandaId);
      if (!comanda) {
        return res.status(404).json({ error: 'Comanda não encontrada.' });
      }
      if (comanda.status !== 'ABERTA') {
        return res.status(400).json({ error: 'Não é possível adicionar itens a uma comanda fechada.' });
      }
      const itemCardapio = await ItemCardapio.findByPk(itemCardapioId);
      if (!itemCardapio || !itemCardapio.disponivel) {
        return res.status(404).json({ error: 'Item do cardápio não encontrado ou indisponível.' });
      }
      const novoItemPedido = await ItemPedido.create({
        comandaId,
        itemCardapioId,
        quantidade,
        observacao,
        status: 'PENDENTE'
      });
      const resultado = await ItemPedido.findByPk(novoItemPedido.id, {
        include: { model: ItemCardapio, as: 'item', attributes: ['nome', 'preco'] }
      });

      return res.status(201).json(resultado);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao adicionar item à comanda.' });
    }
  },
  async atualizarStatus(req, res) {
    const { itemId } = req.params;
    const { status } = req.body;

    const statusValidos = ['PENDENTE', 'EM_PREPARO', 'PRONTO', 'ENTREGUE'];
    if (!status || !statusValidos.includes(status)) {
      return res.status(400).json({ error: 'Status inválido.', validos: statusValidos });
    }

    try {
      const itemPedido = await ItemPedido.findByPk(itemId);
      if (!itemPedido) {
        return res.status(404).json({ error: 'Item do pedido não encontrado.' });
      }
      if (itemPedido.status === 'ENTREGUE') {
        return res.status(400).json({ error: 'Este item já foi entregue e não pode ser alterado.' });
      }

      await itemPedido.update({ status });

      return res.json(itemPedido);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao atualizar status do pedido.' });
    }
  },
  async removerItem(req, res) {
    const { itemId } = req.params; 

    try {
      const itemPedido = await ItemPedido.findByPk(itemId);
      if (!itemPedido) {
        return res.status(404).json({ error: 'Item do pedido não encontrado.' });
      }
      if (itemPedido.status !== 'PENDENTE') {
        return res.status(400).json({ error: 'Item já está em preparo/pronto e não pode ser removido.' });
      }

      await itemPedido.destroy();
      return res.status(204).send(); 
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao remover item do pedido.' });
    }
  }
};