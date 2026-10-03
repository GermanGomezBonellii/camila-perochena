const readline = require('node:readline/promises');
const { stdin: input, stdout: output } = require('node:process');
const { generateSecret, generateURI } = require('otplib');
const { q } = require('../lib/db');
const { passwordRecord, encryptSecret } = require('../lib/security');
const ADMIN_EMAILS = ['germangomezbonelli2@gmail.com', 'camipero@gmail.com'];
(async () => { const rl = readline.createInterface({ input, output }); for (const email of ADMIN_EMAILS) { if (q('SELECT id FROM users WHERE email=?').get(email)) { console.log(email + ': ya existe; se conserva sin cambios.'); continue; } const password = await rl.question('Contraseña para ' + email + ' (mínimo 14 caracteres): '); if (password.length < 14) throw new Error('Cada contraseña debe tener al menos 14 caracteres.'); const secret = generateSecret(); q('INSERT INTO users(email,password_hash,totp_secret) VALUES(?,?,?)').run(email, await passwordRecord(password), encryptSecret(secret)); console.log('\nConfigurá el segundo factor para ' + email + ' con esta URI:\n' + generateURI({ issuer: 'Camila Perochena', label: email, secret }) + '\nGuardá los códigos de recuperación de tu aplicación TOTP.\n'); } await rl.close(); })().catch(e => { console.error(e.message); process.exit(1); });
