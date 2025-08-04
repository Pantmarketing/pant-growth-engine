import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt, sign, verify } from 'hono/jwt';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

type Bindings = {
  DB: any; // D1Database type
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

// JWT Secret - Em produção, use uma variável de ambiente
const JWT_SECRET = 'your-super-secret-jwt-key';

// Schemas de validação
const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const dashboardSchema = z.object({
  name: z.string(),
  business_model: z.enum(['lead_para_vendedor', 'venda_direta', 'quiz']),
  sheets_url: z.string().url().optional(),
  client_password: z.string(),
});

const operationalCostSchema = z.object({
  description: z.string(),
  amount: z.number(),
  date_from: z.string(),
  date_to: z.string(),
});

const clientAuthSchema = z.object({
  password: z.string(),
});

// Middleware de autenticação para rotas admin
const authMiddleware = jwt({
  secret: JWT_SECRET,
});

// Middleware de autenticação para rotas públicas (clientes)
const clientAuthMiddleware = jwt({
  secret: JWT_SECRET,
});

// Função auxiliar para converter URL do Google Sheets para CSV
function convertSheetsUrlToCsv(url: string): string {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) {
    const spreadsheetId = match[1];
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=0`;
  }
  throw new Error('URL do Google Sheets inválida');
}

// Função para parsear dados brasileiros
function parseNumber(value: string): number {
  if (!value || value === '') return 0;
  
  // Remove símbolos de moeda e espaços
  let cleaned = value.replace(/[R$\s]/g, '');
  
  // Se tem ponto e vírgula, assume formato brasileiro (1.234,56)
  if (cleaned.includes('.') && cleaned.includes(',')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } 
  // Se tem apenas vírgula, assume que é decimal brasileiro (123,45)
  else if (cleaned.includes(',') && !cleaned.includes('.')) {
    cleaned = cleaned.replace(',', '.');
  }
  
  return parseFloat(cleaned) || 0;
}

// Função para parsear CSV
function parseCSV(csvText: string): any[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index]?.trim() || '';
      
      // Mapear colunas para campos do banco
      switch (header) {
        case 'data':
          row.date = value;
          break;
        case 'investimento':
          row.investment = parseNumber(value);
          break;
        case 'impressões':
        case 'impressoes':
          row.impressions = parseInt(value) || 0;
          break;
        case 'cliques':
          row.clicks = parseInt(value) || 0;
          break;
        case 'visualizações':
        case 'visualizacoes':
        case 'page_views':
          row.page_views = parseInt(value) || 0;
          break;
        case 'leads':
          row.leads = parseInt(value) || 0;
          break;
        case 'conversas':
          row.conversations = parseInt(value) || 0;
          break;
        case 'reuniões':
        case 'reunioes':
          row.meetings = parseInt(value) || 0;
          break;
        case 'negociações':
        case 'negociacoes':
          row.negotiations = parseInt(value) || 0;
          break;
        case 'vendas':
          row.sales = parseInt(value) || 0;
          break;
        case 'receita':
          row.revenue = parseNumber(value);
          break;
        case 'checkouts':
          row.checkouts = parseInt(value) || 0;
          break;
        case 'sales_page_views':
          row.sales_page_views = parseInt(value) || 0;
          break;
      }
    });
    
    if (row.date) {
      data.push(row);
    }
  }
  
  return data;
}

// Rotas de autenticação admin
app.post('/api/login', zValidator('json', loginSchema), async (c) => {
  const { username, password } = c.req.valid('json');
  
  try {
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE username = ?'
    ).bind(username).first();
    
    if (!user) {
      return c.json({ error: 'Credenciais inválidas' }, 401);
    }
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return c.json({ error: 'Credenciais inválidas' }, 401);
    }
    
    const token = await sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET
    );
    
    return c.json({ token });
  } catch (error) {
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Rotas protegidas para admin
app.use('/api/dashboards*', authMiddleware);
app.use('/api/dashboard*', authMiddleware);

app.get('/api/dashboards', async (c) => {
  try {
    const dashboards = await c.env.DB.prepare(
      'SELECT id, name, business_model, sheets_url, created_at FROM dashboards ORDER BY created_at DESC'
    ).all();
    
    return c.json(dashboards.results);
  } catch (error) {
    return c.json({ error: 'Erro ao buscar dashboards' }, 500);
  }
});

app.post('/api/dashboards', zValidator('json', dashboardSchema), async (c) => {
  const { name, business_model, sheets_url, client_password } = c.req.valid('json');
  
  try {
    const passwordHash = await bcrypt.hash(client_password, 10);
    
    const result = await c.env.DB.prepare(
      'INSERT INTO dashboards (name, business_model, sheets_url, client_password_hash) VALUES (?, ?, ?, ?) RETURNING *'
    ).bind(name, business_model, sheets_url || null, passwordHash).first();
    
    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Erro ao criar dashboard' }, 500);
  }
});

app.get('/api/dashboard/:id', async (c) => {
  const id = c.req.param('id');
  const startDate = c.req.query('startDate');
  const endDate = c.req.query('endDate');
  
  try {
    // Buscar dashboard
    const dashboard = await c.env.DB.prepare(
      'SELECT * FROM dashboards WHERE id = ?'
    ).bind(id).first();
    
    if (!dashboard) {
      return c.json({ error: 'Dashboard não encontrado' }, 404);
    }
    
    // Buscar dados com filtro de data
    let dataQuery = 'SELECT * FROM dashboard_data WHERE dashboard_id = ?';
    const params = [id];
    
    if (startDate && endDate) {
      dataQuery += ' AND date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    dataQuery += ' ORDER BY date ASC';
    
    const data = await c.env.DB.prepare(dataQuery).bind(...params).all();
    
    // Buscar custos operacionais
    let costsQuery = 'SELECT * FROM operational_costs WHERE dashboard_id = ?';
    const costsParams = [id];
    
    if (startDate && endDate) {
      costsQuery += ' AND ((date_from <= ? AND date_to >= ?) OR (date_from >= ? AND date_from <= ?))';
      costsParams.push(endDate, startDate, startDate, endDate);
    }
    
    const costs = await c.env.DB.prepare(costsQuery).bind(...costsParams).all();
    
    return c.json({
      dashboard,
      data: data.results,
      operational_costs: costs.results
    });
  } catch (error) {
    return c.json({ error: 'Erro ao buscar dashboard' }, 500);
  }
});

app.post('/api/dashboard/:id/import-sheets', async (c) => {
  const id = c.req.param('id');
  
  try {
    // Buscar dashboard
    const dashboard = await c.env.DB.prepare(
      'SELECT * FROM dashboards WHERE id = ?'
    ).bind(id).first();
    
    if (!dashboard || !dashboard.sheets_url) {
      return c.json({ error: 'Dashboard ou URL da planilha não encontrada' }, 404);
    }
    
    // Converter URL para CSV
    const csvUrl = convertSheetsUrlToCsv(dashboard.sheets_url);
    
    // Buscar dados do CSV
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error('Erro ao buscar dados da planilha');
    }
    
    const csvText = await response.text();
    const data = parseCSV(csvText);
    
    // Limpar dados antigos
    await c.env.DB.prepare('DELETE FROM dashboard_data WHERE dashboard_id = ?').bind(id).run();
    
    // Inserir novos dados
    for (const row of data) {
      await c.env.DB.prepare(`
        INSERT INTO dashboard_data (
          dashboard_id, date, investment, impressions, clicks, page_views,
          leads, conversations, meetings, negotiations, sales_page_views,
          checkouts, sales, revenue
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, row.date, row.investment || 0, row.impressions || 0,
        row.clicks || 0, row.page_views || 0, row.leads || 0,
        row.conversations || 0, row.meetings || 0, row.negotiations || 0,
        row.sales_page_views || 0, row.checkouts || 0, row.sales || 0,
        row.revenue || 0
      ).run();
    }
    
    return c.json({ message: 'Dados importados com sucesso', imported: data.length });
  } catch (error) {
    return c.json({ error: 'Erro ao importar dados: ' + error.message }, 500);
  }
});

