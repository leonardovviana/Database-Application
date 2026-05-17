const { getDatabase } = require('../database/init');

const ClienteUsuario = {
  findByEmail(email) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM cliente_usuarios WHERE email = ?').get([email]);
  },

  findById(id) {
    const db = getDatabase();
    return db.prepare('SELECT id, nome, email, telefone, cidade, created_at FROM cliente_usuarios WHERE id = ?').get([id]);
  },

  create(data) {
    const db = getDatabase();
    const result = db.prepare(`
      INSERT INTO cliente_usuarios (nome, email, senha, telefone, cidade)
      VALUES (?, ?, ?, ?, ?)
    `).run([data.nome, data.email, data.senha, data.telefone || null, data.cidade || null]);
    return this.findById(result.lastInsertRowid);
  },

  update(id, data) {
    const db = getDatabase();
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = Object.values(data);
    db.prepare(`UPDATE cliente_usuarios SET ${fields} WHERE id = ?`).run([...values, id]);
    return this.findById(id);
  },

  updatePassword(id, senha) {
    const db = getDatabase();
    db.prepare('UPDATE cliente_usuarios SET senha = ? WHERE id = ?').run([senha, id]);
  }
};

module.exports = ClienteUsuario;
