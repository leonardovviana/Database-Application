const Venda = require('../models/Venda');

const vendasController = {
  search(req, res) {
    try {
      const { q } = req.query;
      if (!q || !q.trim()) return res.json([]);
      const vendas = Venda.search(q.trim());
      res.json(vendas);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  list(req, res) {
    try {
      const vendas = Venda.findAll();
      res.json(vendas);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getById(req, res) {
    try {
      const venda = Venda.findById(req.params.id);
      if (!venda) return res.status(404).json({ error: 'Venda não encontrada' });
      res.json(venda);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  create(req, res) {
    try {
      const venda = Venda.create(req.body);
      res.status(201).json(venda);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  update(req, res) {
    try {
      const venda = Venda.update(req.params.id, req.body);
      if (!venda) return res.status(404).json({ error: 'Venda não encontrada' });
      res.json(venda);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  delete(req, res) {
    try {
      const result = Venda.delete(req.params.id);
      if (result.changes === 0) return res.status(404).json({ error: 'Venda não encontrada' });
      res.json({ message: 'Venda removida com sucesso' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = vendasController;
