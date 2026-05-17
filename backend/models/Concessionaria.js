const { getDatabase } = require('../database/init');

const Concessionaria = {
  findAll() {
    const db = getDatabase();
    return db.prepare('SELECT * FROM concessionarias ORDER BY nome').all();
  },

  findById(id) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM concessionarias WHERE id = ?').get([id]);
  },

  create(data) {
    const db = getDatabase();
    const result = db.prepare(`
      INSERT INTO concessionarias (nome, cidade, estado, gerente, telefone)
      VALUES (?, ?, ?, ?, ?)
    `).run([data.nome, data.cidade, data.estado, data.gerente, data.telefone]);
    return { id: result.lastInsertRowid, ...data };
  },

  update(id, data) {
    const db = getDatabase();
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = Object.values(data);
    db.prepare(`UPDATE concessionarias SET ${fields} WHERE id = ?`).run([...values, id]);
    return this.findById(id);
  },

  search(term) {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM concessionarias
      WHERE nome LIKE ? OR cidade LIKE ? OR estado LIKE ? OR gerente LIKE ?
      ORDER BY nome
    `).all([`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`]);
  },

  delete(id) {
    const db = getDatabase();
    return db.prepare('DELETE FROM concessionarias WHERE id = ?').run([id]);
  }
};

module.exports = Concessionaria;
