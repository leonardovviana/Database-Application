const { getDatabase } = require('../database/init');

const Veiculo = {
  findAll() {
    const db = getDatabase();
    return db.prepare('SELECT * FROM veiculos ORDER BY marca, modelo').all();
  },

  findById(id) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM veiculos WHERE id = ?').get([id]);
  },

  create(data) {
    const db = getDatabase();
    const result = db.prepare(`
      INSERT INTO veiculos (marca, modelo, ano, categoria, preco, estoque)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run([data.marca, data.modelo, data.ano, data.categoria, data.preco, data.estoque]);
    return { id: result.lastInsertRowid, ...data };
  },

  update(id, data) {
    const db = getDatabase();
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = Object.values(data);
    db.prepare(`UPDATE veiculos SET ${fields} WHERE id = ?`).run([...values, id]);
    return this.findById(id);
  },

  delete(id) {
    const db = getDatabase();
    return db.prepare('DELETE FROM veiculos WHERE id = ?').run([id]);
  },

  search(query) {
    const db = getDatabase();
    const term = `%${query}%`;
    return db.prepare(`
      SELECT * FROM veiculos
      WHERE marca LIKE ? OR modelo LIKE ? OR categoria LIKE ? OR CAST(ano AS TEXT) LIKE ?
      ORDER BY marca, modelo
    `).all([term, term, term, term]);
  },

  countByCategoria() {
    const db = getDatabase();
    return db.prepare(`
      SELECT categoria, COUNT(*) as total, SUM(estoque) as total_estoque
      FROM veiculos GROUP BY categoria
    `).all();
  }
};

module.exports = Veiculo;
