const Vendedor = require('../models/Vendedor');

const vendedoresController = {
  search(req, res) {
    try {
      const { q } = req.query;
      if (!q || !q.trim()) return res.json([]);
      const data = Vendedor.search(q.trim());
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  list(req, res) {
    try {
      const data = Vendedor.findAll();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getById(req, res) {
    try {
      const data = Vendedor.findById(req.params.id);
      if (!data) return res.status(404).json({ error: 'Vendedor não encontrado' });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  create(req, res) {
    try {
      const data = Vendedor.create(req.body);
      res.status(201).json(data);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  update(req, res) {
    try {
      const data = Vendedor.update(req.params.id, req.body);
      if (!data) return res.status(404).json({ error: 'Vendedor não encontrado' });
      res.json(data);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  delete(req, res) {
    try {
      const result = Vendedor.delete(req.params.id);
      if (result.changes === 0) return res.status(404).json({ error: 'Vendedor não encontrado' });
      res.json({ message: 'Vendedor removido com sucesso' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = vendedoresController;
