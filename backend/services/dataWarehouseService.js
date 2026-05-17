const { getDatabase } = require('../database/init');

function runMany(db, statements) {
  statements.forEach(sql => db.exec(sql));
}

class DataWarehouseService {
  static ensureSchema(db = getDatabase()) {
    runMany(db, [
      `
        CREATE TABLE IF NOT EXISTS dw_dim_tempo (
          id INTEGER PRIMARY KEY,
          data TEXT NOT NULL UNIQUE,
          dia INTEGER NOT NULL,
          mes INTEGER NOT NULL,
          ano INTEGER NOT NULL,
          trimestre INTEGER NOT NULL,
          nome_mes TEXT NOT NULL,
          ano_mes TEXT NOT NULL
        )
      `,
      `
        CREATE TABLE IF NOT EXISTS dw_dim_cliente (
          id INTEGER PRIMARY KEY,
          cliente_origem_id INTEGER NOT NULL UNIQUE,
          nome TEXT NOT NULL,
          cpf TEXT,
          cidade TEXT
        )
      `,
      `
        CREATE TABLE IF NOT EXISTS dw_dim_veiculo (
          id INTEGER PRIMARY KEY,
          veiculo_origem_id INTEGER NOT NULL UNIQUE,
          marca TEXT NOT NULL,
          modelo TEXT NOT NULL,
          ano INTEGER NOT NULL,
          categoria TEXT,
          preco_tabela REAL NOT NULL
        )
      `,
      `
        CREATE TABLE IF NOT EXISTS dw_dim_vendedor (
          id INTEGER PRIMARY KEY,
          vendedor_origem_id INTEGER NOT NULL UNIQUE,
          nome TEXT NOT NULL,
          cpf TEXT,
          concessionaria_origem_id INTEGER NOT NULL
        )
      `,
      `
        CREATE TABLE IF NOT EXISTS dw_dim_concessionaria (
          id INTEGER PRIMARY KEY,
          concessionaria_origem_id INTEGER NOT NULL UNIQUE,
          nome TEXT NOT NULL,
          cidade TEXT NOT NULL,
          estado TEXT NOT NULL,
          gerente TEXT
        )
      `,
      `
        CREATE TABLE IF NOT EXISTS dw_fato_vendas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          venda_origem_id INTEGER NOT NULL UNIQUE,
          tempo_id INTEGER NOT NULL,
          cliente_id INTEGER NOT NULL,
          veiculo_id INTEGER NOT NULL,
          vendedor_id INTEGER NOT NULL,
          concessionaria_id INTEGER NOT NULL,
          quantidade INTEGER NOT NULL DEFAULT 1,
          valor_total REAL NOT NULL,
          forma_pagamento TEXT,
          FOREIGN KEY (tempo_id) REFERENCES dw_dim_tempo(id),
          FOREIGN KEY (cliente_id) REFERENCES dw_dim_cliente(id),
          FOREIGN KEY (veiculo_id) REFERENCES dw_dim_veiculo(id),
          FOREIGN KEY (vendedor_id) REFERENCES dw_dim_vendedor(id),
          FOREIGN KEY (concessionaria_id) REFERENCES dw_dim_concessionaria(id)
        )
      `,
      `
        CREATE TABLE IF NOT EXISTS dw_cargas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          executado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
          total_vendas INTEGER NOT NULL,
          total_dimensoes INTEGER NOT NULL,
          status TEXT NOT NULL,
          observacao TEXT
        )
      `,
      'CREATE INDEX IF NOT EXISTS idx_dw_fato_tempo ON dw_fato_vendas(tempo_id)',
      'CREATE INDEX IF NOT EXISTS idx_dw_fato_cliente ON dw_fato_vendas(cliente_id)',
      'CREATE INDEX IF NOT EXISTS idx_dw_fato_veiculo ON dw_fato_vendas(veiculo_id)',
      'CREATE INDEX IF NOT EXISTS idx_dw_fato_vendedor ON dw_fato_vendas(vendedor_id)',
      'CREATE INDEX IF NOT EXISTS idx_dw_fato_concessionaria ON dw_fato_vendas(concessionaria_id)',
      'CREATE INDEX IF NOT EXISTS idx_dw_tempo_ano_mes ON dw_dim_tempo(ano, mes)'
    ]);
  }

