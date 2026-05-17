const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const ClienteUsuario = require('../models/ClienteUsuario');

const JWT_SECRET = process.env.JWT_SECRET || 'mm_motors_jwt_secret_key_2024_super_seguro';

const authController = {
  async login(req, res) {
    try {
      const { email, senha } = req.body;
      if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      const emailSanitized = email.trim().toLowerCase();

      let usuario = Usuario.findByEmail(emailSanitized);
      let tabela = 'usuarios';

      if (!usuario) {
        usuario = ClienteUsuario.findByEmail(emailSanitized);
        tabela = 'cliente_usuarios';
      }

      if (!usuario) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const senhaValida = bcrypt.compareSync(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const cargo = tabela === 'usuarios' ? usuario.cargo : 'cliente';

      const token = jwt.sign(
        { id: usuario.id, nome: usuario.nome, email: usuario.email, cargo, tabela },
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
      );

      res.json({
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          cargo,
          telefone: usuario.telefone || null,
          cidade: usuario.cidade || null
        }
      });
    } catch (err) {
      console.error('Erro no login:', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async register(req, res) {
    try {
      const { nome, email, senha, telefone, cidade } = req.body;
      if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
      }
      if (senha.length < 6) {
        return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
      }

      const emailSanitized = email.trim().toLowerCase();

      if (Usuario.findByEmail(emailSanitized) || ClienteUsuario.findByEmail(emailSanitized)) {
        return res.status(409).json({ error: 'Email já cadastrado' });
      }

      const salt = bcrypt.genSaltSync(10);
      const senhaHash = bcrypt.hashSync(senha, salt);

      const usuario = ClienteUsuario.create({
        nome: nome.trim(),
        email: emailSanitized,
        senha: senhaHash,
        telefone: telefone || null,
        cidade: cidade || null
      });

      const token = jwt.sign(
        { id: usuario.id, nome: usuario.nome, email: usuario.email, cargo: 'cliente', tabela: 'cliente_usuarios' },
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
      );

      res.status(201).json({
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          cargo: 'cliente',
          telefone: usuario.telefone,
          cidade: usuario.cidade
        }
      });
    } catch (err) {
      console.error('Erro no registro:', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  me(req, res) {
    try {
      const { cargo, tabela, id } = req.usuario;
      let usuario;

      if (tabela === 'cliente_usuarios' || cargo === 'cliente') {
        usuario = ClienteUsuario.findById(id);
      } else {
        usuario = Usuario.findById(id);
      }

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      res.json(usuario);
    } catch (err) {
      console.error('Erro ao buscar usuário:', err);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

module.exports = authController;
