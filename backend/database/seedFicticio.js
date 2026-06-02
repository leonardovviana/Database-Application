/**
 * Seed de dados fictícios — gera ~250 vendas distribuídas no último ano
 * (2025-06-02 a 2026-06-02), além de novos clientes, vendedores e veículos.
 *
 * Preserva todos os dados existentes (apenas adiciona).
 * Reaproveita initDatabase()/getDatabase() e o refresh do Data Warehouse.
 *
 * Uso: node database/seedFicticio.js   (a partir de backend/)
 */
const { initDatabase, getDatabase, saveDatabase } = require('./init');
const DataWarehouseService = require('../services/dataWarehouseService');

const TOTAL_VENDAS = 250;
const DATA_INICIO = new Date('2025-06-02T00:00:00');
const DATA_FIM = new Date('2026-06-02T23:59:59');
const FORMAS_PAGAMENTO = ['financiamento', 'à vista', 'consórcio'];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function dataAleatoria() {
  const t = DATA_INICIO.getTime() + Math.random() * (DATA_FIM.getTime() - DATA_INICIO.getTime());
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const NOVOS_CLIENTES = [
  ['Beatriz Nunes', '101.202.303-01', '(11) 97777-1001', 'beatriz.nunes@email.com', 'São Paulo'],
  ['Gustavo Ferreira', '202.303.404-02', '(21) 97777-1002', 'gustavo.ferreira@email.com', 'Rio de Janeiro'],
  ['Larissa Martins', '303.404.505-03', '(31) 97777-1003', 'larissa.martins@email.com', 'Belo Horizonte'],
  ['Ricardo Alves', '404.505.606-04', '(11) 97777-1004', 'ricardo.alves@email.com', 'Campinas'],
  ['Patrícia Gomes', '505.606.707-05', '(21) 97777-1005', 'patricia.gomes@email.com', 'Niterói'],
  ['Eduardo Barbosa', '606.707.808-06', '(31) 97777-1006', 'eduardo.barbosa@email.com', 'Contagem'],
  ['Camila Ribeiro', '707.808.909-07', '(11) 97777-1007', 'camila.ribeiro@email.com', 'Santos'],
  ['Thiago Carvalho', '808.909.010-08', '(21) 97777-1008', 'thiago.carvalho@email.com', 'Rio de Janeiro'],
  ['Aline Pereira', '909.010.121-09', '(31) 97777-1009', 'aline.pereira@email.com', 'Belo Horizonte'],
  ['Marcelo Dias', '010.121.232-10', '(11) 97777-1010', 'marcelo.dias@email.com', 'São Paulo']
];

const NOVOS_VENDEDORES = [
  ['Bruno Cardoso', '121.232.343-11', '(11) 96666-2001', 'bruno.cardoso@mmmotors.com', 1],
  ['Sofia Almeida', '232.343.454-12', '(11) 96666-2002', 'sofia.almeida@mmmotors.com', 1],
  ['Felipe Moraes', '343.454.565-13', '(21) 96666-2003', 'felipe.moraes@mmmotors.com', 2],
  ['Renata Lopes', '454.565.676-14', '(21) 96666-2004', 'renata.lopes@mmmotors.com', 2],
  ['Diego Santos', '565.676.787-15', '(31) 96666-2005', 'diego.santos@mmmotors.com', 3],
  ['Vanessa Pinto', '676.787.898-16', '(31) 96666-2006', 'vanessa.pinto@mmmotors.com', 3]
];

const NOVOS_VEICULOS = [
  ['Hyundai', 'Creta', 2025, 'SUV', 145000.00, 50],
  ['Renault', 'Kardian', 2025, 'SUV', 110000.00, 50],
  ['Volkswagen', 'Polo', 2024, 'Hatch', 92000.00, 50],
  ['Toyota', 'Yaris', 2024, 'Sedã', 108000.00, 50],
  ['Chevrolet', 'Tracker', 2025, 'SUV', 138000.00, 50],
  ['Fiat', 'Fastback', 2024, 'SUV', 128000.00, 50],
  ['Honda', 'City', 2025, 'Sedã', 118000.00, 50],
  ['Peugeot', '208', 2024, 'Hatch', 89000.00, 50]
];

function inserirNovasEntidades(db) {
  NOVOS_CLIENTES.forEach(c => {
    db.prepare(`
      INSERT INTO clientes (nome, cpf, telefone, email, cidade)
      SELECT ?, ?, ?, ?, ?
      WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cpf = ?)
    `).run([...c, c[1]]);
  });

  NOVOS_VENDEDORES.forEach(v => {
    db.prepare(`
      INSERT INTO vendedores (nome, cpf, telefone, email, concessionaria_id)
      SELECT ?, ?, ?, ?, ?
      WHERE NOT EXISTS (SELECT 1 FROM vendedores WHERE cpf = ?)
    `).run([...v, v[1]]);
  });

  NOVOS_VEICULOS.forEach(v => {
    db.prepare(`
      INSERT INTO veiculos (marca, modelo, ano, categoria, preco, estoque)
      SELECT ?, ?, ?, ?, ?, ?
      WHERE NOT EXISTS (SELECT 1 FROM veiculos WHERE marca = ? AND modelo = ? AND ano = ?)
    `).run([...v, v[0], v[1], v[2]]);
  });
}

function gerarVendas(db) {
  const clientes = db.prepare('SELECT id FROM clientes').all().map(r => r.id);
  const vendedores = db.prepare('SELECT id, concessionaria_id FROM vendedores').all();
  const veiculos = db.prepare('SELECT id, preco FROM veiculos').all();

  const insert = db.prepare(`
    INSERT INTO vendas (cliente_id, vendedor_id, veiculo_id, concessionaria_id, data_venda, valor_total, forma_pagamento)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (let i = 0; i < TOTAL_VENDAS; i++) {
    const cliente = rand(clientes);
    const vendedor = rand(vendedores);
    const veiculo = rand(veiculos);
    const fator = 0.95 + Math.random() * 0.10; // ±5%
    const valor = Math.round(veiculo.preco * fator * 100) / 100;

    insert.run([
      cliente,
      vendedor.id,
      veiculo.id,
      vendedor.concessionaria_id,
      dataAleatoria(),
      valor,
      rand(FORMAS_PAGAMENTO)
    ]);
  }
}

async function run() {
  await initDatabase();
  const db = getDatabase();

  const antes = db.prepare('SELECT COUNT(*) as total FROM vendas').get().total;

  inserirNovasEntidades(db);
  gerarVendas(db);

  const resumoDW = DataWarehouseService.refresh(db);

  // Persiste todas as inserções (vendas + DW) no arquivo .db
  saveDatabase();

  const stats = db.prepare(
    'SELECT COUNT(*) as total, MIN(data_venda) as min, MAX(data_venda) as max FROM vendas'
  ).get();

  console.log('=== Seed de dados fictícios concluído ===');
  console.log(`Vendas antes:        ${antes}`);
  console.log(`Vendas depois:       ${stats.total} (+${stats.total - antes})`);
  console.log(`Período das vendas:  ${stats.min}  ->  ${stats.max}`);
  console.log(`Clientes:            ${db.prepare('SELECT COUNT(*) as t FROM clientes').get().t}`);
  console.log(`Vendedores:          ${db.prepare('SELECT COUNT(*) as t FROM vendedores').get().t}`);
  console.log(`Veículos:            ${db.prepare('SELECT COUNT(*) as t FROM veiculos').get().t}`);
  console.log(`DW -> fato_vendas:   ${resumoDW.total_vendas} | dimensões: ${resumoDW.total_dimensoes}`);
}

run().catch(err => {
  console.error('Erro ao gerar dados fictícios:', err);
  process.exit(1);
});