  static refresh(db = getDatabase()) {
    this.ensureSchema(db);

    runMany(db, [
      'DELETE FROM dw_fato_vendas',
      'DELETE FROM dw_dim_tempo',
      'DELETE FROM dw_dim_cliente',
      'DELETE FROM dw_dim_veiculo',
      'DELETE FROM dw_dim_vendedor',
      'DELETE FROM dw_dim_concessionaria'
    ]);

    db.exec(`
      INSERT INTO dw_dim_concessionaria (id, concessionaria_origem_id, nome, cidade, estado, gerente)
      SELECT id, id, nome, cidade, estado, gerente
      FROM concessionarias
    `);

    db.exec(`
      INSERT INTO dw_dim_cliente (id, cliente_origem_id, nome, cpf, cidade)
      SELECT id, id, nome, cpf, cidade
      FROM clientes
    `);

    db.exec(`
      INSERT INTO dw_dim_veiculo (id, veiculo_origem_id, marca, modelo, ano, categoria, preco_tabela)
      SELECT id, id, marca, modelo, ano, categoria, preco
      FROM veiculos
    `);

    db.exec(`
      INSERT INTO dw_dim_vendedor (id, vendedor_origem_id, nome, cpf, concessionaria_origem_id)
      SELECT id, id, nome, cpf, concessionaria_id
      FROM vendedores
    `);

    db.exec(`
      INSERT INTO dw_dim_tempo (id, data, dia, mes, ano, trimestre, nome_mes, ano_mes)
      SELECT DISTINCT
        CAST(strftime('%Y%m%d', data_venda) AS INTEGER) as id,
        DATE(data_venda) as data,
        CAST(strftime('%d', data_venda) AS INTEGER) as dia,
        CAST(strftime('%m', data_venda) AS INTEGER) as mes,
        CAST(strftime('%Y', data_venda) AS INTEGER) as ano,
        ((CAST(strftime('%m', data_venda) AS INTEGER) - 1) / 3) + 1 as trimestre,
        CASE strftime('%m', data_venda)
          WHEN '01' THEN 'Janeiro'
          WHEN '02' THEN 'Fevereiro'
          WHEN '03' THEN 'Março'
          WHEN '04' THEN 'Abril'
          WHEN '05' THEN 'Maio'
          WHEN '06' THEN 'Junho'
          WHEN '07' THEN 'Julho'
          WHEN '08' THEN 'Agosto'
          WHEN '09' THEN 'Setembro'
          WHEN '10' THEN 'Outubro'
          WHEN '11' THEN 'Novembro'
          ELSE 'Dezembro'
        END as nome_mes,
        strftime('%Y-%m', data_venda) as ano_mes
      FROM vendas
    `);

    db.exec(`
      INSERT INTO dw_fato_vendas (
        venda_origem_id, tempo_id, cliente_id, veiculo_id, vendedor_id,
        concessionaria_id, quantidade, valor_total, forma_pagamento
      )
      SELECT
        v.id,
        CAST(strftime('%Y%m%d', v.data_venda) AS INTEGER),
        v.cliente_id,
        v.veiculo_id,
        v.vendedor_id,
        v.concessionaria_id,
        1,
        v.valor_total,
        v.forma_pagamento
      FROM vendas v
    `);

    const totalVendas = db.prepare('SELECT COUNT(*) as total FROM dw_fato_vendas').get().total;
    const totalDimensoes = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM dw_dim_tempo) +
        (SELECT COUNT(*) FROM dw_dim_cliente) +
        (SELECT COUNT(*) FROM dw_dim_veiculo) +
        (SELECT COUNT(*) FROM dw_dim_vendedor) +
        (SELECT COUNT(*) FROM dw_dim_concessionaria) as total
    `).get().total;

    db.prepare(`
      INSERT INTO dw_cargas (total_vendas, total_dimensoes, status, observacao)
      VALUES (?, ?, ?, ?)
    `).run([totalVendas, totalDimensoes, 'sucesso', 'Carga dimensional gerada a partir das tabelas operacionais']);

    return { total_vendas: totalVendas, total_dimensoes: totalDimensoes };
  }

  static getMetadata(db = getDatabase()) {
    this.ensureSchema(db);
    const ultimaCarga = db.prepare('SELECT * FROM dw_cargas ORDER BY executado_em DESC, id DESC LIMIT 1').get();
    const counts = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM dw_dim_tempo) as dim_tempo,
        (SELECT COUNT(*) FROM dw_dim_cliente) as dim_cliente,
        (SELECT COUNT(*) FROM dw_dim_veiculo) as dim_veiculo,
        (SELECT COUNT(*) FROM dw_dim_vendedor) as dim_vendedor,
        (SELECT COUNT(*) FROM dw_dim_concessionaria) as dim_concessionaria,
        (SELECT COUNT(*) FROM dw_fato_vendas) as fato_vendas
    `).get();

    return {
      ultima_carga: ultimaCarga || null,
      tabelas: counts,
      modelo: {
        fato: 'dw_fato_vendas',
        dimensoes: ['dw_dim_tempo', 'dw_dim_cliente', 'dw_dim_veiculo', 'dw_dim_vendedor', 'dw_dim_concessionaria'],
        grao: 'Uma linha por venda realizada'
      }
    };
  }

  static getAnalyticFromClause() {
    return `
      FROM dw_fato_vendas fv
      JOIN dw_dim_tempo dt ON fv.tempo_id = dt.id
      JOIN dw_dim_cliente cli ON fv.cliente_id = cli.id
      JOIN dw_dim_veiculo vei ON fv.veiculo_id = vei.id
      JOIN dw_dim_vendedor ven ON fv.vendedor_id = ven.id
      JOIN dw_dim_concessionaria con ON fv.concessionaria_id = con.id
    `;
  }
}

module.exports = DataWarehouseService;
