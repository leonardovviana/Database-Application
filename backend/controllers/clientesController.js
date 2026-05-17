const Cliente = require('../models/Cliente');

const clientesController = {
  search(req, res) {
    try {
      const { q } = req.query;
      if (!q || !q.trim()) return res.json([]);
      const clientes = Cliente.search(q.trim());
      res.json(clientes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  list(req, res) {
    try {
      const clientes = Cliente.findAll();
      res.json(clientes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getById(req, res) {
    try {
      const cliente = Cliente.findById(req.params.id);
      if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });
      res.json(cliente);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  create(req, res) {
    try {
      const cliente = Cliente.create(req.body);
      res.status(201).json(cliente);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  update(req, res) {
    try {
      const cliente = Cliente.update(req.params.id, req.body);
      if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });
      res.json(cliente);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  delete(req, res) {
    try {
      const result = Cliente.delete(req.params.id);
      if (result.changes === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
      res.json({ message: 'Cliente removido com sucesso' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = clientesController;
