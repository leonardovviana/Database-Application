const Concessionaria = require('../models/Concessionaria');

const concessionariasController = {
  search(req, res) {
    try {
      const { q } = req.query;
      if (!q) return res.json(Concessionaria.findAll());
      const data = Concessionaria.search(q);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  list(req, res) {
    try {
      const data = Concessionaria.findAll();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getById(req, res) {
    try {
      const data = Concessionaria.findById(req.params.id);
      if (!data) return res.status(404).json({ error: 'Concessionária não encontrada' });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  create(req, res) {
    try {
      const data = Concessionaria.create(req.body);
      res.status(201).json(data);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  update(req, res) {
    try {
      const data = Concessionaria.update(req.params.id, req.body);
      if (!data) return res.status(404).json({ error: 'Concessionária não encontrada' });
      res.json(data);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  delete(req, res) {
    try {
      const result = Concessionaria.delete(req.params.id);
      if (result.changes === 0) return res.status(404).json({ error: 'Concessionária não encontrada' });
      res.json({ message: 'Concessionária removida com sucesso' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = concessionariasController;
