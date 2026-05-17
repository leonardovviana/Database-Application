const { getDatabase } = require('../database/init');

const Venda = {
  findAll() {
    const db = getDatabase();
    return db.prepare(`
      SELECT
        vda.*,
        vei.marca, vei.modelo, vei.ano, vei.estoque as veiculo_estoque,
        cli.nome as cliente_nome, cli.cpf as cliente_cpf,
        ven.nome as vendedor_nome,
        con.nome as concessionaria_nome
      FROM vendas vda
      JOIN veiculos vei ON vda.veiculo_id = vei.id
      JOIN clientes cli ON vda.cliente_id = cli.id
      JOIN vendedores ven ON vda.vendedor_id = ven.id
      JOIN concessionarias con ON vda.concessionaria_id = con.id
      ORDER BY vda.data_venda DESC
    `).all();
  },

  findById(id) {
    const db = getDatabase();
    return db.prepare(`
      SELECT
        vda.*,
        vei.marca, vei.modelo, vei.ano,
        cli.nome as cliente_nome, cli.cpf as cliente_cpf,
        ven.nome as vendedor_nome,
        con.nome as concessionaria_nome
      FROM vendas vda
      JOIN veiculos vei ON vda.veiculo_id = vei.id
      JOIN clientes cli ON vda.cliente_id = cli.id
      JOIN vendedores ven ON vda.vendedor_id = ven.id
      JOIN concessionarias con ON vda.concessionaria_id = con.id
      WHERE vda.id = ?
    `).get([id]);
  },

  search(query) {
    const db = getDatabase();
    const term = `%${query}%`;
    return db.prepare(`
      SELECT
        vda.*,
        vei.marca, vei.modelo, vei.ano,
        cli.nome as cliente_nome, cli.cpf as cliente_cpf,
        ven.nome as vendedor_nome,
        con.nome as concessionaria_nome
      FROM vendas vda
      JOIN veiculos vei ON vda.veiculo_id = vei.id
      JOIN clientes cli ON vda.cliente_id = cli.id
      JOIN vendedores ven ON vda.vendedor_id = ven.id
      JOIN concessionarias con ON vda.concessionaria_id = con.id
      WHERE cli.nome LIKE ? OR ven.nome LIKE ?
         OR vei.marca LIKE ? OR vei.modelo LIKE ?
         OR con.nome LIKE ? OR vda.forma_pagamento LIKE ?
      ORDER BY vda.data_venda DESC
    `).all([term, term, term, term, term, term]);
  },

  create(data) {
    const db = getDatabase();

    const veiculo = db.prepare('SELECT estoque FROM veiculos WHERE id = ?').get([data.veiculo_id]);
    if (!veiculo) throw new Error('Veículo não encontrado');
    if (veiculo.estoque < 1) throw new Error('Veículo sem estoque disponível');

    const fields = ['cliente_id', 'vendedor_id', 'veiculo_id', 'concessionaria_id', 'valor_total', 'forma_pagamento'];
    if (data.data_venda) fields.push('data_venda');

    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map(f => data[f]);

    const result = db.prepare(`
      INSERT INTO vendas (${fields.join(', ')})
      VALUES (${placeholders})
    `).run(values);

    db.prepare('UPDATE veiculos SET estoque = estoque - 1 WHERE id = ?').run([data.veiculo_id]);

    return { id: result.lastInsertRowid, ...data };
  },

  update(id, data) {
    const db = getDatabase();
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = Object.values(data);
    db.prepare(`UPDATE vendas SET ${fields} WHERE id = ?`).run([...values, id]);
    return this.findById(id);
  },

  delete(id) {
    const db = getDatabase();
    const venda = db.prepare('SELECT veiculo_id FROM vendas WHERE id = ?').get([id]);
    if (!venda) return { changes: 0 };
    db.prepare('UPDATE veiculos SET estoque = estoque + 1 WHERE id = ?').run([venda.veiculo_id]);
    return db.prepare('DELETE FROM vendas WHERE id = ?').run([id]);
  },

  getMonthlySummary(limit = 12) {
    const db = getDatabase();
    return db.prepare(`
      SELECT strftime('%Y-%m', data_venda) as mes,
             COUNT(*) as total_vendas,
             COALESCE(SUM(valor_total), 0) as faturamento
      FROM vendas
      GROUP BY mes
      ORDER BY mes DESC
      LIMIT ?
    `).all([limit]);
  }
};

module.exports = Venda;
