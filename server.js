const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');
const { generateSecret, verify } = require('otplib');
const { db, q, audit, root } = require('./lib/db');
const { randomToken, sha256, tokenHash, safeEqual, ipHash, sessionExpiry, cookieOptions, checkPassword, decryptSecret, encryptionKey } = require('./lib/security');

const production = process.env.NODE_ENV === 'production';
const uploadsDir = process.env.UPLOADS_DIR || path.join(root, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
if (production && (!process.env.SESSION_SECRET || !encryptionKey())) throw new Error('SESSION_SECRET and TOTP_ENCRYPTION_KEY are required in production.');
const app = express();
if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], imgSrc: ["'self'", 'https://i.ytimg.com', 'data:'], styleSrc: ["'self'", 'https://fonts.googleapis.com'], fontSrc: ["'self'", 'https://fonts.gstatic.com'], scriptSrc: ["'self'"], frameSrc: ['https://www.youtube-nocookie.com'] } }, referrerPolicy: { policy: 'strict-origin-when-cross-origin' } }));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
const publicPages = [
  ['/', 'index.html'], ['/index.html', 'index.html'],
  ['/medios', 'medios/index.html'], ['/medios/', 'medios/index.html'], ['/medios/index.html', 'medios/index.html'],
  ['/publicaciones', 'publicaciones/index.html'], ['/publicaciones/', 'publicaciones/index.html'], ['/publicaciones/index.html', 'publicaciones/index.html'],
  ['/sobre-mi', 'sobre-mi/index.html'], ['/sobre-mi/', 'sobre-mi/index.html'], ['/sobre-mi/index.html', 'sobre-mi/index.html']
];
// Register exact page routes before static directories so canonical URLs never redirect.
for (const [route, file] of publicPages) app.get(route, (req,res) => res.sendFile(path.join(root, file)));
app.use('/uploads', express.static(uploadsDir, { fallthrough: false, index: false, maxAge: '7d' }));
app.use('/admin/assets', express.static(path.join(root, 'admin'), { dotfiles: 'deny', index: false, maxAge: '1h' }));
// Deliberate allow-list: never serve the project root (which contains SQLite, backups, docs and dependencies).
for (const folder of ['css', 'js', 'img']) app.use('/' + folder, express.static(path.join(root, folder), { dotfiles: 'deny', index: false }));
app.use('/assets', express.static(path.join(root, 'assets'), { dotfiles: 'deny', index: false, maxAge: '7d' }));
app.use('/publicaciones', express.static(path.join(root, 'publicaciones'), { dotfiles: 'deny', index: false, maxAge: '7d' }));
app.get('/robots.txt', (req,res) => res.type('text/plain').send('User-agent: *\nDisallow: /admin\n'));

