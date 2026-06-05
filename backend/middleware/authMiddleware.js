import jwt from 'jsonwebtoken';
import { getDbPool } from '../db/mysql.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

export function extractToken(req) {
    if (req.cookies?.auth_token) {
        return req.cookies.auth_token;
    }

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }

    return null;
}

export function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

export function authRequired(req, res, next) {
    const token = extractToken(req);
    if (!token) {
        return res.status(401).json({ success: false, message: 'Authentification requise.' });
    }

    try {
        req.auth = verifyToken(token);
        return next();
    } catch {
        return res.status(401).json({ success: false, message: 'Token invalide ou expiré.' });
    }
}

export function pageAuthRequired(req, res, next) {
    const token = extractToken(req);
    if (!token) {
        return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
    }

    try {
        req.auth = verifyToken(token);
        return next();
    } catch {
        return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}&error=session`);
    }
}

async function isPremiumUser(userId) {
    const db = await getDbPool();
    if (!db) return false;

    const [rows] = await db.query(
        'SELECT subscription_plan FROM users WHERE id = ? AND is_active = 1 LIMIT 1',
        [userId]
    );

    if (rows.length === 0) return false;
    return rows[0].subscription_plan === 'premium';
}

export async function premiumApiRequired(req, res, next) {
    if (!req.auth?.sub) {
        return res.status(401).json({ success: false, message: 'Authentification requise.' });
    }

    try {
        const allowed = await isPremiumUser(req.auth.sub);
        if (!allowed) {
            return res.status(403).json({ success: false, message: 'Accès premium requis.' });
        }

        return next();
    } catch {
        return res.status(500).json({ success: false, message: 'Impossible de vérifier l’accès premium.' });
    }
}

export async function premiumPageRequired(req, res, next) {
    const token = extractToken(req);
    if (!token) {
        return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
    }

    try {
        const payload = verifyToken(token);
        const allowed = await isPremiumUser(payload.sub);

        if (!allowed) {
            return res.redirect('/formations?error=premium_required');
        }

        req.auth = payload;
        return next();
    } catch {
        return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}&error=session`);
    }
}

export async function premiumAssetRequired(req, res, next) {
    const token = extractToken(req);
    if (!token) {
        return res.status(403).type('text/plain').send('Accès premium requis.');
    }

    try {
        const payload = verifyToken(token);
        const allowed = await isPremiumUser(payload.sub);

        if (!allowed) {
            return res.status(403).type('text/plain').send('Accès premium requis.');
        }

        req.auth = payload;
        return next();
    } catch {
        return res.status(401).type('text/plain').send('Session invalide.');
    }
}
