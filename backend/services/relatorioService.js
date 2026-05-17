const { getDatabase } = require('../database/init');

class RelatorioService {
  static getFaturamentoPorPeriodo(inicio, fim) {
    const db = getDatabase();
    return db.prepare(`
      SELECT DATE(data_venda) as dia, COUNT(*) as vendas, SUM(valor_total) as total
      FROM vendas
      WHERE DATE(data_venda) BETWEEN ? AND ?
      GROUP BY dia
      ORDER BY dia
    `).all([inicio, fim]);
  }

  static getVeiculosMaisVendidos() {
    const db = getDatabase();
    return db.prepare(`
      SELECT vei.marca, vei.modelo, COUNT(*) as total_vendido
      FROM vendas v
      JOIN veiculos vei ON v.veiculo_id = vei.id
      GROUP BY vei.marca, vei.modelo
      ORDER BY total_vendido DESC
      LIMIT 10
    `).all();
  }

  static getVendasPorConcessionaria() {
    const db = getDatabase();
    return db.prepare(`
      SELECT c.nome as concessionaria, COUNT(*) as total_vendas, SUM(v.valor_total) as faturamento
      FROM vendas v
      JOIN concessionarias c ON v.concessionaria_id = c.id
      GROUP BY c.nome
      ORDER BY faturamento DESC
    `).all();
  }

  static getVendasPorVendedor() {
    const db = getDatabase();
    return db.prepare(`
      SELECT v.nome as vendedor, COUNT(*) as total_vendas, SUM(vda.valor_total) as faturamento
      FROM vendas vda
      JOIN vendedores v ON vda.vendedor_id = v.id
      GROUP BY v.nome
      ORDER BY faturamento DESC
    `).all();
  }
}

module.exports = RelatorioService;