app.post('/api/dashboard/:id/costs', zValidator('json', operationalCostSchema), async (c) => {
  const id = c.req.param('id');
  const { description, amount, date_from, date_to } = c.req.valid('json');
  
  try {
    const result = await c.env.DB.prepare(
      'INSERT INTO operational_costs (dashboard_id, description, amount, date_from, date_to) VALUES (?, ?, ?, ?, ?) RETURNING *'
    ).bind(id, description, amount, date_from, date_to).first();
    
    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Erro ao adicionar custo operacional' }, 500);
  }
});

// Rotas públicas para clientes
app.post('/api/public/auth/:id', zValidator('json', clientAuthSchema), async (c) => {
  const id = c.req.param('id');
  const { password } = c.req.valid('json');
  
  try {
    const dashboard = await c.env.DB.prepare(
      'SELECT * FROM dashboards WHERE id = ?'
    ).bind(id).first();
    
    if (!dashboard) {
      return c.json({ error: 'Dashboard não encontrado' }, 404);
    }
    
    const isValid = await bcrypt.compare(password, dashboard.client_password_hash);
    if (!isValid) {
      return c.json({ error: 'Senha incorreta' }, 401);
    }
    
    const token = await sign(
      { dashboardId: dashboard.id, type: 'client' },
      JWT_SECRET
    );
    
    return c.json({ token });
  } catch (error) {
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

app.use('/api/public/dashboard*', clientAuthMiddleware);

app.get('/api/public/dashboard/:id', async (c) => {
  const id = c.req.param('id');
  const startDate = c.req.query('startDate');
  const endDate = c.req.query('endDate');
  
  try {
    // Verificar se o token é válido para este dashboard
    const payload = c.get('jwtPayload');
    if (payload.dashboardId != id || payload.type !== 'client') {
      return c.json({ error: 'Acesso negado' }, 403);
    }
    
    // Buscar dashboard (sem informações sensíveis)
    const dashboard = await c.env.DB.prepare(
      'SELECT id, name, business_model, created_at FROM dashboards WHERE id = ?'
    ).bind(id).first();
    
    if (!dashboard) {
      return c.json({ error: 'Dashboard não encontrado' }, 404);
    }
    
    // Buscar dados com filtro de data
    let dataQuery = 'SELECT * FROM dashboard_data WHERE dashboard_id = ?';
    const params = [id];
    
    if (startDate && endDate) {
      dataQuery += ' AND date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    dataQuery += ' ORDER BY date ASC';
    
    const data = await c.env.DB.prepare(dataQuery).bind(...params).all();
    
    return c.json({
      dashboard,
      data: data.results
    });
  } catch (error) {
    return c.json({ error: 'Erro ao buscar dashboard' }, 500);
  }
});

export default app;