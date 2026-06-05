import fs from 'fs';
import path from 'path';

const root = path.resolve(process.cwd());

const requiredFiles = [
    'backend/server.js',
    'backend/routes/chatbot.js',
    'backend/routes/contact.js',
    'backend/routes/analytics.js',
    'backend/routes/dashboard.js',
    'public/pages/landing.html',
    'public/pages/chatbot.html',
    'public/pages/services.html',
    'public/pages/formations.html',
    'public/pages/audit-express.html',
    'public/pages/devis-express.html',
    'public/assets/js/site.js'
];

const missing = requiredFiles.filter((relativePath) => !fs.existsSync(path.join(root, relativePath)));

if (missing.length > 0) {
    console.error('Missing required files:\n' + missing.map((item) => `- ${item}`).join('\n'));
    process.exit(1);
}

console.log('✅ Smoke test passed: all critical files exist.');
