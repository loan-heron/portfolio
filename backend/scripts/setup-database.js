import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { initializeMysql, getDbPool, isMysqlEnabled } from '../db/mysql.js';

dotenv.config();

const DEMO_NAME = process.env.DEMO_USER_NAME || 'Demo User';
const DEMO_EMAIL = (process.env.DEMO_USER_EMAIL || 'demo@localhost.dev').toLowerCase();
const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || 'TestPass123!';

async function upsertDemoUser(db) {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

    await db.query(
        `INSERT INTO users (name, email, password_hash, is_active)
         VALUES (?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE
             name = VALUES(name),
             password_hash = VALUES(password_hash),
             is_active = VALUES(is_active)`,
        [DEMO_NAME, DEMO_EMAIL, passwordHash]
    );
}

async function printSummary(db) {
    const [users] = await db.query(
        `SELECT id, name, email, is_active
         FROM users
         ORDER BY id ASC`
    );

    console.log('\n=== Comptes disponibles ===');
    users.forEach((user) => {
        console.log(`#${user.id} | ${user.email} | active=${user.is_active ? 'yes' : 'no'}`);
    });

    console.log(`\nCompte demo: ${DEMO_EMAIL}`);
    console.log(`Mot de passe demo: ${DEMO_PASSWORD}`);
}

async function main() {
    if (!isMysqlEnabled()) {
        console.error('MYSQL_ENABLED=false: active MySQL dans .env pour exécuter le setup.');
        process.exit(1);
    }

    await initializeMysql();
    const db = await getDbPool();
    if (!db) {
        console.error('MySQL indisponible.');
        process.exit(1);
    }

    await upsertDemoUser(db);
    await printSummary(db);

    await db.end();
    console.log('\n✅ Setup base terminé (schéma + compte demo).');
}

main().catch((error) => {
    console.error('❌ setup-database error:', error.message);
    process.exit(1);
});
