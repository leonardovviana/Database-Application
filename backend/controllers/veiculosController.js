const Veiculo = require('../models/Veiculo');

const veiculosController = {
  search(req, res) {
    try {
      const { q } = req.query;
      if (!q || !q.trim()) {
        return res.json([]);
      }
      const veiculos = Veiculo.search(q.trim());
      res.json(veiculos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  list(req, res) {
    try {
      const veiculos = Veiculo.findAll();
      res.json(veiculos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getById(req, res) {
    try {
      const veiculo = Veiculo.findById(req.params.id);
      if (!veiculo) return res.status(404).json({ error: 'Veículo não encontrado' });
      res.json(veiculo);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  create(req, res) {
    try {
      const veiculo = Veiculo.create(req.body);
      res.status(201).json(veiculo);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  update(req, res) {
    try {
      const veiculo = Veiculo.update(req.params.id, req.body);
      if (!veiculo) return res.status(404).json({ error: 'Veículo não encontrado' });
      res.json(veiculo);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  delete(req, res) {
    try {
      const result = Veiculo.delete(req.params.id);
      if (result.changes === 0) return res.status(404).json({ error: 'Veículo não encontrado' });
      res.json({ message: 'Veículo removido com sucesso' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = veiculosController;
