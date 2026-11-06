const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// POST /cliente - Cadastro de novos clientes
router.post('/cliente', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ mensagem: 'Preencha todos os campos' });
    }

    const clienteExistente = await db('clientes').where({ email }).first();
    if (clienteExistente) {
      return res.status(400).json({ mensagem: 'E-mail já cadastrado' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const [novoCliente] = await db('clientes')
      .insert({ nome, email, senha: senhaHash })
      .returning(['id', 'nome', 'email']);

    return res.status(201).json(novoCliente);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro interno no servidor', erro: error.message });
  }
});

// POST /login - Autenticação
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    const cliente = await db('clientes').where({ email }).first();
    if (!cliente) {
      return res.status(400).json({ mensagem: 'Credenciais inválidas' });
    }

    const senhaValida = await bcrypt.compare(senha, cliente.senha);
    if (!senhaValida) {
      return res.status(400).json({ mensagem: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: cliente.id }, process.env.JWT_SECRET, {
      expiresIn: '8h',
    });

    return res.json({
      cliente: { id: cliente.id, nome: cliente.nome, email: cliente.email },
      token,
    });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro interno no servidor', erro: error.message });
  }
});

// GET /cliente/perfil - Rota autenticada
router.get('/cliente/perfil', authMiddleware, async (req, res) => {
  try {
    const cliente = await db('clientes')
      .where({ id: req.clienteId })
      .select('id', 'nome', 'email', 'created_at')
      .first();

    if (!cliente) {
      return res.status(404).json({ mensagem: 'Cliente não encontrado' });
    }

    return res.json(cliente);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro interno no servidor', erro: error.message });
  }
});

module.exports = router;