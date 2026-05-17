const bcrypt = require('bcryptjs');
const ClienteUsuario = require('../models/ClienteUsuario');
const ClienteFavorito = require('../models/ClienteFavorito');
const Veiculo = require('../models/Veiculo');
const { getDatabase } = require('../database/init');

const clienteController = {
  getDashboard(req, res) {
    try {
      const cliente = ClienteUsuario.findById(req.usuario.id);
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      const veiculos = Veiculo.findAll();
      const recomendados = veiculos.filter(v => v.estoque > 0).slice(0, 6);

      const favoritos = ClienteFavorito.findByCliente(req.usuario.id);

      const db = getDatabase();
      const historico = db.prepare(`
        SELECT vd.id, vd.data_venda, vd.valor_total, vd.forma_pagamento,
               v.marca, v.modelo, v.ano, v.preco,
               c.nome as concessionaria
        FROM vendas vd
        JOIN veiculos v ON v.id = vd.veiculo_id
        JOIN concessionarias c ON c.id = vd.concessionaria_id
        JOIN clientes cl ON cl.id = vd.cliente_id
        WHERE cl.email = ?
        ORDER BY vd.data_venda DESC
        LIMIT 5
      `).all([cliente.email]);

      res.json({
        cliente: { nome: cliente.nome, email: cliente.email },
        recomendados,
        favoritos,
        historico,
        total_favoritos: favoritos.length,
        total_compras: historico.length
      });
    } catch (err) {
      console.error('Erro no dashboard:', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  getHistorico(req, res) {
    try {
      const cliente = ClienteUsuario.findById(req.usuario.id);
      if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });

      const db = getDatabase();
      const historico = db.prepare(`
        SELECT vd.id, vd.data_venda, vd.valor_total, vd.forma_pagamento,
               v.marca, v.modelo, v.ano, v.preco,
               c.nome as concessionaria, c.cidade
        FROM vendas vd
        JOIN veiculos v ON v.id = vd.veiculo_id
        JOIN concessionarias c ON c.id = vd.concessionaria_id
        JOIN clientes cl ON cl.id = vd.cliente_id
        WHERE cl.email = ?
        ORDER BY vd.data_venda DESC
      `).all([cliente.email]);

      res.json(historico);
    } catch (err) {
      console.error('Erro no histórico:', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  updatePerfil(req, res) {
    try {
      const { nome, telefone, cidade } = req.body;
      const updates = {};
      if (nome !== undefined) updates.nome = nome.trim();
      if (telefone !== undefined) updates.telefone = telefone;
      if (cidade !== undefined) updates.cidade = cidade;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'Nenhum dado para atualizar' });
      }

      const usuario = ClienteUsuario.update(req.usuario.id, updates);
      if (!usuario) return res.status(404).json({ error: 'Cliente não encontrado' });

      res.json(usuario);
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  updateSenha(req, res) {
    try {
      const { senha_atual, nova_senha } = req.body;

      if (!senha_atual || !nova_senha) {
        return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
      }

      if (nova_senha.length < 6) {
        return res.status(400).json({ error: 'Nova senha deve ter no mínimo 6 caracteres' });
      }

      const db = require('../database/init').getDatabase();
      const usuario = db.prepare('SELECT * FROM cliente_usuarios WHERE id = ?').get([req.usuario.id]);
      if (!usuario) return res.status(404).json({ error: 'Cliente não encontrado' });

      const senhaValida = bcrypt.compareSync(senha_atual, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ error: 'Senha atual incorreta' });
      }

      const salt = bcrypt.genSaltSync(10);
      const senhaHash = bcrypt.hashSync(nova_senha, salt);
      ClienteUsuario.updatePassword(req.usuario.id, senhaHash);

      res.json({ message: 'Senha atualizada com sucesso' });
    } catch (err) {
      console.error('Erro ao atualizar senha:', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  getFavoritos(req, res) {
    try {
      const favoritos = ClienteFavorito.findByCliente(req.usuario.id);
      res.json(favoritos);
    } catch (err) {
      console.error('Erro ao listar favoritos:', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  addFavorito(req, res) {
    try {
      const { veiculo_id } = req.body;
      if (!veiculo_id) {
        return res.status(400).json({ error: 'veiculo_id é obrigatório' });
      }

      const veiculo = Veiculo.findById(veiculo_id);
      if (!veiculo) {
        return res.status(404).json({ error: 'Veículo não encontrado' });
      }

      const added = ClienteFavorito.add(req.usuario.id, veiculo_id);
      if (!added) {
        return res.status(409).json({ error: 'Veículo já está nos favoritos' });
      }

      res.status(201).json({ message: 'Adicionado aos favoritos' });
    } catch (err) {
      console.error('Erro ao adicionar favorito:', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  removeFavorito(req, res) {
    try {
      const { veiculo_id } = req.params;
      const result = ClienteFavorito.remove(req.usuario.id, veiculo_id);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Favorito não encontrado' });
      }
      res.json({ message: 'Removido dos favoritos' });
    } catch (err) {
      console.error('Erro ao remover favorito:', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

module.exports = clienteController;
