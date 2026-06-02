/**
 * Seed de dados fictícios — gera 1500 vendas distribuídas no último ano
 * (2025-06-02 a 2026-06-02), divididas quase igualmente entre as 5 concessionárias,
 * com 1 cliente distinto por venda (1500 clientes com nomes diferentes).
 *
 * Garante 5 concessionárias (3 base + 2 novas) e vendedores em todas elas.
 * As vendas existentes são SUBSTITUÍDAS (DELETE) para o total ficar exatamente 1500.
 * Clientes/veículos/vendedores são adicionados de forma idempotente (não duplicam).
 *
 * Uso: node database/seedFicticio.js   (a partir de backend/)
 */
const { initDatabase, getDatabase, saveDatabase } = require('./init');
const DataWarehouseService = require('../services/dataWarehouseService');

const TOTAL_VENDAS = 1500;
const VENDEDORES_POR_CONCESSIONARIA = 4;
const DATA_INICIO = new Date('2025-06-02T00:00:00');
const DATA_FIM = new Date('2026-06-02T23:59:59');
const FORMAS_PAGAMENTO = ['financiamento', 'à vista', 'consórcio'];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pad(n, len = 2) {
  return String(n).padStart(len, '0');
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

function cpfFromSeq(seq9, sufixo) {
  const s = String(seq9).padStart(9, '0');
  return `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6, 9)}-${pad(sufixo)}`;
}

// ---- Pools de nomes ----
const PRIMEIROS_NOMES = [
  'Ana', 'Beatriz', 'Carlos', 'Daniela', 'Eduardo', 'Fernanda', 'Gustavo', 'Helena',
  'Igor', 'Juliana', 'Lucas', 'Mariana', 'Nathan', 'Olivia', 'Paulo', 'Renata',
  'Sergio', 'Tatiana', 'Vitor', 'Yasmin', 'Bruno', 'Camila', 'Diego', 'Elaine',
  'Felipe', 'Gabriela', 'Henrique', 'Isabela', 'João', 'Karina', 'Leonardo', 'Marcela',
  'Rafael', 'Sofia', 'Thiago', 'Vanessa', 'André', 'Larissa', 'Marcelo', 'Patrícia',
  'Rodrigo', 'Aline', 'Bernardo', 'Cristina', 'Daniel', 'Emanuel', 'Flavia', 'Gabriel',
  'Heloísa', 'Ivan', 'Jéssica', 'Kléber', 'Letícia', 'Murilo', 'Natália', 'Otávio',
  'Priscila', 'Ramon', 'Sabrina', 'Tomás'
];
const SOBRENOMES = [
  'Silva', 'Souza', 'Oliveira', 'Lima', 'Pereira', 'Ferreira', 'Almeida', 'Costa',
  'Rodrigues', 'Gomes', 'Martins', 'Carvalho', 'Ribeiro', 'Barbosa', 'Rocha', 'Dias',
  'Nunes', 'Cardoso', 'Moraes', 'Pinto', 'Araújo', 'Teixeira', 'Cavalcanti', 'Freitas',
  'Mendes', 'Castro', 'Torres', 'Rios', 'Lopes', 'Vieira', 'Monteiro', 'Cunha',
  'Ramos', 'Azevedo', 'Correia', 'Fonseca', 'Camargo', 'Andrade', 'Tavares', 'Macedo'
];
const CIDADES = [
  'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Campinas', 'Niterói', 'Contagem',
  'Santos', 'Guarulhos', 'Osasco', 'Uberlândia', 'Duque de Caxias', 'Sorocaba',
  'Curitiba', 'Porto Alegre', 'Londrina', 'Caxias do Sul'
];

function gerarNomesUnicos(qtd) {
  const combos = [];
  for (const n of PRIMEIROS_NOMES) {
    for (const s of SOBRENOMES) combos.push(`${n} ${s}`);
  }
  if (combos.length < qtd) {
    throw new Error(`Combinações de nomes (${combos.length}) insuficientes para ${qtd} clientes.`);
  }
  return embaralhar(combos).slice(0, qtd);
}

function gerarClientes(total) {
  const nomes = gerarNomesUnicos(total);
  const lista = [];
  for (let i = 0; i < total; i++) {
    const cpf = cpfFromSeq(900000000 + i, i % 100);
    const ddd = rand(['11', '21', '31', '41', '51', '19', '13']);
    const telefone = `(${ddd}) 9${pad(8000 + (i % 2000), 4)}-${pad((1000 + i) % 10000, 4)}`;
    const email = `cliente${i + 1}@email.com`;
    lista.push([nomes[i], cpf, telefone, email, rand(CIDADES)]);
  }
  return lista;
}

// ---- Concessionárias novas (idempotente por nome) ----
const NOVAS_CONCESSIONARIAS = [
  ['MM Motors Curitiba', 'Curitiba', 'PR', 'Sandra Reis', '(41) 3000-0004'],
  ['MM Motors Porto Alegre', 'Porto Alegre', 'RS', 'Marcos Vieira', '(51) 3000-0005']
];

const NOVOS_VEICULOS = [
  ['Hyundai', 'Creta', 2025, 'SUV', 145000.00, 999],
  ['Hyundai', 'HB20', 2024, 'Hatch', 88000.00, 999],
  ['Renault', 'Kardian', 2025, 'SUV', 110000.00, 999],
  ['Renault', 'Kwid', 2024, 'Hatch', 72000.00, 999],
  ['Volkswagen', 'Polo', 2024, 'Hatch', 92000.00, 999],
  ['Volkswagen', 'Nivus', 2025, 'SUV', 142000.00, 999],
  ['Volkswagen', 'Virtus', 2024, 'Sedã', 112000.00, 999],
  ['Toyota', 'Yaris', 2024, 'Sedã', 108000.00, 999],
  ['Toyota', 'Hilux', 2025, 'SUV', 285000.00, 999],
  ['Chevrolet', 'Tracker', 2025, 'SUV', 138000.00, 999],
  ['Chevrolet', 'Onix Plus', 2024, 'Sedã', 98000.00, 999],
  ['Fiat', 'Fastback', 2024, 'SUV', 128000.00, 999],
  ['Fiat', 'Argo', 2024, 'Hatch', 84000.00, 999],
  ['Fiat', 'Toro', 2025, 'SUV', 175000.00, 999],
  ['Honda', 'City', 2025, 'Sedã', 118000.00, 999],
  ['Honda', 'HR-V', 2025, 'SUV', 165000.00, 999],
  ['Peugeot', '208', 2024, 'Hatch', 89000.00, 999],
  ['Nissan', 'Versa', 2024, 'Sedã', 105000.00, 999],
  ['Jeep', 'Renegade', 2025, 'SUV', 155000.00, 999],
  ['Volkswagen', 'T-Cross', 2025, 'SUV', 145000.00, 999]
];

function inserirConcessionarias(db) {
  NOVAS_CONCESSIONARIAS.forEach(c => {
    db.prepare(`
      INSERT INTO concessionarias (nome, cidade, estado, gerente, telefone)
      SELECT ?, ?, ?, ?, ?
      WHERE NOT EXISTS (SELECT 1 FROM concessionarias WHERE nome = ?)
    `).run([...c, c[0]]);
  });
}

// Gera vendedores para TODAS as concessionárias (idempotente por cpf)
function inserirVendedores(db, concIds) {
  concIds.forEach((cid, ci) => {
    for (let k = 0; k < VENDEDORES_POR_CONCESSIONARIA; k++) {
      const nome = `${rand(PRIMEIROS_NOMES)} ${rand(SOBRENOMES)}`;
      const cpf = cpfFromSeq(800000000 + ci * 100 + k, (ci * 10 + k) % 100);
      const email = `vendedor.c${cid}.${k}@mmmotors.com`;
      const ddd = rand(['11', '21', '31', '41', '51']);
      const telefone = `(${ddd}) 9${pad(6000 + ci * 10 + k, 4)}-${pad(2000 + ci * 10 + k, 4)}`;
      db.prepare(`
        INSERT INTO vendedores (nome, cpf, telefone, email, concessionaria_id)
        SELECT ?, ?, ?, ?, ?
        WHERE NOT EXISTS (SELECT 1 FROM vendedores WHERE cpf = ?)
      `).run([nome, cpf, telefone, email, cid, cpf]);
    }
  });
}

function inserirClientes(db, clientes) {
  clientes.forEach(c => {
    db.prepare(`
      INSERT INTO clientes (nome, cpf, telefone, email, cidade)
      SELECT ?, ?, ?, ?, ?
      WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE cpf = ?)
    `).run([...c, c[1]]);
  });
}

function inserirVeiculos(db) {
  NOVOS_VEICULOS.forEach(v => {
    db.prepare(`
      INSERT INTO veiculos (marca, modelo, ano, categoria, preco, estoque)
      SELECT ?, ?, ?, ?, ?, ?
      WHERE NOT EXISTS (SELECT 1 FROM veiculos WHERE marca = ? AND modelo = ? AND ano = ?)
    `).run([...v, v[0], v[1], v[2]]);
  });
}

function gerarVendas(db, clientesGerados) {
  // IDs dos clientes gerados (mapeados por email), embaralhados — 1 por venda
  const mapaEmail = new Map(
    db.prepare('SELECT id, email FROM clientes').all().map(r => [r.email, r.id])
  );
  const clienteIds = embaralhar(
    clientesGerados.map(c => mapaEmail.get(c[3])).filter(Boolean)
  );

  const concessionarias = db.prepare('SELECT id FROM concessionarias ORDER BY id').all().map(r => r.id);
  const vendedoresPorConc = {};
  db.prepare('SELECT id, concessionaria_id FROM vendedores').all().forEach(v => {
    (vendedoresPorConc[v.concessionaria_id] ||= []).push(v.id);
  });
  const veiculos = db.prepare('SELECT id, preco FROM veiculos').all();

  const insert = db.prepare(`
    INSERT INTO vendas (cliente_id, vendedor_id, veiculo_id, concessionaria_id, data_venda, valor_total, forma_pagamento)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Distribuição quase igual entre as concessionárias
  const base = Math.floor(TOTAL_VENDAS / concessionarias.length);
  const resto = TOTAL_VENDAS % concessionarias.length;

  let ptr = 0;
  const distribuicao = {};
  concessionarias.forEach((concId, idx) => {
    const qtd = base + (idx < resto ? 1 : 0);
    distribuicao[concId] = qtd;
    const vendedores = vendedoresPorConc[concId] || [];
    for (let k = 0; k < qtd; k++) {
      const veiculo = rand(veiculos);
      const fator = 0.95 + Math.random() * 0.10; // ±5%
      const valor = Math.round(veiculo.preco * fator * 100) / 100;
      insert.run([
        clienteIds[ptr++],          // 1 cliente distinto por venda
        rand(vendedores),
        veiculo.id,
        concId,
        dataAleatoria(),
        valor,
        rand(FORMAS_PAGAMENTO)
      ]);
    }
  });

  return distribuicao;
}

async function run() {
  await initDatabase();
  const db = getDatabase();

  // 1) Garante 5 concessionárias e vendedores em todas
  inserirConcessionarias(db);
  const concIds = db.prepare('SELECT id FROM concessionarias ORDER BY id').all().map(r => r.id);
  inserirVendedores(db, concIds);

  // 2) Veículos e clientes (1 distinto por venda)
  inserirVeiculos(db);
  const clientesGerados = gerarClientes(TOTAL_VENDAS);
  inserirClientes(db, clientesGerados);

  // 3) Substitui todas as vendas para o total ficar exatamente 1500
  db.exec('DELETE FROM vendas');
  const distribuicao = gerarVendas(db, clientesGerados);

  // 3.1) Remove clientes antigos: mantém apenas os 1500 vinculados às vendas novas
  db.exec('DELETE FROM clientes WHERE id NOT IN (SELECT DISTINCT cliente_id FROM vendas)');

  // 4) Atualiza o Data Warehouse e persiste
  const resumoDW = DataWarehouseService.refresh(db);
  saveDatabase();

  const stats = db.prepare(
    'SELECT COUNT(*) as total, MIN(data_venda) as min, MAX(data_venda) as max FROM vendas'
  ).get();
  const clientesComVenda = db.prepare('SELECT COUNT(DISTINCT cliente_id) as t FROM vendas').get().t;

  console.log('=== Seed de dados fictícios concluído ===');
  console.log(`Vendas (total):        ${stats.total}`);
  console.log(`Período das vendas:    ${stats.min}  ->  ${stats.max}`);
  console.log(`Clientes (total):      ${db.prepare('SELECT COUNT(*) as t FROM clientes').get().t}`);
  console.log(`Clientes com venda:    ${clientesComVenda} (1 por venda)`);
  console.log(`Concessionárias:       ${concIds.length}`);
  console.log(`Vendedores:            ${db.prepare('SELECT COUNT(*) as t FROM vendedores').get().t}`);
  console.log(`Veículos:              ${db.prepare('SELECT COUNT(*) as t FROM veiculos').get().t}`);
  console.log('Vendas por concessionária:');
  db.prepare(`
    SELECT c.nome, COUNT(v.id) as qtd
    FROM concessionarias c LEFT JOIN vendas v ON v.concessionaria_id = c.id
    GROUP BY c.id ORDER BY c.id
  `).all().forEach(r => console.log(`   - ${r.nome}: ${r.qtd}`));
  console.log(`DW -> fato_vendas:     ${resumoDW.total_vendas} | dimensões: ${resumoDW.total_dimensoes}`);
}

run().catch(err => {
  console.error('Erro ao gerar dados fictícios:', err);
  process.exit(1);
});