function parseCookies(req) { return Object.fromEntries((req.headers.cookie || '').split(';').map(x => x.trim().split('=').map(decodeURIComponent)).filter(x => x.length === 2)); }
function auth(req, res, next) { const token = parseCookies(req).cp_session; if (!token) return res.status(401).json({ error: 'Authentication required' }); const row = q('SELECT s.*, u.email FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at > CURRENT_TIMESTAMP AND u.active=1').get(tokenHash(token)); if (!row) return res.status(401).json({ error: 'Authentication required' }); req.admin = row; next(); }
function csrf(req, res, next) { if (!safeEqual(req.get('x-csrf-token') || req.body.csrf || '', req.admin.csrf_token)) return res.status(403).json({ error: 'Invalid request token' }); next(); }
const loginLimiter = rateLimit({ windowMs: 15 * 60e3, limit: 5, standardHeaders: true, legacyHeaders: false, message: { error: 'Try again later' } });
app.post('/api/auth/login', loginLimiter, async (req, res, next) => { try { const email = String(req.body.email || '').trim().toLowerCase(); const password = String(req.body.password || ''); const totp = String(req.body.totp || ''); const user = q('SELECT * FROM users WHERE email=? AND active=1').get(email); const passwordOK = user && await checkPassword(password, user.password_hash); const totpOK = passwordOK && await verify({ token: totp, secret: decryptSecret(user.totp_secret) }); q('INSERT INTO login_attempts(email_hash,ip_hash,successful) VALUES(?,?,?)').run(sha256(email), ipHash(req), totpOK ? 1 : 0); if (!totpOK) { audit({ action: 'login_failed', ipHash: ipHash(req) }); return res.status(401).json({ error: 'Invalid credentials' }); } q('DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP'); const token = randomToken(); const csrfToken = randomToken(); q('INSERT INTO sessions(token_hash,user_id,csrf_token,expires_at) VALUES(?,?,?,?)').run(tokenHash(token), user.id, csrfToken, sessionExpiry()); audit({ userId: user.id, action: 'login_success', ipHash: ipHash(req) }); res.cookie('cp_session', token, cookieOptions(production)); res.json({ csrfToken, email: user.email }); } catch (error) { next(error); } });
app.post('/api/auth/logout', auth, csrf, (req, res) => { q('DELETE FROM sessions WHERE id=?').run(req.admin.id); audit({ userId: req.admin.user_id, action: 'logout', ipHash: ipHash(req) }); res.clearCookie('cp_session', cookieOptions(production)); res.status(204).end(); });
app.get('/api/auth/me', auth, (req, res) => res.json({ email: req.admin.email, csrfToken: req.admin.csrf_token }));
const VIDEO_ORDER = 'ORDER BY CASE WHEN sort_order >= 0 THEN 0 ELSE 1 END,sort_order ASC,published_at DESC,id DESC';
function publicVideos(table, program = null) {
  const programFilter = program ? ' AND program=?' : '';
  const description = table === 'olga_videos' ? 'description' : "'' AS description";
  return q(`SELECT id,youtube_id AS youtubeId,title,published_at AS publishedAt,thumbnail,url,${description},sort_order AS sortOrder FROM ${table} WHERE published=1${programFilter} ${VIDEO_ORDER}`).all(...(program ? [program] : []));
}
app.get('/api/public/content', (req, res) => res.json({
  version: 1,
  generatedAt: new Date().toISOString(),
  odisea: publicVideos('media_videos', 'Odisea Argentina'),
  olga: publicVideos('olga_videos'),
  books: q('SELECT id,title,subtitle,year,publisher,description_es AS descriptionEs,description_en AS descriptionEn,cover_path AS coverPath,external_url AS externalUrl,featured_home AS featuredHome,sort_order AS sortOrder FROM books WHERE published=1 ORDER BY CASE WHEN sort_order >= 0 THEN 0 ELSE 1 END,sort_order ASC,id DESC').all(),
  news: q('SELECT id,type,title_es AS titleEs,title_en AS titleEn,description_es AS descriptionEs,description_en AS descriptionEn,event_date AS eventDate,image_path AS imagePath,external_url AS externalUrl,featured_home AS featuredHome,sort_order AS sortOrder FROM news WHERE published=1 ORDER BY CASE WHEN sort_order >= 0 THEN 0 ELSE 1 END,sort_order ASC,event_date DESC,id DESC').all(),
  featured: {
    books: q('SELECT id,title,subtitle,year,publisher,description_es AS descriptionEs,description_en AS descriptionEn,cover_path AS coverPath,external_url AS externalUrl,sort_order AS sortOrder FROM books WHERE published=1 AND featured_home=1 ORDER BY CASE WHEN sort_order >= 0 THEN 0 ELSE 1 END,sort_order ASC,id DESC').all(),
    news: q('SELECT id,type,title_es AS titleEs,title_en AS titleEn,description_es AS descriptionEs,description_en AS descriptionEn,event_date AS eventDate,image_path AS imagePath,external_url AS externalUrl,sort_order AS sortOrder FROM news WHERE published=1 AND featured_home=1 ORDER BY CASE WHEN sort_order >= 0 THEN 0 ELSE 1 END,sort_order ASC,event_date DESC,id DESC').all()
  }
}));

const tables = {
  books: ['title', 'subtitle', 'year', 'publisher', 'description_es', 'description_en', 'cover_path', 'external_url', 'published', 'featured_home', 'sort_order'],
  videos: ['youtube_id', 'title', 'published_at', 'thumbnail', 'url', 'published', 'sort_order'],
  olga: ['youtube_id', 'title', 'published_at', 'thumbnail', 'url', 'description', 'published', 'sort_order'],
  news: ['type', 'title_es', 'title_en', 'description_es', 'description_en', 'event_date', 'image_path', 'external_url', 'published', 'featured_home', 'sort_order']
};
const tableName = { books: 'books', videos: 'media_videos', olga: 'olga_videos', news: 'news' };
function isVideoType(type) { return type === 'videos' || type === 'olga'; }
function clean(type, body) {
  const out = {};
  for (const field of tables[type]) {
    if (field in body) out[field] = ['published', 'featured_home', 'year', 'sort_order'].includes(field) ? Number(body[field]) : String(body[field] ?? '').trim();
  }
  return out;
}
function validUrl(value) {
  if (!value) return true;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}
