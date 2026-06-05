import express from 'express';
import nodemailer from 'nodemailer';
import { getDbPool } from '../db/mysql.js';

const router = express.Router();
const CONTACT_RECEIVER = process.env.CONTACT_RECEIVER || 'heronloan@gmail.com';

function createTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    if (!host || !user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
            user,
            pass
        }
    });
}

// ===== POST contact form =====
router.post('/', async (req, res) => {
    const rawName = req.body?.name;
    const rawEmail = req.body?.email;
    const rawMessage = req.body?.message;

    const name = typeof rawName === 'string' ? rawName.trim() : '';
    const email = typeof rawEmail === 'string' ? rawEmail.trim() : '';
    const message = typeof rawMessage === 'string' ? rawMessage.trim() : '';

    // Validation basique
    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            message: 'Merci de renseigner ton nom, ton email et ton message avant l’envoi.'
        });
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'L’adresse email semble invalide. Vérifie-la puis réessaie.'
        });
    }

    if (name.length > 120 || email.length > 254 || message.length > 5000) {
        return res.status(400).json({
            success: false,
            message: 'Ton message est un peu trop long. Essaie de le raccourcir pour pouvoir l’envoyer.'
        });
    }

    const transporter = createTransporter();
    if (!transporter) {
        console.error('❌ SMTP non configuré: définir SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
        return res.status(500).json({
            success: false,
            message: 'Le formulaire est bien reçu, mais l’envoi email n’est pas encore configuré sur le serveur.'
        });
    }

    const subject = `Nouveau message portfolio - ${name}`;
    const text = [
        `Nouveau message reçu depuis le formulaire de contact.`,
        '',
        `Nom: ${name}`,
        `Email: ${email}`,
        '',
        'Message:',
        message
    ].join('\n');

    const html = `
        <h2>Nouveau message depuis le portfolio</h2>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
    `;

    try {
        const db = await getDbPool();
        if (db) {
            await db.query(
                'INSERT INTO contact_messages (name, email, message, status) VALUES (?, ?, ?, \"new\")',
                [name, email, message]
            );
        }

        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: CONTACT_RECEIVER,
            replyTo: email,
            subject,
            text,
            html
        });

        console.log(`📧 Email envoyé vers ${CONTACT_RECEIVER} depuis ${name} (${email})`);
    } catch (error) {
        console.error('❌ Erreur envoi email:', error.message);
        return res.status(502).json({
            success: false,
            message: 'L’envoi du message a échoué pour le moment. Réessaie dans quelques minutes.'
        });
    }

    res.json({
        success: true,
        message: 'Merci pour ton message. Je te répondrai dès que possible.',
        data: {
            name,
            email,
            timestamp: new Date()
        }
    });
});

export default router;
