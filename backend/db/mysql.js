import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

let pool = null;

function mysqlConfig() {
    return {
        host: process.env.MYSQL_HOST || '127.0.0.1',
        port: Number(process.env.MYSQL_PORT || 3306),
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'portfolio',
        waitForConnections: true,
        connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
        queueLimit: 0
    };
}

function mysqlServerConfig() {
    return {
        host: process.env.MYSQL_HOST || '127.0.0.1',
        port: Number(process.env.MYSQL_PORT || 3306),
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || ''
    };
}

async function ensureDatabaseExists() {
    const database = process.env.MYSQL_DATABASE || 'portfolio';
    const connection = await mysql.createConnection(mysqlServerConfig());
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.end();
}

export function isMysqlEnabled() {
    return process.env.MYSQL_ENABLED !== 'false';
}

export async function getDbPool() {
    if (!isMysqlEnabled()) {
        return null;
    }

    if (!pool) {
        await ensureDatabaseExists();
        pool = mysql.createPool(mysqlConfig());
    }

    return pool;
}

async function createSchema() {
    const db = await getDbPool();
    if (!db) return;
    const database = process.env.MYSQL_DATABASE || 'portfolio';

    await db.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            email VARCHAR(190) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            subscription_plan ENUM('standard','premium') NOT NULL DEFAULT 'standard',
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    `);

    const [subscriptionCol] = await db.query(
        `SELECT COLUMN_NAME
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ?
           AND TABLE_NAME = 'users'
           AND COLUMN_NAME = 'subscription_plan'
         LIMIT 1`,
        [database]
    );

    if (subscriptionCol.length === 0) {
        await db.query("ALTER TABLE users ADD COLUMN subscription_plan ENUM('standard','premium') NOT NULL DEFAULT 'standard' AFTER password_hash");
    }

    const [legacyAccountTypeCol] = await db.query(
        `SELECT COLUMN_NAME
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ?
           AND TABLE_NAME = 'users'
           AND COLUMN_NAME = 'account_type'
         LIMIT 1`,
        [database]
    );

    if (legacyAccountTypeCol.length > 0) {
        await db.query(
            `UPDATE users
             SET subscription_plan = 'premium'
             WHERE account_type IN ('premium', 'admin')`
        );
    }

    await db.query(`
        CREATE TABLE IF NOT EXISTS service_prices (
            service_id VARCHAR(80) PRIMARY KEY,
            price_from INT NOT NULL,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS formation_prices (
            formation_id VARCHAR(80) PRIMARY KEY,
            price INT NOT NULL,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            email VARCHAR(190) NOT NULL,
            message TEXT NOT NULL,
            status ENUM('new','read','archived') NOT NULL DEFAULT 'new',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS analytics_events (
            id INT AUTO_INCREMENT PRIMARY KEY,
            event_name VARCHAR(80) NOT NULL,
            event_path VARCHAR(190) NULL,
            event_meta JSON NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_event_name (event_name),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB;
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS academy_user_progress (
            user_id INT PRIMARY KEY,
            current_module VARCHAR(80) NOT NULL DEFAULT 'foundations',
            completed_modules LONGTEXT NOT NULL,
            validated_exercises LONGTEXT NOT NULL,
            completed_projects LONGTEXT NOT NULL,
            game_completed LONGTEXT NOT NULL,
            weekly_scores LONGTEXT NOT NULL,
            score INT NOT NULL DEFAULT 0,
            boss_streak INT NOT NULL DEFAULT 0,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS academy_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    `);
}

async function ensureAdminUser() {
    const db = await getDbPool();
    if (!db) return;

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@localhost.dev').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeThisPassword123!';
    const adminName = process.env.ADMIN_NAME || 'Admin Local';

    const [existing] = await db.query('SELECT id FROM users WHERE email = ? LIMIT 1', [adminEmail]);
    if (existing.length > 0) return;

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await db.query(
        "INSERT INTO users (name, email, password_hash, subscription_plan, is_active) VALUES (?, ?, ?, 'premium', 1)",
        [adminName, adminEmail, passwordHash]
    );
}

export async function initializeMysql() {
    if (!isMysqlEnabled()) {
        console.log('ℹ️ MySQL désactivé via MYSQL_ENABLED=false');
        return;
    }

    try {
        const db = await getDbPool();
        await db.query('SELECT 1');
        await createSchema();
        await ensureAdminUser();
        console.log('✅ MySQL connecté et schéma prêt');
    } catch (error) {
        console.error('❌ Erreur MySQL:', error.message);
        console.log('⚠️ Le serveur continue, mais les fonctionnalités de connexion nécessitent MySQL actif.');
    }
}
