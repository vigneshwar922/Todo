require('dotenv').config();

const express = require('express');
const path    = require('path');
const fs      = require('fs');
const cors    = require('cors');

const authRoutes = require('./routes/auth');
const tasksRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────

// CORS — allow frontend URL in production, wildcard in development
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL // Allow dynamic frontend URL from Render
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.url}`);
    next();
});

// Ensure uploads directory exists
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log('📁 Created uploads directory');
}

// Serve static files
const CLIENT_DIST_PATH = path.join(__dirname, '..', 'client', 'dist');
const LEGACY_FRONTEND_PATH = path.join(__dirname, '..', 'legacy-frontend');

app.use(express.static(CLIENT_DIST_PATH));
app.use('/legacy', express.static(LEGACY_FRONTEND_PATH));
app.use('/uploads', express.static(uploadsPath));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/api', (req, res) => {
    res.json({
        message: '🚀 Zen Tasks API is running!',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth (POST /register, POST /login)',
            tasks: '/api/tasks (GET, POST, PUT /:id, DELETE /:id)'
        }
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error.' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`\n🚀  Zen Tasks API running on http://localhost:${PORT}`);
    console.log(`📋  Endpoints:`);
    console.log(`    POST   http://localhost:${PORT}/api/auth/register`);
    console.log(`    POST   http://localhost:${PORT}/api/auth/login`);
    console.log(`    GET    http://localhost:${PORT}/api/tasks`);
    console.log(`    POST   http://localhost:${PORT}/api/tasks`);
    console.log(`    PUT    http://localhost:${PORT}/api/tasks/:id`);
    console.log(`    DELETE http://localhost:${PORT}/api/tasks/:id\n`);
});
