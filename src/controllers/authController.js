const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'segredo_do_sal_monelas_2024'; 

module.exports = {
  async register(req, res) {
    const { nome, email, senha } = req.body;

    try {
      if (await Usuario.findOne({ where: { email } })) {
        return res.status(400).json({ error: 'Usuário já existe' });
      }

      const hashSenha = await bcrypt.hash(senha, 10);

      const user = await Usuario.create({
        nome,
        email,
        senha: hashSenha,
      });

      user.senha = undefined;

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });

      return res.status(201).json({ user, token });
    } catch (err) {
      return res.status(400).json({ error: 'Falha no registro' });
    }
  },

  async login(req, res) {
    const { email, senha } = req.body;

    try {
      const user = await Usuario.findOne({ where: { email } });

      if (!user) {
        return res.status(400).json({ error: 'Usuário não encontrado' });
      }

      if (!await bcrypt.compare(senha, user.senha)) {
        return res.status(400).json({ error: 'Senha inválida' });
      }

      user.senha = undefined;

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });

      return res.json({ user, token });
    } catch (err) {
      return res.status(400).json({ error: 'Falha no login' });
    }
  }
};