const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const dbPath = path.resolve(__dirname, process.env.DB_PATH || './mm_motors.db');

let db = null;
let SQL = null;

class Statement {
  constructor(sqlDb, sql) {
    this.sqlDb = sqlDb;
    this.sql = sql;
  }

  run(params = {}) {
    const stmt = this.sqlDb.prepare(this.sql);
    stmt.bind(params);
    stmt.step();
    const result = {
      lastInsertRowid: this.sqlDb.exec("SELECT last_insert_rowid() as id")[0]?.values[0]?.[0],
      changes: this.sqlDb.getRowsModified()
    };
    stmt.free();
    return result;
  }

  all(params = {}) {
    const stmt = this.sqlDb.prepare(this.sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  }

  get(params = {}) {
    const stmt = this.sqlDb.prepare(this.sql);
    stmt.bind(params);
    const result = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();
    return result;
  }
}

function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return {
    prepare(sql) { return new Statement(db, sql); },
    exec(sql) { return db.exec(sql); },
    close() { db.close(); }
  };
}

async function initDatabase() {
  SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');
  db.run('PRAGMA journal_mode = WAL');
  initTables();
  createIndexes();
  seedData();
  seedHistoricalSales();
  const DataWarehouseService = require('../services/dataWarehouseService');
  DataWarehouseService.refresh(getDatabase());
  saveDatabase();
}

function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function createIndexes() {
  db.run('CREATE INDEX IF NOT EXISTS idx_vendas_data ON vendas(data_venda)');
  db.run('CREATE INDEX IF NOT EXISTS idx_vendas_cliente ON vendas(cliente_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_vendas_vendedor ON vendas(vendedor_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_vendas_veiculo ON vendas(veiculo_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_vendas_concessionaria ON vendas(concessionaria_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_vendedores_concessionaria ON vendedores(concessionaria_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_clientes_cpf ON clientes(cpf)');
  db.run('CREATE INDEX IF NOT EXISTS idx_veiculos_categoria ON veiculos(categoria)');
  db.run('CREATE INDEX IF NOT EXISTS idx_cliente_usuarios_email ON cliente_usuarios(email)');
  db.run('CREATE INDEX IF NOT EXISTS idx_cliente_favoritos_cliente ON cliente_favoritos(cliente_id)');
}

function initTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      cargo TEXT NOT NULL DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS concessionarias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cidade TEXT NOT NULL,
      estado TEXT NOT NULL,
      gerente TEXT,
      telefone TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cpf TEXT UNIQUE,
      telefone TEXT,
      email TEXT,
      cidade TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS vendedores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cpf TEXT UNIQUE,
      telefone TEXT,
      email TEXT,
      concessionaria_id INTEGER NOT NULL,
      FOREIGN KEY (concessionaria_id) REFERENCES concessionarias(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS veiculos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      marca TEXT NOT NULL,
      modelo TEXT NOT NULL,
      ano INTEGER NOT NULL,
      categoria TEXT,
      preco REAL NOT NULL,
      estoque INTEGER DEFAULT 1
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS vendas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      vendedor_id INTEGER NOT NULL,
      veiculo_id INTEGER NOT NULL,
      concessionaria_id INTEGER NOT NULL,
      data_venda DATETIME DEFAULT CURRENT_TIMESTAMP,
      valor_total REAL NOT NULL,
      forma_pagamento TEXT,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id),
      FOREIGN KEY (vendedor_id) REFERENCES vendedores(id),
      FOREIGN KEY (veiculo_id) REFERENCES veiculos(id),
      FOREIGN KEY (concessionaria_id) REFERENCES concessionarias(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cliente_usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      telefone TEXT,
      cidade TEXT,
      cargo TEXT DEFAULT 'cliente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  try { db.run("ALTER TABLE cliente_usuarios ADD COLUMN cargo TEXT DEFAULT 'cliente'"); } catch (e) {}

  db.run(`
    CREATE TABLE IF NOT EXISTS cliente_favoritos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      veiculo_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES cliente_usuarios(id),
      FOREIGN KEY (veiculo_id) REFERENCES veiculos(id),
      UNIQUE(cliente_id, veiculo_id)
    )
  `);
}

