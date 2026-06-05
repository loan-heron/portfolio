import express from 'express';
import { authRequired } from '../middleware/authMiddleware.js';
import { getDbPool } from '../db/mysql.js';

const router = express.Router();

async function isAdminUser(userId) {
    const db = await getDbPool();
    if (!db) return false;

    const [rows] = await db.query('SELECT email, subscription_plan FROM users WHERE id = ? LIMIT 1', [userId]);
    const user = rows[0];
    if (!user) return false;

    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
    if (adminEmail && String(user.email).toLowerCase() === adminEmail) {
        return true;
    }

    return user.subscription_plan === 'premium';
}

router.get('/', authRequired, async (req, res) => {
    try {
        const allowed = await isAdminUser(req.auth.sub);
        if (!allowed) {
            return res.status(403).json({ success: false, message: 'Accès admin requis.' });
        }

        const db = await getDbPool();
        if (!db) {
            return res.status(503).json({ success: false, message: 'MySQL non disponible.' });
        }

        const [[leadCountRow]] = await db.query('SELECT COUNT(*) AS total FROM contact_messages');
        const [[userCountRow]] = await db.query('SELECT COUNT(*) AS total FROM users WHERE is_active = 1');
        const [[premiumCountRow]] = await db.query("SELECT COUNT(*) AS total FROM users WHERE is_active = 1 AND subscription_plan = 'premium'");
        const [[eventCountRow]] = await db.query('SELECT COUNT(*) AS total FROM analytics_events');

        const [latestLeads] = await db.query(
            `SELECT id, name, email, status, created_at
             FROM contact_messages
             ORDER BY created_at DESC
             LIMIT 10`
        );

        const [topEvents] = await db.query(
            `SELECT event_name, COUNT(*) AS total
             FROM analytics_events
             GROUP BY event_name
             ORDER BY total DESC
             LIMIT 10`
        );

        return res.json({
            success: true,
            data: {
                stats: {
                    leads: Number(leadCountRow?.total || 0),
                    users: Number(userCountRow?.total || 0),
                    premiumUsers: Number(premiumCountRow?.total || 0),
                    analyticsEvents: Number(eventCountRow?.total || 0)
                },
                latestLeads,
                topEvents
            }
        });
    } catch {
        return res.status(500).json({ success: false, message: 'Dashboard indisponible.' });
    }
});

export default router;
