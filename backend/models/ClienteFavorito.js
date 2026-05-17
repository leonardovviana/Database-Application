const { getDatabase } = require('../database/init');

const ClienteFavorito = {
  findByCliente(cliente_id) {
    const db = getDatabase();
    return db.prepare(`
      SELECT f.id, f.created_at as favoritado_em,
             v.id as veiculo_id, v.marca, v.modelo, v.ano, v.categoria, v.preco, v.estoque
      FROM cliente_favoritos f
      JOIN veiculos v ON v.id = f.veiculo_id
      WHERE f.cliente_id = ?
      ORDER BY f.created_at DESC
    `).all([cliente_id]);
  },

  add(cliente_id, veiculo_id) {
    const db = getDatabase();
    try {
      db.prepare('INSERT INTO cliente_favoritos (cliente_id, veiculo_id) VALUES (?, ?)').run([cliente_id, veiculo_id]);
      return true;
    } catch (err) {
      if (err.message.includes('UNIQUE')) return false;
      throw err;
    }
  },

  remove(cliente_id, veiculo_id) {
    const db = getDatabase();
    return db.prepare('DELETE FROM cliente_favoritos WHERE cliente_id = ? AND veiculo_id = ?').run([cliente_id, veiculo_id]);
  },

  isFavorited(cliente_id, veiculo_id) {
    const db = getDatabase();
    const result = db.prepare('SELECT id FROM cliente_favoritos WHERE cliente_id = ? AND veiculo_id = ?').get([cliente_id, veiculo_id]);
    return !!result;
  }
};

module.exports = ClienteFavorito;
