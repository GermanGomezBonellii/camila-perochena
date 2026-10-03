const { argon2, randomBytes, timingSafeEqual, createHash, createHmac, createCipheriv, createDecipheriv } = require('node:crypto');
const SESSION_DAYS = 7;
const randomToken = (bytes = 32) => randomBytes(bytes).toString('base64url');
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const tokenHash = (value) => createHmac('sha256', process.env.SESSION_SECRET || 'development-only-session-key').update(value).digest('hex');
const safeEqual = (a, b) => { const x = Buffer.from(String(a)); const y = Buffer.from(String(b)); return x.length === y.length && timingSafeEqual(x, y); };
const ipHash = (req) => sha256(req.ip || req.socket.remoteAddress || 'unknown');
const sessionExpiry = () => new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
const cookieOptions = (production) => ({ httpOnly: true, secure: production, sameSite: 'strict', path: '/', maxAge: SESSION_DAYS * 864e5 });
const argon2id = (message, nonce) => new Promise((resolve, reject) => argon2('argon2id', { message, nonce, memory: 19456, parallelism: 1, passes: 2, tagLength: 32 }, (error, result) => error ? reject(error) : resolve(result)));
async function passwordRecord(password) { const salt = randomBytes(16); const hash = await argon2id(Buffer.from(password), salt); return JSON.stringify({ salt: salt.toString('base64url'), hash: Buffer.from(hash).toString('base64url') }); }
async function checkPassword(password, record) { try { const p = JSON.parse(record); const result = await argon2id(Buffer.from(password), Buffer.from(p.salt, 'base64url')); return safeEqual(Buffer.from(result).toString('base64url'), p.hash); } catch { return false; } }
function encryptionKey() { const raw = process.env.TOTP_ENCRYPTION_KEY; if (!raw) return null; const key = Buffer.from(raw, 'base64url'); if (key.length !== 32) throw new Error('TOTP_ENCRYPTION_KEY must be a base64url-encoded 32-byte key.'); return key; }
function encryptSecret(secret) { const key = encryptionKey(); if (!key) return 'dev:' + secret; const nonce = randomBytes(12); const cipher = createCipheriv('aes-256-gcm', key, nonce); const ciphertext = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]); return ['v1', nonce.toString('base64url'), cipher.getAuthTag().toString('base64url'), ciphertext.toString('base64url')].join('.'); }
function decryptSecret(value) { if (value.startsWith('dev:')) { if (process.env.NODE_ENV === 'production') throw new Error('Unencrypted TOTP secret is not permitted in production.'); return value.slice(4); } const [version, nonce, tag, ciphertext] = value.split('.'); if (version !== 'v1') throw new Error('Invalid encrypted TOTP secret.'); const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(nonce, 'base64url')); decipher.setAuthTag(Buffer.from(tag, 'base64url')); return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64url')), decipher.final()]).toString('utf8'); }
module.exports = { randomToken, sha256, tokenHash, safeEqual, ipHash, sessionExpiry, cookieOptions, passwordRecord, checkPassword, encryptSecret, decryptSecret, encryptionKey };
