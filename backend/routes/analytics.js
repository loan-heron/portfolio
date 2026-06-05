import express from 'express';
import { getDbPool } from '../db/mysql.js';

const router = express.Router();

const inMemoryEvents = [];
const MAX_EVENTS = 2000;

function normalizeEventName(value) {
    if (typeof value !== 'string') return '';
    return value.trim().slice(0, 80);
}

function normalizeMeta(value) {
    if (!value || typeof value !== 'object') {
        return {};
    }

    const safeEntries = Object.entries(value)
        .slice(0, 12)
        .map(([key, raw]) => [String(key).slice(0, 40), String(raw).slice(0, 120)]);

    return Object.fromEntries(safeEntries);
}

router.post('/event', async (req, res) => {
    const eventName = normalizeEventName(req.body?.eventName);
    const meta = normalizeMeta(req.body?.meta);

    if (!eventName) {
        return res.status(400).json({ success: false, message: 'eventName requis.' });
    }

    const event = {
        eventName,
        meta,
        path: typeof req.body?.path === 'string' ? req.body.path.slice(0, 180) : req.path,
        createdAt: new Date().toISOString()
    };

    inMemoryEvents.push(event);
    if (inMemoryEvents.length > MAX_EVENTS) {
        inMemoryEvents.splice(0, inMemoryEvents.length - MAX_EVENTS);
    }

    try {
        const db = await getDbPool();
        if (db) {
            await db.query(
                `INSERT INTO analytics_events (event_name, event_path, event_meta)
                 VALUES (?, ?, ?)`,
                [event.eventName, event.path, JSON.stringify(event.meta)]
            );
        }
    } catch (error) {
        console.error('analytics save error:', error.message);
    }

    return res.json({ success: true });
});

router.get('/trust', async (req, res) => {
    const recent = inMemoryEvents.slice(-500);
    const ctaClicks = recent.filter((event) => event.eventName === 'cta_click').length;
    const chatbotOpens = recent.filter((event) => event.eventName === 'chatbot_open').length;
    const loginConversions = recent.filter((event) => event.eventName === 'login_success').length;

    let leadsCount = 0;
    try {
        const db = await getDbPool();
        if (db) {
            const [rows] = await db.query('SELECT COUNT(*) AS total FROM contact_messages');
            leadsCount = Number(rows[0]?.total || 0);
        }
    } catch {}

    return res.json({
        success: true,
        data: {
            responseHours: Number(process.env.TRUST_RESPONSE_HOURS || 24),
            projectsDelivered: Number(process.env.TRUST_PROJECTS_COUNT || 24),
            ctaClicks,
            chatbotOpens,
            loginConversions,
            leadsCount,
            updatedAt: new Date().toISOString()
        }
    });
});

export default router;
