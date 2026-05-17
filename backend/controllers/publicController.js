const Veiculo = require('../models/Veiculo');

const publicController = {
  listVeiculos(req, res) {
    try {
      const veiculos = Veiculo.findAll();
      const disponiveis = veiculos.filter(v => v.estoque > 0);
      res.json(disponiveis);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  listDestaque(req, res) {
    try {
      const veiculos = Veiculo.findAll();
      const destaques = veiculos.filter(v => v.estoque > 0).slice(0, 6);
      res.json(destaques);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getVeiculo(req, res) {
    try {
      const veiculo = Veiculo.findById(req.params.id);
      if (!veiculo) return res.status(404).json({ error: 'Veículo não encontrado' });
      res.json(veiculo);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  sendContato(req, res) {
    try {
      const { nome, email, mensagem } = req.body;
      if (!nome || !email || !mensagem) {
        return res.status(400).json({ error: 'Nome, email e mensagem são obrigatórios' });
      }
      res.json({ message: 'Mensagem enviada com sucesso. Entraremos em contato em breve.' });
    } catch (err) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

module.exports = publicController;
