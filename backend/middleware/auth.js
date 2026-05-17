const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mm_motors_jwt_secret_key_2024_super_seguro';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Token mal formatado' });
  }

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token mal formatado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.usuario || req.usuario.cargo !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores' });
  }
  next();
}

function requireGerente(req, res, next) {
  if (!req.usuario || !['admin', 'gerente'].includes(req.usuario.cargo)) {
    return res.status(403).json({ error: 'Acesso restrito à administração' });
  }
  next();
}

function requireCliente(req, res, next) {
  if (!req.usuario || req.usuario.cargo !== 'cliente') {
    return res.status(403).json({ error: 'Acesso restrito a clientes' });
  }
  next();
}

module.exports = { authMiddleware, requireAdmin, requireGerente, requireCliente };
