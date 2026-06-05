import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDbPool } from '../db/mysql.js';
import { authRequired } from '../middleware/authMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

function normalizeEmail(value) {
    return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function normalizeName(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function authCookieOptions() {
    return {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 12
    };
}

function authClearCookieOptions() {
    return {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    };
}

function signToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            name: user.name
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

function publicUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        subscriptionPlan: user.subscription_plan
    };
}

router.post('/register', async (req, res) => {
    try {
        const db = await getDbPool();
        if (!db) {
            return res.status(503).json({ success: false, message: 'MySQL non disponible.' });
        }

        const name = normalizeName(req.body?.name);
        const email = normalizeEmail(req.body?.email);
        const password = typeof req.body?.password === 'string' ? req.body.password : '';

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Nom, email et mot de passe requis.' });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Mot de passe trop court (min 8 caractères).' });
        }

        const [existing] = await db.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Un compte existe déjà avec cet email.' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const [result] = await db.query(
            "INSERT INTO users (name, email, password_hash, subscription_plan, is_active) VALUES (?, ?, ?, 'standard', 1)",
            [name, email, passwordHash]
        );

        const [rows] = await db.query('SELECT id, name, email, subscription_plan FROM users WHERE id = ? LIMIT 1', [result.insertId]);
        const user = rows[0];
        const token = signToken(user);

        res.cookie('auth_token', token, authCookieOptions());

        return res.status(201).json({
            success: true,
            message: 'Compte créé avec succès.',
            data: {
                user: publicUser(user)
            }
        });
    } catch {
        return res.status(500).json({ success: false, message: 'Impossible de créer le compte.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const db = await getDbPool();
        if (!db) {
            return res.status(503).json({ success: false, message: 'MySQL non disponible.' });
        }

        const email = normalizeEmail(req.body?.email);
        const password = typeof req.body?.password === 'string' ? req.body.password : '';

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email et mot de passe requis.' });
        }

        const [rows] = await db.query(
            'SELECT id, name, email, subscription_plan, password_hash, is_active FROM users WHERE email = ? LIMIT 1',
            [email]
        );

        const user = rows[0];
        if (!user || !user.is_active) {
            return res.status(401).json({ success: false, message: 'Identifiants invalides.' });
        }

        const passwordOk = await bcrypt.compare(password, user.password_hash);
        if (!passwordOk) {
            return res.status(401).json({ success: false, message: 'Identifiants invalides.' });
        }

        const token = signToken(user);
        res.cookie('auth_token', token, authCookieOptions());

        return res.json({
            success: true,
            message: 'Connexion réussie.',
            data: {
                user: publicUser(user)
            }
        });
    } catch {
        return res.status(500).json({ success: false, message: 'Impossible de se connecter.' });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('auth_token', authClearCookieOptions());
    return res.json({ success: true, message: 'Déconnexion réussie.' });
});

router.get('/me', authRequired, async (req, res) => {
    try {
        const db = await getDbPool();
        if (!db) {
            return res.status(503).json({ success: false, message: 'MySQL non disponible.' });
        }

        const [rows] = await db.query('SELECT id, name, email, subscription_plan FROM users WHERE id = ? LIMIT 1', [req.auth.sub]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
        }

        return res.json({
            success: true,
            data: publicUser(rows[0])
        });
    } catch {
        return res.status(500).json({ success: false, message: 'Impossible de récupérer le profil.' });
    }
});

router.put('/me', authRequired, async (req, res) => {
    try {
        const db = await getDbPool();
        if (!db) {
            return res.status(503).json({ success: false, message: 'MySQL non disponible.' });
        }

        const name = normalizeName(req.body?.name);
        const email = normalizeEmail(req.body?.email);

        if (!name || !email) {
            return res.status(400).json({ success: false, message: 'Nom et email requis.' });
        }

        const [existing] = await db.query('SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1', [email, req.auth.sub]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé.' });
        }

        await db.query('UPDATE users SET name = ?, email = ? WHERE id = ? LIMIT 1', [name, email, req.auth.sub]);

        const [rows] = await db.query('SELECT id, name, email, subscription_plan FROM users WHERE id = ? LIMIT 1', [req.auth.sub]);
        const user = rows[0];

        const token = signToken(user);
        res.cookie('auth_token', token, authCookieOptions());

        return res.json({
            success: true,
            message: 'Profil mis à jour.',
            data: {
                user: publicUser(user)
            }
        });
    } catch {
        return res.status(500).json({ success: false, message: 'Impossible de mettre à jour le profil.' });
    }
});

router.put('/me/password', authRequired, async (req, res) => {
    try {
        const db = await getDbPool();
        if (!db) {
            return res.status(503).json({ success: false, message: 'MySQL non disponible.' });
        }

        const currentPassword = typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
        const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';
        const confirmPassword = typeof req.body?.confirmPassword === 'string' ? req.body.confirmPassword : '';

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'Tous les champs sont requis.' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'La confirmation ne correspond pas.' });
        }

        const [rows] = await db.query('SELECT id, password_hash FROM users WHERE id = ? LIMIT 1', [req.auth.sub]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
        }

        const passwordOk = await bcrypt.compare(currentPassword, rows[0].password_hash);
        if (!passwordOk) {
            return res.status(401).json({ success: false, message: 'Mot de passe actuel incorrect.' });
        }

        const newHash = await bcrypt.hash(newPassword, 12);
        await db.query('UPDATE users SET password_hash = ? WHERE id = ? LIMIT 1', [newHash, req.auth.sub]);

        return res.json({ success: true, message: 'Mot de passe mis à jour.' });
    } catch {
        return res.status(500).json({ success: false, message: 'Impossible de mettre à jour le mot de passe.' });
    }
});

export default router;
