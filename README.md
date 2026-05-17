# MM Motors — Sistema de Gerenciamento de Concessionárias

Sistema completo de gestão automotiva com módulos de CRUD, Business Intelligence (BI) e Data Warehouse.

## Funcionalidades

- **Autenticação** — Login JWT com bcrypt, sessão persistente, logout
- **CRUD Completo** — Veículos, Clientes, Vendedores, Vendas, Concessionárias
- **Busca Dinâmica** — Pesquisa com debounce de 300ms e filtros em todas as entidades
- **Gerenciamento de Estoque** — Validação de estoque ao vender, restauração ao excluir venda
- **Dashboard BI** — Faturamento total, veículos vendidos, melhores vendedores/concessionárias
  - Gráfico de barras (receita mensal)
  - Gráfico de pizza (faturamento por categoria)
  - Gráfico de barras horizontal (vendas por concessionária)
  - Tabela de ranking de vendedores
  - Cards de veículos por categoria
- **Relatórios e Análises** — 8 tipos de relatório com filtros e exportação
  - Vendas Mensais / Anuais
  - Receita Anual com ticket médio
  - Melhores Vendedores e Concessionárias
  - Veículos Mais Vendidos
  - Vendas por Cidade e por Categoria
  - Exportação para **Excel** (xlsx) e **PDF** (jsPDF)
- **Segurança** — Helmet, CORS, JWT, validação de campos, sanitização de CPF/telefone

## Requisitos

- Node.js 18+
- npm 9+

## Estrutura do Projeto

```
mm-motors/
├── backend/
│   ├── controllers/       # Lógica dos endpoints
│   ├── database/          # Inicialização e seed do SQLite
│   ├── middleware/         # Auth, validação, error handler
│   ├── models/            # Acesso a dados (SQL)
│   ├── routes/            # Definição de rotas Express
│   ├── services/          # Serviços auxiliares
│   ├── .env               # Configurações de ambiente
│   ├── package.json
│   └── server.js          # Ponto de entrada
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── contexts/      # React Contexts (Auth, Toast)
│   │   ├── hooks/         # Custom hooks
│   │   ├── layouts/       # Layout principal
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── routes/        # Configuração de rotas
│   │   └── services/      # Chamadas à API (Axios)
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── README.md
└── .gitignore
```

## Configuração

### 1. Backend

```bash
cd backend
npm install
```

Configure o arquivo `.env` (já existe com valores padrão):

```
PORT=3001
DB_PATH=./mm_motors.db
NODE_ENV=development
JWT_SECRET=mm_motors_jwt_secret_key_2024_super_seguro
JWT_EXPIRES_IN=8h
```

### 2. Frontend

```bash
cd frontend
npm install
```

O Vite já está configurado com proxy para o backend na porta 3001 (arquivo `vite.config.js`).

## Execução

### Backend (porta 3001)

```bash
cd backend
node server.js
```

O banco SQLite é criado automaticamente na primeira execução com dados de seed (2 usuários, 3 concessionárias, 5 clientes, 4 vendedores, 7 veículos, 3 vendas).

### Frontend (porta 3000)

```bash
cd frontend
npm run dev
```

Acesse: http://localhost:3000

### Credenciais de Acesso

| Email | Senha | Cargo |
|-------|-------|-------|
| admin@mmmotors.com | admin123 | Administrador |
| gerente@mmmotors.com | admin123 | Gerente |

## Banco de Dados

O sistema utiliza **SQLite** (via `sql.js`) com banco em arquivo local. O arquivo `mm_motors.db` é criado automaticamente na pasta `backend/database/`.

### Índices

Índices criados automaticamente nas colunas mais consultadas para performance:
- `vendas`: data_venda, cliente_id, vendedor_id, veiculo_id, concessionaria_id
- `vendedores`: concessionaria_id
- `clientes`: cpf
- `veiculos`: categoria

## API

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Dados do usuário atual |
| GET | `/api/health` | Health check |
| GET/POST/PUT/DELETE | `/api/veiculos` | CRUD Veículos |
| GET/POST/PUT/DELETE | `/api/clientes` | CRUD Clientes |
| GET/POST/PUT/DELETE | `/api/vendedores` | CRUD Vendedores |
| GET/POST/PUT/DELETE | `/api/concessionarias` | CRUD Concessionárias |
| GET/POST/PUT/DELETE | `/api/vendas` | CRUD Vendas |
| GET | `/api/dashboard/*` | Dashboard BI |
| GET | `/api/relatorios/*` | Relatórios analíticos |

Todas as rotas (exceto `/api/auth/login` e `/api/health`) exigem token JWT no header:
```
Authorization: Bearer <token>
```

## Tecnologias

### Backend
- Express 4, JWT, bcryptjs, sql.js, Helmet, Cors, Dotenv

### Frontend
- React 18, React Router 6, Axios, Bootstrap 5, Recharts, jsPDF, SheetJS (xlsx)
