const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Data persistence: use /data volume on Railway, local dir otherwise
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'src', 'data');
const DATA_FILE = path.join(DATA_DIR, 'companies.json');
const SEED_FILE = path.join(__dirname, 'src', 'data', 'companies.json');

// Admin password (set via environment variable)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

// Ensure data directory exists and seed if needed
function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE) && fs.existsSync(SEED_FILE)) {
    fs.copyFileSync(SEED_FILE, DATA_FILE);
    console.log('Data file seeded from src/data/companies.json');
  }
}

ensureDataFile();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint (for Railway)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Admin auth middleware for write operations
function requireAdmin(req, res, next) {
  if (!ADMIN_PASSWORD) {
    // No password set = open access (local dev mode)
    return next();
  }
  const auth = req.headers['x-admin-password'];
  if (auth !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized. Set x-admin-password header.' });
  }
  next();
}

// Helper: read companies
function readCompanies() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

// Helper: write companies
function writeCompanies(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// GET all companies (public)
app.get('/api/companies', (req, res) => {
  try {
    const companies = readCompanies();
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read companies data' });
  }
});

// POST new company (admin only)
app.post('/api/companies', requireAdmin, (req, res) => {
  try {
    const companies = readCompanies();
    const newCompany = {
      ...req.body,
      id: req.body.id || `sc-${String(Date.now()).slice(-6)}`,
      incenseCount: req.body.incenseCount || 0,
      createdAt: new Date().toISOString(),
    };
    companies.push(newCompany);
    writeCompanies(companies);
    res.status(201).json(newCompany);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// PUT update company (admin only)
app.put('/api/companies/:id', requireAdmin, (req, res) => {
  try {
    const companies = readCompanies();
    const idx = companies.findIndex(c => c.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Company not found' });
    }
    companies[idx] = { ...companies[idx], ...req.body, id: req.params.id };
    writeCompanies(companies);
    res.json(companies[idx]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// DELETE company (admin only)
app.delete('/api/companies/:id', requireAdmin, (req, res) => {
  try {
    let companies = readCompanies();
    const idx = companies.findIndex(c => c.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Company not found' });
    }
    const deleted = companies[idx];
    companies = companies.filter(c => c.id !== req.params.id);
    writeCompanies(companies);
    res.json({ success: true, deleted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

// SPA fallback - serve index.html for all non-API routes
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    return res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
  next();
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🪦 Startup Cemetery running on port ${PORT}`);
  console.log(`📊 Data file: ${DATA_FILE}`);
  console.log(`🔐 Admin auth: ${ADMIN_PASSWORD ? 'enabled' : 'disabled (open access)'}`);
});
