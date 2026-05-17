const { getDatabase } = require('../database/init');

const Usuario = {
  findByEmail(email) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM usuarios WHERE email = ?').get([email]);
  },

  findById(id) {
    const db = getDatabase();
    return db.prepare('SELECT id, nome, email, cargo, created_at FROM usuarios WHERE id = ?').get([id]);
  }
};

module.exports = Usuario;
