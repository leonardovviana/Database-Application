const { getDatabase } = require('../database/init');

function buildFilters(query) {
  const { ano, categoria, concessionaria_id, vendedor_id, periodo_inicio, periodo_fim } = query;
  const conditions = [];
  const params = [];

  if (ano) {
    conditions.push(`strftime('%Y', vda.data_venda) = ?`);
    params.push(String(ano));
  }
  if (categoria) {
    conditions.push(`vei.categoria = ?`);
    params.push(categoria);
  }
  if (concessionaria_id) {
    conditions.push(`vda.concessionaria_id = ?`);
    params.push(Number(concessionaria_id));
  }
  if (vendedor_id) {
    conditions.push(`vda.vendedor_id = ?`);
    params.push(Number(vendedor_id));
  }
  if (periodo_inicio) {
    conditions.push(`vda.data_venda >= ?`);
    params.push(periodo_inicio);
  }
  if (periodo_fim) {
    conditions.push(`vda.data_venda <= ?`);
    params.push(periodo_fim + ' 23:59:59');
  }

  return { clause: conditions.length ? 'AND ' + conditions.join(' AND ') : '', params };
}

const relatoriosController = {
  vendasMensais(req, res) {
    try {
      const db = getDatabase();
      const { clause, params } = buildFilters(req.query);
      const data = db.prepare(`
        SELECT strftime('%Y-%m', vda.data_venda) as mes,
               COUNT(*) as total_vendas,
               COALESCE(SUM(vda.valor_total), 0) as faturamento
        FROM vendas vda
        JOIN veiculos vei ON vda.veiculo_id = vei.id
        WHERE 1=1 ${clause}
        GROUP BY mes
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
        SELECT strftime('%Y', vda.data_venda) as ano,
               COUNT(*) as total_vendas,
               COALESCE(SUM(vda.valor_total), 0) as faturamento
        FROM vendas vda
        JOIN veiculos vei ON vda.veiculo_id = vei.id
        WHERE 1=1 ${clause}
        GROUP BY ano
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
        SELECT strftime('%Y', vda.data_venda) as ano,
               COALESCE(SUM(vda.valor_total), 0) as receita,
               COUNT(*) as total_vendas,
               ROUND(COALESCE(AVG(vda.valor_total), 0), 2) as ticket_medio
        FROM vendas vda
        JOIN veiculos vei ON vda.veiculo_id = vei.id
        WHERE 1=1 ${clause}
        GROUP BY ano
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
        SELECT v.nome, v.cpf, c.nome as concessionaria,
               COUNT(*) as total_vendas,
               COALESCE(SUM(vda.valor_total), 0) as faturamento
        FROM vendas vda
        JOIN vendedores v ON vda.vendedor_id = v.id
        JOIN concessionarias c ON v.concessionaria_id = c.id
        JOIN veiculos vei ON vda.veiculo_id = vei.id
        WHERE 1=1 ${clause}
        GROUP BY v.id
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
        SELECT c.nome, c.cidade, c.estado,
               COUNT(*) as total_vendas,
               COALESCE(SUM(vda.valor_total), 0) as faturamento
        FROM vendas vda
        JOIN concessionarias c ON vda.concessionaria_id = c.id
        JOIN veiculos vei ON vda.veiculo_id = vei.id
        WHERE 1=1 ${clause}
        GROUP BY c.id
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
               COUNT(*) as total_vendido,
               COALESCE(SUM(vda.valor_total), 0) as faturamento_total
        FROM vendas vda
        JOIN veiculos vei ON vda.veiculo_id = vei.id
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
               COUNT(*) as total_vendas,
               COALESCE(SUM(vda.valor_total), 0) as faturamento
        FROM vendas vda
        JOIN clientes cli ON vda.cliente_id = cli.id
        JOIN veiculos vei ON vda.veiculo_id = vei.id
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
               COUNT(*) as total_vendas,
               COALESCE(SUM(vda.valor_total), 0) as faturamento
        FROM vendas vda
        JOIN veiculos vei ON vda.veiculo_id = vei.id
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
