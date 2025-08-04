-- Apaga tabelas antigas para garantir um início limpo
DROP TABLE IF EXISTS operational_costs;
DROP TABLE IF EXISTS dashboard_data;
DROP TABLE IF EXISTS dashboards;
DROP TABLE IF EXISTS users;

-- Tabela de usuários (admin)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'master'
);

-- Tabela de dashboards
CREATE TABLE dashboards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    business_model TEXT NOT NULL,
    sheets_url TEXT,
    client_password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de custos operacionais (gerenciados pelo admin)
CREATE TABLE operational_costs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dashboard_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    date_from TEXT NOT NULL,
    date_to TEXT NOT NULL,
    FOREIGN KEY (dashboard_id) REFERENCES dashboards(id)
);

-- Tabela com os dados importados da planilha
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

-- Insere o usuário 'master' com a senha inicial 'admin123'
INSERT INTO users (username, password_hash, role) VALUES ('master', '$2a$10$f9.vV8.1kE7zZ2.5g.9yUuXVd.l3nZ7uY8l9m0o1p2q3r4s5t6u7v', 'master');