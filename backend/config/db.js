// config/db.js
const mongoose = require('mongoose');

// ── Admin DB (back office) ───────────────────────────────────
const adminDB = mongoose.createConnection(process.env.ADMIN_DB_URI);

adminDB.on('connected', () => console.log('✅ Admin DB connected'));
adminDB.on('error', (err) => console.error('❌ Admin DB error:', err.message));

// ── Web DB (website users) ───────────────────────────────────
const webDB = mongoose.createConnection(process.env.WEB_DB_URI);

webDB.on('connected', () => console.log('✅ Web DB connected'));
webDB.on('error', (err) => console.error('❌ Web DB error:', err.message));

module.exports = { adminDB, webDB };