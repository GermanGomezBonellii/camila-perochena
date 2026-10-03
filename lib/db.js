const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data');
fs.mkdirSync(dataDir, { recursive: true });
const databasePath = process.env.DATABASE_PATH || path.join(dataDir, 'camila.sqlite');
fs.mkdirSync(path.dirname(databasePath), { recursive: true });
const db = new DatabaseSync(databasePath);
db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
db.exec(`
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE COLLATE NOCASE, password_hash TEXT NOT NULL, totp_secret TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, csrf_token TEXT NOT NULL, expires_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS login_attempts (id INTEGER PRIMARY KEY, email_hash TEXT NOT NULL, ip_hash TEXT NOT NULL, successful INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY, title TEXT NOT NULL, year INTEGER NOT NULL CHECK(year BETWEEN 1800 AND 2200), publisher TEXT NOT NULL, description_es TEXT NOT NULL DEFAULT '', description_en TEXT NOT NULL DEFAULT '', cover_path TEXT, external_url TEXT, published INTEGER NOT NULL DEFAULT 0, featured_home INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS media_videos (id INTEGER PRIMARY KEY, youtube_id TEXT NOT NULL UNIQUE, title TEXT NOT NULL, published_at TEXT, thumbnail TEXT, url TEXT NOT NULL, program TEXT NOT NULL DEFAULT 'Odisea Argentina', published INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS news (id INTEGER PRIMARY KEY, type TEXT NOT NULL CHECK(type IN ('book','conference','award','media','other')), title_es TEXT NOT NULL, title_en TEXT NOT NULL DEFAULT '', description_es TEXT NOT NULL DEFAULT '', description_en TEXT NOT NULL DEFAULT '', event_date TEXT NOT NULL, image_path TEXT, external_url TEXT, published INTEGER NOT NULL DEFAULT 0, featured_home INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS audit_log (id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, action TEXT NOT NULL, entity_type TEXT, entity_id INTEGER, ip_hash TEXT, details TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at); CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
`);
// Forward-compatible migration for installations created before visual ordering was added.
try { db.exec('ALTER TABLE news ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0'); } catch (error) { if (!/duplicate column name/i.test(error.message)) throw error; }
function q(sql) { return db.prepare(sql); }
function audit({ userId = null, action, entityType = null, entityId = null, ipHash = null, details = null }) { q('INSERT INTO audit_log(user_id,action,entity_type,entity_id,ip_hash,details) VALUES(?,?,?,?,?,?)').run(userId, action, entityType, entityId, ipHash, details ? JSON.stringify(details) : null); }
module.exports = { db, q, audit, root };
