const { getDatabase } = require('../database/init');

const Vendedor = {
  findAll() {
    const db = getDatabase();
    return db.prepare(`
      SELECT v.*, c.nome as concessionaria_nome
      FROM vendedores v
      JOIN concessionarias c ON v.concessionaria_id = c.id
      ORDER BY v.nome
    `).all();
  },

  findById(id) {
    const db = getDatabase();
    return db.prepare(`
      SELECT v.*, c.nome as concessionaria_nome
      FROM vendedores v
      JOIN concessionarias c ON v.concessionaria_id = c.id
      WHERE v.id = ?
    `).get([id]);
  },

  search(query) {
    const db = getDatabase();
    const term = `%${query}%`;
    return db.prepare(`
      SELECT v.*, c.nome as concessionaria_nome
      FROM vendedores v
      JOIN concessionarias c ON v.concessionaria_id = c.id
      WHERE v.nome LIKE ? OR v.cpf LIKE ? OR v.email LIKE ? OR c.nome LIKE ?
      ORDER BY v.nome
    `).all([term, term, term, term]);
  },

  create(data) {
    const db = getDatabase();
    const result = db.prepare(`
      INSERT INTO vendedores (nome, cpf, telefone, email, concessionaria_id)
      VALUES (?, ?, ?, ?, ?)
    `).run([data.nome, data.cpf, data.telefone, data.email, data.concessionaria_id]);
    return { id: result.lastInsertRowid, ...data };
  },

  update(id, data) {
    const db = getDatabase();
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = Object.values(data);
    db.prepare(`UPDATE vendedores SET ${fields} WHERE id = ?`).run([...values, id]);
    return this.findById(id);
  },

  delete(id) {
    const db = getDatabase();
    return db.prepare('DELETE FROM vendedores WHERE id = ?').run([id]);
  }
};

module.exports = Vendedor;