function validUpload(value) { return !value || /^\/uploads\/[A-Za-z0-9_-]{20,}\.webp$/.test(value); }
function youtubeId(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    let id = null;
    if (host === 'youtu.be') id = url.pathname.split('/').filter(Boolean)[0];
    if (host === 'youtube.com' || host.endsWith('.youtube.com')) id = url.searchParams.get('v') || (/^\/(?:shorts|embed|live)\/([\w-]{11})/.exec(url.pathname) || [])[1];
    return /^[\w-]{11}$/.test(id || '') ? id : null;
  } catch { return /^[\w-]{11}$/.test(value || '') ? value : null; }
}
function validYouTubeThumbnail(value, id) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'i.ytimg.com' && url.pathname.startsWith('/vi/' + id + '/');
  } catch { return false; }
}
function prepareVideo(data, body) {
  const id = youtubeId(data.youtube_id || body.youtube_url || data.url);
  if (!id) return false;
  data.youtube_id = id;
  data.url = `https://www.youtube.com/watch?v=${id}`;
  if (!validYouTubeThumbnail(data.thumbnail, id)) data.thumbnail = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  return true;
}
function insertContent(type, data) {
  const table = tableName[type];
  let fields;
  let result;
  if (isVideoType(type) && !Object.hasOwn(data, 'sort_order')) {
    db.exec('BEGIN');
    try {
      q(`UPDATE ${table} SET sort_order=sort_order+1,updated_at=CURRENT_TIMESTAMP WHERE sort_order>=0`).run();
      data.sort_order = 0;
      fields = Object.keys(data);
      result = q(`INSERT INTO ${table}(${fields.join(',')}) VALUES(${fields.map(() => '?').join(',')})`).run(...fields.map(field => data[field]));
      db.exec('COMMIT');
      return result;
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }
  fields = Object.keys(data);
  return q(`INSERT INTO ${table}(${fields.join(',')}) VALUES(${fields.map(() => '?').join(',')})`).run(...fields.map(field => data[field]));
}
function itemId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
function validDate(value) { return !value || /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?Z)?$/.test(value); }
function validateItem(type, data) {
  if (type === 'books' && (!data.title || !Number.isInteger(Number(data.year)) || !data.publisher)) return 'Title, year and publisher are required.';
  if (type === 'news' && (!data.title_es || !['book', 'conference', 'award', 'media', 'other'].includes(data.type) || !/^\d{4}-\d{2}-\d{2}$/.test(data.event_date || ''))) return 'Type, Spanish title and date are required.';
  if (isVideoType(type) && (!youtubeId(data.youtube_id) || !data.title || !validDate(data.published_at) || !validYouTubeThumbnail(data.thumbnail, data.youtube_id))) return 'Valid YouTube details and title are required.';
  if (Object.hasOwn(data, 'sort_order') && !Number.isInteger(data.sort_order)) return 'Order must be a whole number.';
  if (!validUrl(data.external_url) || !validUrl(data.url) || !validUpload(data.cover_path) || !validUpload(data.image_path)) return 'Only valid HTTPS links and uploaded image paths are allowed.';
  return null;
}
function listRows(type) { return q(`SELECT * FROM ${tableName[type]} ORDER BY sort_order ASC,id DESC`).all(); }
function findRow(type, id) { return q(`SELECT * FROM ${tableName[type]} WHERE id=?`).get(id); }
for (const type of Object.keys(tables)) {
  const route = '/api/admin/' + type;
  app.get(route, auth, (req, res) => res.json(listRows(type)));
  app.post(route, auth, csrf, (req, res) => {
    const data = clean(type, req.body);
    if (isVideoType(type)) {
      if (!prepareVideo(data, req.body)) return res.status(400).json({ error: 'Invalid YouTube URL' });
    } else if (!Object.hasOwn(data, 'sort_order')) {
      data.sort_order = -1;
    }
    if (!data.title && !data.title_es) return res.status(400).json({ error: 'A title is required' });
    const error = validateItem(type, data);
    if (error) return res.status(400).json({ error });
    const result = insertContent(type, data);
    const id = Number(result.lastInsertRowid);
    audit({ userId: req.admin.user_id, action: 'create', entityType: type, entityId: id, ipHash: ipHash(req) });
    res.status(201).json(findRow(type, id));
  });
  app.get(route + '/:id', auth, (req, res) => {
    const id = itemId(req.params.id);
    const row = id && findRow(type, id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });
  app.patch(route + '/:id', auth, csrf, (req, res) => {
    const id = itemId(req.params.id);
    const old = id && findRow(type, id);
    if (!old) return res.status(404).json({ error: 'Not found' });
    const patch = clean(type, req.body);
    if (isVideoType(type) && (patch.youtube_id || req.body.youtube_url)) {
      if (!prepareVideo(patch, req.body)) return res.status(400).json({ error: 'Invalid YouTube URL' });
    }
    const data = { ...old, ...patch };
    const error = validateItem(type, data);
    if (error) return res.status(400).json({ error });
    const fields = Object.keys(patch);
    if (!fields.length) return res.json(old);
    q(`UPDATE ${tableName[type]} SET ${fields.map(field => field + '=?').join(',')},updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(...fields.map(field => patch[field]), id);
    audit({ userId: req.admin.user_id, action: 'update', entityType: type, entityId: id, ipHash: ipHash(req) });
    res.json(findRow(type, id));
  });
  app.post(route + '/reorder', auth, csrf, (req, res) => {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map(itemId) : null;
    const expectedIds = listRows(type).map(row => row.id);
    if (!ids || ids.includes(null) || new Set(ids).size !== ids.length || ids.length !== expectedIds.length || !ids.every(id => expectedIds.includes(id))) return res.status(400).json({ error: 'A complete unique order is required.' });
    const update = q(`UPDATE ${tableName[type]} SET sort_order=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`);
    db.exec('BEGIN');
    try {
      ids.forEach((id, index) => update.run(index, id));
      db.exec('COMMIT');
      audit({ userId: req.admin.user_id, action: 'reorder', entityType: type, ipHash: ipHash(req), details: { count: ids.length } });
      res.status(204).end();
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  });
  app.delete(route + '/:id', auth, csrf, (req, res) => {
    const id = itemId(req.params.id);
    const result = id && q(`DELETE FROM ${tableName[type]} WHERE id=?`).run(id);
    if (!result || !result.changes) return res.status(404).json({ error: 'Not found' });
    audit({ userId: req.admin.user_id, action: 'delete', entityType: type, entityId: id, ipHash: ipHash(req) });
    res.status(204).end();
  });
}

async function previewYouTube(req, res, next) {
  try {
    const id = youtubeId(String(req.body.url || ''));
    if (!id) return res.status(400).json({ error: 'Paste a valid YouTube video URL.' });
    const url = `https://www.youtube.com/watch?v=${id}`;
    const fallback = { youtubeId: id, url, thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, title: '', publishedAt: null };
    if (process.env.YOUTUBE_API_KEY) {
      const response = await fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + id + '&key=' + encodeURIComponent(process.env.YOUTUBE_API_KEY), { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        const item = (await response.json()).items?.[0];
        if (item) return res.json({ ...fallback, title: item.snippet.title, publishedAt: item.snippet.publishedAt, thumbnail: item.snippet.thumbnails?.high?.url || fallback.thumbnail, source: 'youtube-data-api' });
      }
    }
    try {
      const response = await fetch('https://www.youtube.com/oembed?url=' + encodeURIComponent(url) + '&format=json', { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        const data = await response.json();
        return res.json({ ...fallback, title: String(data.title || ''), thumbnail: String(data.thumbnail_url || fallback.thumbnail), source: 'oembed', warning: 'Configure YOUTUBE_API_KEY to retrieve the official publication date.' });
      }
    } catch {}
    res.json({ ...fallback, source: 'thumbnail-only', warning: 'Configure YOUTUBE_API_KEY to retrieve title and official publication date.' });
  } catch (error) { next(error); }
}
app.post('/api/admin/youtube/preview', auth, csrf, previewYouTube);
app.post('/api/admin/videos/preview', auth, csrf, previewYouTube);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 }, fileFilter: (req,file,cb) => cb(null, ['image/jpeg','image/png','image/webp'].includes(file.mimetype)) });
app.post('/api/admin/upload', auth, csrf, upload.single('image'), async (req,res,next) => { try { if (!req.file) return res.status(400).json({error:'JPEG, PNG or WebP image required'}); const meta=await sharp(req.file.buffer,{limitInputPixels:20e6}).metadata(); if (!['jpeg','png','webp'].includes(meta.format)) return res.status(400).json({error:'Invalid image'}); const name=randomToken(18)+'.webp'; await sharp(req.file.buffer,{limitInputPixels:20e6}).rotate().resize({width:1800,height:1800,fit:'inside',withoutEnlargement:true}).webp({quality:82}).toFile(path.join(uploadsDir,name)); audit({userId:req.admin.user_id,action:'upload',entityType:'image',ipHash:ipHash(req)}); res.status(201).json({path:'/uploads/'+name}); } catch (e) { next(e); } });
app.get('/admin', (req,res) => { res.set('X-Robots-Tag','noindex, nofollow, noarchive'); res.set('Cache-Control','no-store'); res.sendFile(path.join(root,'admin','panel.html')); });
app.use((err,req,res,next) => { if (err instanceof multer.MulterError) return res.status(400).json({error:'Upload rejected'}); if (err.status === 403 || err.status === 404) return res.status(404).json({error:'Not found'}); console.error('Request failed', err.message); res.status(500).json({error:'Unexpected server error'}); });
if (require.main === module) app.listen(Number(process.env.PORT || 3000), () => console.log('Camila CMS listening on port ' + (process.env.PORT || 3000)));
module.exports = app;
