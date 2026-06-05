import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import portfolioRoutes from './routes/portfolio.js';
import contactRoutes from './routes/contact.js';
import authRoutes from './routes/auth.js';
import analyticsRoutes from './routes/analytics.js';
import dashboardRoutes from './routes/dashboard.js';
import { initializeMysql } from './db/mysql.js';
import { pageAuthRequired, premiumAssetRequired, premiumPageRequired } from './middleware/authMiddleware.js';
import { antiAbuseMiddleware, createRateLimiter } from './middleware/securityMiddleware.js';

dotenv.config();
await initializeMysql();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const forceHttps = process.env.FORCE_HTTPS !== 'false';

// ===== Middleware =====
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use((req, res, next) => {
    if (isProduction && forceHttps) {
        const forwardedProto = req.get('x-forwarded-proto');
        if (!req.secure && forwardedProto !== 'https') {
            return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
        }
    }

    if (isProduction) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
    );

    next();
});

const configuredOrigins = (process.env.CORS_ORIGIN || '').split(',').map((origin) => origin.trim()).filter(Boolean);
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (configuredOrigins.length === 0 || configuredOrigins.includes('*')) {
            return callback(null, true);
        }
        if (configuredOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('CORS origin non autorisée'));
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const authLimiter = createRateLimiter({ keyPrefix: 'auth', windowMs: 60_000, limit: 20 });
const contactLimiter = createRateLimiter({ keyPrefix: 'contact', windowMs: 60_000, limit: 12 });
const analyticsLimiter = createRateLimiter({ keyPrefix: 'analytics', windowMs: 60_000, limit: 120 });

app.get('/assets/js/cyber-academy.js', premiumAssetRequired, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/assets/js/cyber-academy.js'));
});

app.get('/assets/css/cyber-academy.css', premiumAssetRequired, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/assets/css/cyber-academy.css'));
});

app.get('/pages/cyber-academy.html', premiumPageRequired, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/cyber-academy.html'));
});

app.use(express.static(path.join(__dirname, '../public')));
app.use('/vendor/bootstrap', express.static(path.join(__dirname, '../node_modules/bootstrap/dist')));

// ===== Routes API =====
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/contact', contactLimiter, antiAbuseMiddleware, contactRoutes);
app.use('/api/auth', authLimiter, antiAbuseMiddleware, authRoutes);
app.use('/api/analytics', analyticsLimiter, analyticsRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/metrics', analyticsRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/portfolio.html'));
});

app.get('/home', (req, res) => {
    res.redirect('/');
});

app.get('/portfolio', (req, res) => {
    res.redirect('/');
});

app.get('/services', (req, res) => {
    res.redirect('/');
});

app.get('/formations', (req, res) => {
    res.redirect('/');
});

app.get('/chatbot', (req, res) => {
    res.redirect('/');
});

app.get('/audit-express', (req, res) => {
    res.redirect('/');
});

app.get('/devis-express', (req, res) => {
    res.redirect('/');
});

app.get('/cas-client/site-vitrine', (req, res) => {
    res.redirect('/');
});

app.get('/cas-client/discord-automation', (req, res) => {
    res.redirect('/');
});

app.get('/cas-client/cyber-upgrade', (req, res) => {
    res.redirect('/');
});

app.get('/formations/cybersecurite', (req, res) => {
    res.redirect('/');
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/login.html'));
});

app.get('/profile', pageAuthRequired, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/profile.html'));
});

app.get('/contact', (req, res) => {
    res.redirect('/portfolio#contact');
});

app.get('/about', (req, res) => {
    res.redirect('/portfolio#about');
});

app.get('/projects', (req, res) => {
    res.redirect('/portfolio#projects');
});

app.get('/skills', (req, res) => {
    res.redirect('/portfolio#skills');
});

app.get('/experience', (req, res) => {
    res.redirect('/portfolio#experience');
});

// ===== Error Handling =====
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Une erreur est survenue',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ===== 404 Handler =====
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée'
    });
});

// ===== Server Start =====
app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
    console.log(`📁 Public files: http://localhost:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
});
