const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /produto - Busca com filtros, ordenação e paginação
router.get('/produto', async (req, res) => {
  try {
    const {
      nome,
      ordem, // 'asc' (menor preço) ou 'desc' (maior preço)
      categoria,
      preco_min,
      preco_max,
      pagina = 1,
    } = req.query;

    const limite = 10; // Quantidade fixa de 10 produtos por página
    const offset = (pagina - 1) * limite;

    let query = db('produtos');

    // 1. Filtro por nome
    if (nome) {
      query.where('nome', 'ilike', `%${nome}%`);
    }

    // 2. Filtro por categoria
    if (categoria) {
      query.where({ categoria });
    }

    // 3. Filtro por preço mínimo e máximo
    if (preco_min) {
      query.where('preco', '>=', Number(preco_min));
    }
    if (preco_max) {
      query.where('preco', '<=', Number(preco_max));
    }

    // Contagem total de itens filtrados (sem limite/offset)
    const [{ count }] = await query.clone().count('id as count');

    // 4. Ordenação por preço
    if (ordem === 'asc' || ordem === 'desc') {
      query.orderBy('preco', ordem);
    } else {
      query.orderBy('id', 'asc');
    }

    // 5. Limite e Paginação (Offset)
    const produtos = await query.limit(limite).offset(offset);

    return res.json({
      paginaAtual: Number(pagina),
      totalItens: Number(count),
      totalPaginas: Math.ceil(Number(count) / limite),
      produtos,
    });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao buscar produtos', erro: error.message });
  }
});

module.exports = router;