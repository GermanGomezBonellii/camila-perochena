const { generateSecret, generateURI } = require('otplib');
const { q, audit } = require('../lib/db');
const { encryptSecret } = require('../lib/security');

const email = String(process.argv[2] || '').trim().toLowerCase();
const allowedEmail = 'camipero@gmail.com';
if (email !== allowedEmail) {
  console.error('Usage: npm run reset-totp -- camipero@gmail.com');
  process.exit(1);
}

const user = q('SELECT id,email FROM users WHERE email=? AND active=1').get(email);
if (!user) {
  console.error('The administrator account does not exist or is inactive. No changes were made.');
  process.exit(1);
}

const secret = generateSecret();
q('UPDATE users SET totp_secret=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(encryptSecret(secret), user.id);
audit({ userId: user.id, action: 'totp_reset_cli', entityType: 'user', entityId: user.id, details: { email: user.email } });
console.log('\nTOTP reset completed for ' + user.email + '.\n');
console.log('Scan this URI with the authenticator app:\n' + generateURI({ issuer: 'Camila Perochena', label: user.email, secret }) + '\n');
console.log('The password and all other account data were left unchanged. The previous TOTP code no longer works.');
