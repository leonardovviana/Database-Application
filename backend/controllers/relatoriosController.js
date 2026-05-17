const { getDatabase } = require('../database/init');
const DataWarehouseService = require('../services/dataWarehouseService');

function buildFilters(query) {
  const { ano, categoria, concessionaria_id, vendedor_id, periodo_inicio, periodo_fim } = query;
  const conditions = [];
  const params = [];

  if (ano) {
    conditions.push(`dt.ano = ?`);
    params.push(Number(ano));
  }
  if (categoria) {
    conditions.push(`vei.categoria = ?`);
    params.push(categoria);
  }
  if (concessionaria_id) {
    conditions.push(`fv.concessionaria_id = ?`);
    params.push(Number(concessionaria_id));
  }
  if (vendedor_id) {
    conditions.push(`fv.vendedor_id = ?`);
    params.push(Number(vendedor_id));
  }
  if (periodo_inicio) {
    conditions.push(`dt.data >= ?`);
    params.push(periodo_inicio);
  }
  if (periodo_fim) {
    conditions.push(`dt.data <= ?`);
    params.push(periodo_fim);
  }

  return { clause: conditions.length ? 'AND ' + conditions.join(' AND ') : '', params };
}

const dwFrom = DataWarehouseService.getAnalyticFromClause();

const relatoriosController = {
  vendasMensais(req, res) {
    try {
      const db = getDatabase();
      const { clause, params } = buildFilters(req.query);
      const data = db.prepare(`
        SELECT dt.ano_mes as mes,
               SUM(fv.quantidade) as total_vendas,
               COALESCE(SUM(fv.valor_total), 0) as faturamento
        ${dwFrom}
        WHERE 1=1 ${clause}
        GROUP BY dt.ano_mes
        ORDER BY mes DESC
      `).all(params);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  vendasAnuais(req, res) {
    try {
      const db = getDatabase();
      const { clause, params } = buildFilters(req.query);
      const data = db.prepare(`
        SELECT CAST(dt.ano AS TEXT) as ano,
               SUM(fv.quantidade) as total_vendas,
               COALESCE(SUM(fv.valor_total), 0) as faturamento
        ${dwFrom}
        WHERE 1=1 ${clause}
        GROUP BY dt.ano
        ORDER BY ano DESC
      `).all(params);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  receitaAnual(req, res) {
    try {
      const db = getDatabase();
      const { clause, params } = buildFilters(req.query);
      const data = db.prepare(`
        SELECT CAST(dt.ano AS TEXT) as ano,
               COALESCE(SUM(fv.valor_total), 0) as receita,
               SUM(fv.quantidade) as total_vendas,
               ROUND(COALESCE(AVG(fv.valor_total), 0), 2) as ticket_medio
        ${dwFrom}
        WHERE 1=1 ${clause}
        GROUP BY dt.ano
        ORDER BY ano DESC
      `).all(params);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  melhorVendedor(req, res) {
    try {
      const db = getDatabase();
      const { clause, params } = buildFilters(req.query);
      const data = db.prepare(`
        SELECT ven.nome, ven.cpf, con.nome as concessionaria,
               SUM(fv.quantidade) as total_vendas,
               COALESCE(SUM(fv.valor_total), 0) as faturamento
        ${dwFrom}
        WHERE 1=1 ${clause}
        GROUP BY ven.id
        ORDER BY faturamento DESC
        LIMIT 10
      `).all(params);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  melhorConcessionaria(req, res) {
    try {
      const db = getDatabase();
      const { clause, params } = buildFilters(req.query);
      const data = db.prepare(`
        SELECT con.nome, con.cidade, con.estado,
               SUM(fv.quantidade) as total_vendas,
               COALESCE(SUM(fv.valor_total), 0) as faturamento
        ${dwFrom}
        WHERE 1=1 ${clause}
        GROUP BY con.id
        ORDER BY faturamento DESC
        LIMIT 10
      `).all(params);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  veiculosMaisVendidos(req, res) {
    try {
      const db = getDatabase();
      const { clause, params } = buildFilters(req.query);
      const data = db.prepare(`
        SELECT vei.marca, vei.modelo, vei.categoria, vei.ano,
               SUM(fv.quantidade) as total_vendido,
               COALESCE(SUM(fv.valor_total), 0) as faturamento_total
        ${dwFrom}
        WHERE 1=1 ${clause}
        GROUP BY vei.id
        ORDER BY total_vendido DESC
        LIMIT 10
      `).all(params);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  vendasPorCidade(req, res) {
    try {
      const db = getDatabase();
      const { clause, params } = buildFilters(req.query);
      const data = db.prepare(`
        SELECT cli.cidade,
               SUM(fv.quantidade) as total_vendas,
               COALESCE(SUM(fv.valor_total), 0) as faturamento
        ${dwFrom}
        WHERE 1=1 ${clause}
        GROUP BY cli.cidade
        ORDER BY faturamento DESC
      `).all(params);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  vendasPorCategoria(req, res) {
    try {
      const db = getDatabase();
      const { clause, params } = buildFilters(req.query);
      const data = db.prepare(`
        SELECT vei.categoria,
               SUM(fv.quantidade) as total_vendas,
               COALESCE(SUM(fv.valor_total), 0) as faturamento
        ${dwFrom}
        WHERE vei.categoria IS NOT NULL AND vei.categoria != ''
          ${clause}
        GROUP BY vei.categoria
        ORDER BY faturamento DESC
      `).all(params);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = relatoriosController;
