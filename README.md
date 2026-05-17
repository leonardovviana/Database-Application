# MM Motors - Sistema de Gerenciamento de Concessionarias

Sistema de gestao automotiva com modulos de CRUD, Business Intelligence e Data Warehouse fisico.

## Funcionalidades

- **Autenticacao** - Login JWT com bcrypt, sessao persistente e logout.
- **CRUD completo** - Veiculos, clientes, vendedores, vendas e concessionarias.
- **Busca dinamica** - Pesquisa com filtros nas entidades principais.
- **Gerenciamento de estoque** - Validacao de estoque ao vender e restauracao ao excluir venda.
- **Dashboard BI** - Indicadores de faturamento, vendas, rankings e graficos.
- **Relatorios e analises** - Relatorios filtraveis com exportacao para Excel e PDF.
- **Data Warehouse fisico** - Modelo estrela com fato, dimensoes e carga ETL.
- **Seguranca** - Helmet, CORS, JWT, validacao de campos e sanitizacao de CPF/telefone.

## Data Warehouse

O projeto possui uma camada dimensional separada das tabelas operacionais do CRUD.

Modelo estrela:

```text
dw_dim_tempo
dw_dim_cliente
dw_dim_veiculo
dw_dim_vendedor
dw_dim_concessionaria
        \ | | | /
      dw_fato_vendas
```

Tabela fato:

- `dw_fato_vendas`: uma linha por venda realizada.

Dimensoes:

- `dw_dim_tempo`
- `dw_dim_cliente`
- `dw_dim_veiculo`
- `dw_dim_vendedor`
- `dw_dim_concessionaria`

Controle de carga:

- `dw_cargas`: registra cada execucao do ETL, com status, total de vendas carregadas e total de registros dimensionais.

O processo ETL extrai dados das tabelas `vendas`, `clientes`, `veiculos`, `vendedores` e `concessionarias`, transforma esses dados em dimensoes e carrega a tabela fato. O dashboard e os relatorios analiticos consultam essa camada DW, mantendo as rotas existentes do sistema.

## Requisitos

- Node.js 18+
- npm 9+

## Estrutura do Projeto

```text
Projeto_DW/
  backend/
    controllers/
    database/
    middleware/
    models/
    routes/
    services/
    server.js
  frontend/
    src/
      components/
      contexts/
      hooks/
      layouts/
      pages/
      routes/
      services/
```

## Configuracao

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

## Execucao

Backend:

```bash
cd backend
npm start
```

Frontend:

```bash
cd frontend
npm run dev
```

Acesse:

```text
http://localhost:3000
```

Credenciais:

| Email | Senha | Cargo |
| --- | --- | --- |
| admin@mmmotors.com | admin123 | Administrador |
| gerente@mmmotors.com | admin123 | Gerente |

## Banco de Dados

O sistema utiliza SQLite via `sql.js`. O banco e criado automaticamente em `backend/database/mm_motors.db`.

Na primeira execucao, o seed cria usuarios, concessionarias, clientes, vendedores, veiculos e um historico de vendas em diferentes meses/anos para alimentar o Data Warehouse.

## API

| Metodo | Rota | Descricao |
| --- | --- | --- |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Dados do usuario atual |
| GET | `/api/health` | Health check |
| GET/POST/PUT/DELETE | `/api/veiculos` | CRUD Veiculos |
| GET/POST/PUT/DELETE | `/api/clientes` | CRUD Clientes |
| GET/POST/PUT/DELETE | `/api/vendedores` | CRUD Vendedores |
| GET/POST/PUT/DELETE | `/api/concessionarias` | CRUD Concessionarias |
| GET/POST/PUT/DELETE | `/api/vendas` | CRUD Vendas |
| GET | `/api/dashboard/*` | Dashboard BI baseado no DW |
| GET | `/api/dashboard/data-warehouse` | Metadados do Data Warehouse |
| POST | `/api/dashboard/data-warehouse/refresh` | Executa carga ETL |
| GET | `/api/relatorios/*` | Relatorios analiticos baseados no DW |

Todas as rotas protegidas exigem token JWT:

```text
Authorization: Bearer <token>
```

## Tecnologias

Backend:

- Express
- JWT
- bcryptjs
- sql.js
- Helmet
- CORS
- Dotenv

Frontend:

- React
- React Router
- Axios
- Bootstrap
- Recharts
- jsPDF
- SheetJS
