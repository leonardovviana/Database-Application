const Veiculo = require('../models/Veiculo');
const { getDatabase } = require('../database/init');
const DataWarehouseService = require('../services/dataWarehouseService');

const dwFrom = DataWarehouseService.getAnalyticFromClause();

const dashboardController = {
  getStats(req, res) {
    try {
      const db = getDatabase();

      const totalVeiculos = db.prepare('SELECT COALESCE(SUM(estoque), 0) as total FROM veiculos').get();
      const totalVendas = db.prepare('SELECT COALESCE(SUM(quantidade), 0) as total FROM dw_fato_vendas').get();
      const faturamento = db.prepare('SELECT COALESCE(SUM(valor_total), 0) as total FROM dw_fato_vendas').get();
      const totalClientes = db.prepare('SELECT COUNT(*) as total FROM clientes').get();
      const totalVendedores = db.prepare('SELECT COUNT(*) as total FROM vendedores').get();
      const totalConcessionarias = db.prepare('SELECT COUNT(*) as total FROM concessionarias').get();

      const veiculosVendidos = db.prepare('SELECT COALESCE(SUM(quantidade), 0) as total FROM dw_fato_vendas').get();
      const veiculosPorCategoria = Veiculo.countByCategoria();

      const melhorVendedor = db.prepare(`
        SELECT ven.nome, SUM(fv.quantidade) as total_vendas, SUM(fv.valor_total) as faturamento
        ${dwFrom}
        GROUP BY ven.id ORDER BY faturamento DESC, total_vendas DESC LIMIT 1
      `).get();

      const melhorConcessionaria = db.prepare(`
        SELECT con.nome, SUM(fv.quantidade) as total_vendas, SUM(fv.valor_total) as faturamento
        ${dwFrom}
        GROUP BY con.id ORDER BY faturamento DESC LIMIT 1
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
      const db = getDatabase();
      const { periodo } = req.query;
      const limit = periodo ? Math.min(Math.max(Number(periodo), 1), 60) : 12;
      const monthly = db.prepare(`
        SELECT dt.ano_mes as mes,
               SUM(fv.quantidade) as total_vendas,
               COALESCE(SUM(fv.valor_total), 0) as faturamento
        ${dwFrom}
        GROUP BY dt.ano_mes
        ORDER BY dt.ano_mes DESC
        LIMIT ?
      `).all([limit]);
      res.json(monthly);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getVendasPorConcessionaria(req, res) {
    try {
      const db = getDatabase();
      const data = db.prepare(`
        SELECT con.nome as concessionaria, SUM(fv.quantidade) as total_vendas, SUM(fv.valor_total) as faturamento
        ${dwFrom}
        GROUP BY con.id ORDER BY faturamento DESC
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
        SELECT vei.categoria, SUM(fv.quantidade) as total_vendas, SUM(fv.valor_total) as faturamento
        ${dwFrom}
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
        SELECT ven.nome, con.nome as concessionaria, SUM(fv.quantidade) as total_vendas, SUM(fv.valor_total) as faturamento
        ${dwFrom}
        GROUP BY ven.id ORDER BY faturamento DESC
      `).all();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getDataWarehouse(req, res) {
    try {
      const db = getDatabase();
      res.json(DataWarehouseService.getMetadata(db));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  refreshDataWarehouse(req, res) {
    try {
      const db = getDatabase();
      const result = DataWarehouseService.refresh(db);
      res.json({
        message: 'Data Warehouse atualizado com sucesso',
        ...result,
        metadata: DataWarehouseService.getMetadata(db)
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = dashboardController;
