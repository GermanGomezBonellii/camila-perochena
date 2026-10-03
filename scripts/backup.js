const fs = require('node:fs');
const path = require('node:path');
const { db, root } = require('../lib/db');

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const target = path.join(root, 'backups', stamp);
fs.mkdirSync(target, { recursive: true });
db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
fs.copyFileSync(path.join(root, 'data', 'camila.sqlite'), path.join(target, 'camila.sqlite'));
if (fs.existsSync(path.join(root, 'uploads'))) fs.cpSync(path.join(root, 'uploads'), path.join(target, 'uploads'), { recursive: true });
console.log('Backup created at ' + target);
