const Veiculo = require('../models/Veiculo');
const Venda = require('../models/Venda');
const { getDatabase } = require('../database/init');

const dashboardController = {
  getStats(req, res) {
    try {
      const db = getDatabase();

      const totalVeiculos = db.prepare('SELECT COALESCE(SUM(estoque), 0) as total FROM veiculos').get();
      const totalVendas = db.prepare('SELECT COUNT(*) as total FROM vendas').get();
      const faturamento = db.prepare('SELECT COALESCE(SUM(valor_total), 0) as total FROM vendas').get();
      const totalClientes = db.prepare('SELECT COUNT(*) as total FROM clientes').get();
      const totalVendedores = db.prepare('SELECT COUNT(*) as total FROM vendedores').get();
      const totalConcessionarias = db.prepare('SELECT COUNT(*) as total FROM concessionarias').get();

      const veiculosVendidos = db.prepare('SELECT COUNT(*) as total FROM vendas').get();
      const veiculosPorCategoria = Veiculo.countByCategoria();

      const melhorVendedor = db.prepare(`
        SELECT v.nome, COUNT(*) as total_vendas, SUM(vda.valor_total) as faturamento
        FROM vendas vda JOIN vendedores v ON vda.vendedor_id = v.id
        GROUP BY v.id ORDER BY faturamento DESC, total_vendas DESC LIMIT 1
      `).get();

      const melhorConcessionaria = db.prepare(`
        SELECT c.nome, COUNT(*) as total_vendas, SUM(vda.valor_total) as faturamento
        FROM vendas vda JOIN concessionarias c ON vda.concessionaria_id = c.id
        GROUP BY c.id ORDER BY faturamento DESC LIMIT 1
      `).get();

      res.json({
        total_veiculos_estoque: totalVeiculos.total,
        total_veiculos_vendidos: veiculosVendidos.total,
        total_vendas: totalVendas.total,
        faturamento_total: faturamento.total,
        total_clientes: totalClientes.total,
        total_vendedores: totalVendedores.total,
        total_concessionarias: totalConcessionarias.total,
        veiculos_por_categoria: veiculosPorCategoria,
        melhor_vendedor: melhorVendedor || null,
        melhor_concessionaria: melhorConcessionaria || null
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getMonthlySales(req, res) {
    try {
      const { periodo } = req.query;
      const limit = periodo ? Math.min(Math.max(Number(periodo), 1), 60) : 12;
      const monthly = Venda.getMonthlySummary(limit);
      res.json(monthly);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getVendasPorConcessionaria(req, res) {
    try {
      const db = getDatabase();
      const data = db.prepare(`
        SELECT c.nome as concessionaria, COUNT(*) as total_vendas, SUM(vda.valor_total) as faturamento
        FROM vendas vda JOIN concessionarias c ON vda.concessionaria_id = c.id
        GROUP BY c.id ORDER BY faturamento DESC
      `).all();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getFaturamentoPorCategoria(req, res) {
    try {
      const db = getDatabase();
      const data = db.prepare(`
        SELECT vei.categoria, COUNT(*) as total_vendas, SUM(vda.valor_total) as faturamento
        FROM vendas vda JOIN veiculos vei ON vda.veiculo_id = vei.id
        WHERE vei.categoria IS NOT NULL AND vei.categoria != ''
        GROUP BY vei.categoria ORDER BY faturamento DESC
      `).all();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getRankingVendedores(req, res) {
    try {
      const db = getDatabase();
      const data = db.prepare(`
        SELECT v.nome, c.nome as concessionaria, COUNT(*) as total_vendas, SUM(vda.valor_total) as faturamento
        FROM vendas vda
        JOIN vendedores v ON vda.vendedor_id = v.id
        JOIN concessionarias c ON v.concessionaria_id = c.id
        GROUP BY v.id ORDER BY faturamento DESC
      `).all();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = dashboardController;
