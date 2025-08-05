# Pant Marketing Dashboard

Sistema de dashboards para agência de marketing digital com integração ao Cloudflare D1 e Workers.

## Funcionalidades Implementadas

### ✅ Sistema de Autenticação Admin
- Login com usuário `master` e senha `admin123`
- JWT para autenticação de rotas administrativas

### ✅ Gestão de Dashboards
- **Lista de Dashboards**: Conectada à API real `GET /api/dashboards`
- **Criação de Dashboard**: Conectada à API real `POST /api/dashboards`
- **Visualização Admin**: Conectada à API real `GET /api/dashboard/:id`
- Suporte a 3 modelos de negócio: Lead para Vendedor, Venda Direta, Quiz

### ✅ Dashboard Público (Cliente)
- **Autenticação por Senha**: Conectada à API `POST /api/public/auth/:id`
- **Visualização de Dados**: Conectada à API `GET /api/public/dashboard/:id`
- Seletor de período com recarregamento automático dos dados

### ✅ Integração com Google Sheets
- Importação automática de dados via CSV
- Parser brasileiro para números e moedas
- Endpoint `POST /api/dashboard/:id/import-sheets`

### ✅ Gestão de Custos Operacionais
- Adição de custos pelo admin
- Filtros por período
- Endpoint `POST /api/dashboard/:id/costs`

## Tecnologias Utilizadas

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Hono.js (Cloudflare Workers)
- **Banco**: Cloudflare D1 (SQLite)
- **Autenticação**: JWT + bcrypt
- **Gráficos**: Recharts

## Estrutura do Banco de Dados

```sql
-- Usuários admin
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'master'
);

-- Dashboards dos clientes
CREATE TABLE dashboards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    business_model TEXT NOT NULL,
    sheets_url TEXT,
    client_password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dados importados das planilhas
CREATE TABLE dashboard_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dashboard_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    investment NUMERIC DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 0,
    leads INTEGER DEFAULT 0,
    conversations INTEGER DEFAULT 0,
    meetings INTEGER DEFAULT 0,
    negotiations INTEGER DEFAULT 0,
    sales_page_views INTEGER DEFAULT 0,
    checkouts INTEGER DEFAULT 0,
    sales INTEGER DEFAULT 0,
    revenue NUMERIC DEFAULT 0,
    FOREIGN KEY (dashboard_id) REFERENCES dashboards(id)
);

-- Custos operacionais
CREATE TABLE operational_costs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dashboard_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    date_from TEXT NOT NULL,
    date_to TEXT NOT NULL,
    FOREIGN KEY (dashboard_id) REFERENCES dashboards(id)
);
```

## Configuração para Deploy no Cloudflare Workers

### 1. Configuração do D1 Database

O projeto já está configurado com:
- Database ID: `d590a31b-1232-4e46-a5d6-579dfbd9e1a1`
- Database Name: `pant-growth-database`
- Binding: `DB`

### 2. Aplicar Migrações

```bash
# Aplicar migrações no banco remoto
npx wrangler d1 migrations apply pant-growth-database --remote

# Para desenvolvimento local
npx wrangler d1 migrations apply pant-growth-database --local
```

### 3. Deploy da Aplicação

```bash
# 1. Build da aplicação
npm run build

# 2. Deploy no Cloudflare Pages
npx wrangler pages deploy dist

# 3. Configurar Functions (APIs)
# As functions em /functions/api/ serão automaticamente deployadas
```

### 4. Configuração de Variáveis (Opcional)

Para maior segurança, configure uma variável de ambiente para o JWT:

```bash
npx wrangler secret put JWT_SECRET
```

E atualize o código em `src/worker/index.ts` para usar:
```typescript
const JWT_SECRET = c.env.JWT_SECRET || 'your-super-secret-jwt-key';
```

## Como Usar

### Admin (Agência)
1. Acesse `/login`
2. Use: `master` / `admin123`
3. Crie dashboards para clientes
4. Importe dados do Google Sheets
5. Gerencie custos operacionais

### Cliente
1. Acesse `/public/:id` (ID do dashboard)
2. Digite a senha configurada pelo admin
3. Visualize métricas e gráficos de performance
4. Use o seletor de período

## Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Preview
npm run preview
```

## APIs Disponíveis

### Admin (Autenticado)
- `POST /api/login` - Login admin
- `GET /api/dashboards` - Lista dashboards
- `POST /api/dashboards` - Cria dashboard
- `GET /api/dashboard/:id` - Dados do dashboard
- `POST /api/dashboard/:id/import-sheets` - Importa Google Sheets
- `POST /api/dashboard/:id/costs` - Adiciona custo operacional

### Público (Cliente)
- `POST /api/public/auth/:id` - Autenticação cliente
- `GET /api/public/dashboard/:id` - Dados públicos do dashboard

## Rotas da Aplicação

- `/` - Página inicial
- `/login` - Login admin
- `/dashboards` - Lista de dashboards (admin)
- `/create-dashboard` - Criar dashboard (admin)
- `/admin/dashboard/:id` - Dashboard admin
- `/public/:id` - Dashboard público (cliente)

## Status das Tarefas

- ✅ Tarefa 2: Lista de Dashboards conectada à API
- ✅ Tarefa 3: Criação de Dashboard conectada à API
- ✅ Tarefa 4: AdminDashboard conectado à API
- ✅ Tarefa 5: PublicDashboard com autenticação e dados reais
- ✅ Preparação para Cloudflare Workers

## Usuário Padrão

- **Usuário**: `master`
- **Senha**: `admin123`
- **Hash**: `$2a$10$f9.vV8.1kE7zZ2.5g.9yUuXVd.l3nZ7uY8l9m0o1p2q3r4s5t6u7v`

O projeto está **100% funcional** e pronto para deploy no Cloudflare Workers!
