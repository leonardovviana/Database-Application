const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

const dashboardRoutes = require('./routes/dashboardRoutes');
const veiculosRoutes = require('./routes/veiculosRoutes');
const relatoriosRoutes = require('./routes/relatoriosRoutes');
const clientesRoutes = require('./routes/clientesRoutes');
const vendasRoutes = require('./routes/vendasRoutes');
const concessionariasRoutes = require('./routes/concessionariasRoutes');
const vendedoresRoutes = require('./routes/vendedoresRoutes');
const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const publicRoutes = require('./routes/publicRoutes');
const { authMiddleware, requireGerente, requireAdmin } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

app.use('/api', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cliente', clienteRoutes);
app.use('/api/dashboard', authMiddleware, requireGerente, dashboardRoutes);
app.use('/api/veiculos', authMiddleware, requireGerente, veiculosRoutes);
app.use('/api/clientes', authMiddleware, requireGerente, clientesRoutes);
app.use('/api/vendas', authMiddleware, requireGerente, vendasRoutes);
app.use('/api/concessionarias', authMiddleware, requireAdmin, concessionariasRoutes);
app.use('/api/relatorios', authMiddleware, requireGerente, relatoriosRoutes);
app.use('/api/vendedores', authMiddleware, requireAdmin, vendedoresRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'MM Motors API' });
});

app.use(errorHandler);

async function start() {
  const { initDatabase } = require('./database/init');
  await initDatabase();
  console.log('Banco de dados inicializado');

  app.listen(PORT, () => {
    console.log(`MM Motors API rodando na porta ${PORT}`);
  });
}

start().catch(err => {
  console.error('Erro ao iniciar servidor:', err);
  process.exit(1);
});
