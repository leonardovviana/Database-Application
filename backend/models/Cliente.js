const { getDatabase } = require('../database/init');

const Cliente = {
  findAll() {
    const db = getDatabase();
    return db.prepare('SELECT * FROM clientes ORDER BY nome').all();
  },

  findById(id) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM clientes WHERE id = ?').get([id]);
  },

  search(query) {
    const db = getDatabase();
    const term = `%${query}%`;
    return db.prepare(`
      SELECT * FROM clientes
      WHERE nome LIKE ? OR cpf LIKE ? OR email LIKE ? OR cidade LIKE ? OR telefone LIKE ?
      ORDER BY nome
    `).all([term, term, term, term, term]);
  },

  create(data) {
    const db = getDatabase();
    const result = db.prepare(`
      INSERT INTO clientes (nome, cpf, telefone, email, cidade)
      VALUES (?, ?, ?, ?, ?)
    `).run([data.nome, data.cpf, data.telefone, data.email, data.cidade]);
    return { id: result.lastInsertRowid, ...data };
  },

  update(id, data) {
    const db = getDatabase();
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = Object.values(data);
    db.prepare(`UPDATE clientes SET ${fields} WHERE id = ?`).run([...values, id]);
    return this.findById(id);
  },

  delete(id) {
    const db = getDatabase();
    return db.prepare('DELETE FROM clientes WHERE id = ?').run([id]);
  }
};

module.exports = Cliente;
