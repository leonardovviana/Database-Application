/**
 * Seed de dados fictícios — gera ~250 vendas distribuídas no último ano
 * (2025-06-02 a 2026-06-02), com clientes suficientes para ~1 cliente por venda,
 * além de novos vendedores e um catálogo amplo de veículos.
 *
 * Preserva todos os dados existentes (apenas adiciona).
 * Reaproveita initDatabase()/getDatabase() e o refresh do Data Warehouse.
 *
 * Uso: node database/seedFicticio.js   (a partir de backend/)
 */
const { initDatabase, getDatabase, saveDatabase } = require('./init');
const DataWarehouseService = require('../services/dataWarehouseService');

const TOTAL_VENDAS = 250;
const TOTAL_CLIENTES = 270; // > TOTAL_VENDAS para garantir ~1 cliente por venda
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

function embaralhar(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---- Geração procedural de clientes ----
const PRIMEIROS_NOMES = [
  'Ana', 'Beatriz', 'Carlos', 'Daniela', 'Eduardo', 'Fernanda', 'Gustavo', 'Helena',
  'Igor', 'Juliana', 'Lucas', 'Mariana', 'Nathan', 'Olivia', 'Paulo', 'Renata',
  'Sergio', 'Tatiana', 'Vitor', 'Yasmin', 'Bruno', 'Camila', 'Diego', 'Elaine',
  'Felipe', 'Gabriela', 'Henrique', 'Isabela', 'João', 'Karina', 'Leonardo', 'Marcela',
  'Rafael', 'Sofia', 'Thiago', 'Vanessa', 'André', 'Larissa', 'Marcelo', 'Patrícia'
];
const SOBRENOMES = [
  'Silva', 'Souza', 'Oliveira', 'Lima', 'Pereira', 'Ferreira', 'Almeida', 'Costa',
  'Rodrigues', 'Gomes', 'Martins', 'Carvalho', 'Ribeiro', 'Barbosa', 'Rocha', 'Dias',
  'Nunes', 'Cardoso', 'Moraes', 'Pinto', 'Araújo', 'Teixeira', 'Cavalcanti', 'Freitas'
];
const CIDADES = [
  'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Campinas', 'Niterói', 'Contagem',
  'Santos', 'Guarulhos', 'Osasco', 'Uberlândia', 'Duque de Caxias', 'Sorocaba'
];

function gerarClientes(total) {
  const lista = [];
  for (let i = 0; i < total; i++) {
    const nome = `${rand(PRIMEIROS_NOMES)} ${rand(SOBRENOMES)}`;
    // CPF determinístico e único por índice (prefixo 900 evita colisão com o seed base)
    const seq = String(900000000 + i).padStart(9, '0'); // 9 dígitos
    const cpf = `${seq.slice(0, 3)}.${seq.slice(3, 6)}.${seq.slice(6, 9)}-${pad(i % 100)}`;
    const ddd = rand(['11', '21', '31', '19', '13']);
    const telefone = `(${ddd}) 9${String(8000 + (i % 2000)).padStart(4, '0')}-${String(1000 + i).slice(-4)}`;
    const email = `cliente${i + 1}@email.com`;
    lista.push([nome, cpf, telefone, email, rand(CIDADES)]);
  }
  return lista;
}

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
  ['Hyundai', 'HB20', 2024, 'Hatch', 88000.00, 50],
  ['Renault', 'Kardian', 2025, 'SUV', 110000.00, 50],
  ['Renault', 'Kwid', 2024, 'Hatch', 72000.00, 50],
  ['Volkswagen', 'Polo', 2024, 'Hatch', 92000.00, 50],
  ['Volkswagen', 'Nivus', 2025, 'SUV', 142000.00, 50],
  ['Volkswagen', 'Virtus', 2024, 'Sedã', 112000.00, 50],
  ['Toyota', 'Yaris', 2024, 'Sedã', 108000.00, 50],
  ['Toyota', 'Hilux', 2025, 'SUV', 285000.00, 50],
  ['Chevrolet', 'Tracker', 2025, 'SUV', 138000.00, 50],
  ['Chevrolet', 'Onix Plus', 2024, 'Sedã', 98000.00, 50],
  ['Fiat', 'Fastback', 2024, 'SUV', 128000.00, 50],
  ['Fiat', 'Argo', 2024, 'Hatch', 84000.00, 50],
  ['Fiat', 'Toro', 2025, 'SUV', 175000.00, 50],
  ['Honda', 'City', 2025, 'Sedã', 118000.00, 50],
  ['Honda', 'HR-V', 2025, 'SUV', 165000.00, 50],
  ['Peugeot', '208', 2024, 'Hatch', 89000.00, 50],
  ['Nissan', 'Versa', 2024, 'Sedã', 105000.00, 50],
  ['Jeep', 'Renegade', 2025, 'SUV', 155000.00, 50],
  ['Volkswagen', 'T-Cross', 2025, 'SUV', 145000.00, 50]
];

function inserirNovasEntidades(db, clientes) {
  clientes.forEach(c => {
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
  // Embaralha os clientes para usar (quase) um cliente distinto por venda
  const clientes = embaralhar(db.prepare('SELECT id FROM clientes').all().map(r => r.id));
  const vendedores = db.prepare('SELECT id, concessionaria_id FROM vendedores').all();
  const veiculos = db.prepare('SELECT id, preco FROM veiculos').all();

  const insert = db.prepare(`
    INSERT INTO vendas (cliente_id, vendedor_id, veiculo_id, concessionaria_id, data_venda, valor_total, forma_pagamento)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (let i = 0; i < TOTAL_VENDAS; i++) {
    const cliente = clientes[i % clientes.length]; // 1 cliente distinto por venda
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

  inserirNovasEntidades(db, gerarClientes(TOTAL_CLIENTES));
  gerarVendas(db);

  const resumoDW = DataWarehouseService.refresh(db);

  // Persiste todas as inserções (vendas + DW) no arquivo .db
  saveDatabase();

  const stats = db.prepare(
    'SELECT COUNT(*) as total, MIN(data_venda) as min, MAX(data_venda) as max FROM vendas'
  ).get();
  const clientesComVenda = db.prepare(
    'SELECT COUNT(DISTINCT cliente_id) as t FROM vendas'
  ).get().t;

  console.log('=== Seed de dados fictícios concluído ===');
  console.log(`Vendas antes:          ${antes}`);
  console.log(`Vendas depois:         ${stats.total} (+${stats.total - antes})`);
  console.log(`Período das vendas:    ${stats.min}  ->  ${stats.max}`);
  console.log(`Clientes (total):      ${db.prepare('SELECT COUNT(*) as t FROM clientes').get().t}`);
  console.log(`Clientes com venda:    ${clientesComVenda}`);
  console.log(`Vendedores:            ${db.prepare('SELECT COUNT(*) as t FROM vendedores').get().t}`);
  console.log(`Veículos:              ${db.prepare('SELECT COUNT(*) as t FROM veiculos').get().t}`);
  console.log(`DW -> fato_vendas:     ${resumoDW.total_vendas} | dimensões: ${resumoDW.total_dimensoes}`);
}

run().catch(err => {
  console.error('Erro ao gerar dados fictícios:', err);
  process.exit(1);
});