function seedData() {
  const count = db.exec("SELECT COUNT(*) as total FROM concessionarias");
  if (count[0]?.values[0]?.[0] > 0) return;

  const bcrypt = require('bcryptjs');
  const salt = bcrypt.genSaltSync(10);
  const senhaHash = bcrypt.hashSync('admin123', salt);

  db.run("INSERT INTO usuarios (nome, email, senha, cargo) VALUES (?, ?, ?, ?)",
    ['Administrador', 'admin@mmmotors.com', senhaHash, 'admin']);
  db.run("INSERT INTO usuarios (nome, email, senha, cargo) VALUES (?, ?, ?, ?)",
    ['Gerente', 'gerente@mmmotors.com', senhaHash, 'gerente']);

  db.run("INSERT INTO concessionarias (nome, cidade, estado, gerente, telefone) VALUES (?, ?, ?, ?, ?)",
    ['MM Motors São Paulo', 'São Paulo', 'SP', 'Carlos Almeida', '(11) 3000-0001']);
  db.run("INSERT INTO concessionarias (nome, cidade, estado, gerente, telefone) VALUES (?, ?, ?, ?, ?)",
    ['MM Motors Rio de Janeiro', 'Rio de Janeiro', 'RJ', 'Ana Costa', '(21) 3000-0002']);
  db.run("INSERT INTO concessionarias (nome, cidade, estado, gerente, telefone) VALUES (?, ?, ?, ?, ?)",
    ['MM Motors Belo Horizonte', 'Belo Horizonte', 'MG', 'Roberto Lima', '(31) 3000-0003']);

  db.run("INSERT INTO clientes (nome, cpf, telefone, email, cidade) VALUES (?, ?, ?, ?, ?)",
    ['João Silva', '123.456.789-00', '(11) 99999-0001', 'joao@email.com', 'São Paulo']);
  db.run("INSERT INTO clientes (nome, cpf, telefone, email, cidade) VALUES (?, ?, ?, ?, ?)",
    ['Maria Souza', '987.654.321-00', '(11) 99999-0002', 'maria@email.com', 'São Paulo']);
  db.run("INSERT INTO clientes (nome, cpf, telefone, email, cidade) VALUES (?, ?, ?, ?, ?)",
    ['Carlos Lima', '456.789.123-00', '(21) 99999-0003', 'carlos@email.com', 'Rio de Janeiro']);
  db.run("INSERT INTO clientes (nome, cpf, telefone, email, cidade) VALUES (?, ?, ?, ?, ?)",
    ['Fernanda Rocha', '111.222.333-44', '(31) 99999-0004', 'fernanda@email.com', 'Belo Horizonte']);
  db.run("INSERT INTO clientes (nome, cpf, telefone, email, cidade) VALUES (?, ?, ?, ?, ?)",
    ['Pedro Oliveira', '555.666.777-88', '(11) 99999-0005', 'pedro@email.com', 'São Paulo']);

  db.run("INSERT INTO vendedores (nome, cpf, telefone, email, concessionaria_id) VALUES (?, ?, ?, ?, ?)",
    ['Lucas Mendes', '222.333.444-55', '(11) 98888-0001', 'lucas@mmmotors.com', 1]);
  db.run("INSERT INTO vendedores (nome, cpf, telefone, email, concessionaria_id) VALUES (?, ?, ?, ?, ?)",
    ['Juliana Castro', '333.444.555-66', '(21) 98888-0002', 'juliana@mmmotors.com', 2]);
  db.run("INSERT INTO vendedores (nome, cpf, telefone, email, concessionaria_id) VALUES (?, ?, ?, ?, ?)",
    ['Rafael Torres', '444.555.666-77', '(31) 98888-0003', 'rafael@mmmotors.com', 3]);
  db.run("INSERT INTO vendedores (nome, cpf, telefone, email, concessionaria_id) VALUES (?, ?, ?, ?, ?)",
    ['Amanda Rios', '555.666.777-88', '(11) 98888-0004', 'amanda@mmmotors.com', 1]);

  db.run("INSERT INTO veiculos (marca, modelo, ano, categoria, preco, estoque) VALUES (?, ?, ?, ?, ?, ?)",
    ['Toyota', 'Corolla', 2024, 'Sedã', 125000.00, 3]);
  db.run("INSERT INTO veiculos (marca, modelo, ano, categoria, preco, estoque) VALUES (?, ?, ?, ?, ?, ?)",
    ['Honda', 'Civic', 2023, 'Sedã', 115000.00, 2]);
  db.run("INSERT INTO veiculos (marca, modelo, ano, categoria, preco, estoque) VALUES (?, ?, ?, ?, ?, ?)",
    ['Volkswagen', 'T-Cross', 2024, 'SUV', 135000.00, 1]);
  db.run("INSERT INTO veiculos (marca, modelo, ano, categoria, preco, estoque) VALUES (?, ?, ?, ?, ?, ?)",
    ['Chevrolet', 'Onix', 2023, 'Hatch', 85000.00, 0]);
  db.run("INSERT INTO veiculos (marca, modelo, ano, categoria, preco, estoque) VALUES (?, ?, ?, ?, ?, ?)",
    ['Fiat', 'Pulse', 2024, 'SUV', 95000.00, 4]);
  db.run("INSERT INTO veiculos (marca, modelo, ano, categoria, preco, estoque) VALUES (?, ?, ?, ?, ?, ?)",
    ['Jeep', 'Compass', 2024, 'SUV', 175000.00, 2]);
  db.run("INSERT INTO veiculos (marca, modelo, ano, categoria, preco, estoque) VALUES (?, ?, ?, ?, ?, ?)",
    ['Nissan', 'Kicks', 2023, 'SUV', 105000.00, 3]);

  db.run("INSERT INTO vendas (cliente_id, vendedor_id, veiculo_id, concessionaria_id, valor_total, forma_pagamento) VALUES (?, ?, ?, ?, ?, ?)",
    [1, 1, 4, 1, 82000.00, 'financiamento']);
  db.run("INSERT INTO vendas (cliente_id, vendedor_id, veiculo_id, concessionaria_id, valor_total, forma_pagamento) VALUES (?, ?, ?, ?, ?, ?)",
    [3, 2, 2, 2, 110000.00, 'à vista']);
  db.run("INSERT INTO vendas (cliente_id, vendedor_id, veiculo_id, concessionaria_id, valor_total, forma_pagamento) VALUES (?, ?, ?, ?, ?, ?)",
    [4, 3, 7, 3, 102000.00, 'financiamento']);

  const historicoVendas = [
    [2, 4, 1, 1, '2024-01-12 10:30:00', 121500.00, 'financiamento'],
    [5, 1, 5, 1, '2024-02-18 14:15:00', 93000.00, 'consorcio'],
    [1, 2, 2, 2, '2024-03-09 09:40:00', 112000.00, 'a vista'],
    [3, 3, 6, 3, '2024-04-22 16:20:00', 169000.00, 'financiamento'],
    [4, 4, 1, 1, '2024-06-05 11:05:00', 124000.00, 'financiamento'],
    [2, 2, 7, 2, '2024-08-17 15:45:00', 103500.00, 'a vista'],
    [5, 3, 5, 3, '2024-10-28 13:10:00', 97000.00, 'consorcio'],
    [1, 1, 3, 1, '2025-01-14 10:00:00', 132000.00, 'financiamento'],
    [3, 2, 6, 2, '2025-03-20 17:30:00', 172500.00, 'a vista'],
    [4, 3, 7, 3, '2025-05-11 12:20:00', 104000.00, 'financiamento'],
    [2, 4, 5, 1, '2025-07-07 09:25:00', 96000.00, 'consorcio'],
    [5, 1, 1, 1, '2025-09-23 14:50:00', 126000.00, 'financiamento'],
    [1, 2, 2, 2, '2025-11-03 16:10:00', 114500.00, 'a vista'],
    [3, 3, 3, 3, '2026-02-19 11:35:00', 136000.00, 'financiamento'],
    [4, 4, 6, 1, '2026-04-08 15:05:00', 174000.00, 'a vista']
  ];

  historicoVendas.forEach(venda => {
    db.run(`
      INSERT INTO vendas (cliente_id, vendedor_id, veiculo_id, concessionaria_id, data_venda, valor_total, forma_pagamento)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, venda);
  });

  saveDatabase();
}

function seedHistoricalSales() {
  const historicoVendas = [
    [2, 4, 1, 1, '2024-01-12 10:30:00', 121500.00, 'financiamento'],
    [5, 1, 5, 1, '2024-02-18 14:15:00', 93000.00, 'consorcio'],
    [1, 2, 2, 2, '2024-03-09 09:40:00', 112000.00, 'a vista'],
    [3, 3, 6, 3, '2024-04-22 16:20:00', 169000.00, 'financiamento'],
    [4, 4, 1, 1, '2024-06-05 11:05:00', 124000.00, 'financiamento'],
    [2, 2, 7, 2, '2024-08-17 15:45:00', 103500.00, 'a vista'],
    [5, 3, 5, 3, '2024-10-28 13:10:00', 97000.00, 'consorcio'],
    [1, 1, 3, 1, '2025-01-14 10:00:00', 132000.00, 'financiamento'],
    [3, 2, 6, 2, '2025-03-20 17:30:00', 172500.00, 'a vista'],
    [4, 3, 7, 3, '2025-05-11 12:20:00', 104000.00, 'financiamento'],
    [2, 4, 5, 1, '2025-07-07 09:25:00', 96000.00, 'consorcio'],
    [5, 1, 1, 1, '2025-09-23 14:50:00', 126000.00, 'financiamento'],
    [1, 2, 2, 2, '2025-11-03 16:10:00', 114500.00, 'a vista'],
    [3, 3, 3, 3, '2026-02-19 11:35:00', 136000.00, 'financiamento'],
    [4, 4, 6, 1, '2026-04-08 15:05:00', 174000.00, 'a vista']
  ];

  historicoVendas.forEach(venda => {
    db.run(`
      INSERT INTO vendas (cliente_id, vendedor_id, veiculo_id, concessionaria_id, data_venda, valor_total, forma_pagamento)
      SELECT ?, ?, ?, ?, ?, ?, ?
      WHERE NOT EXISTS (
        SELECT 1 FROM vendas
        WHERE cliente_id = ?
          AND vendedor_id = ?
          AND veiculo_id = ?
          AND concessionaria_id = ?
          AND data_venda = ?
      )
    `, [...venda, venda[0], venda[1], venda[2], venda[3], venda[4]]);
  });
}

module.exports = { getDatabase, initDatabase };
