# Administración del sitio

## Uso local

1. Instalá Node.js 24 LTS.
2. Copiá `.env.example` como `.env`. En producción definí `SESSION_SECRET` y `TOTP_ENCRYPTION_KEY` con valores aleatorios; el segundo cifra el secreto TOTP almacenado en la base. Los comandos `npm start` y `npm run create-admin` cargan ese archivo automáticamente.
3. Ejecutá `npm install`, `npm run seed-existing-content` y luego `npm run create-admin`. El último asistente crea únicamente `germangomezbonelli2@gmail.com` y `camipero@gmail.com` si no existen y muestra una URI TOTP independiente para cada cuenta. Nunca imprime ni guarda las contraseñas.
4. Ejecutá `npm start`, abrí `http://localhost:3000/admin` e iniciá sesión.

El panel permite crear, editar, publicar/ocultar, ordenar y eliminar libros, novedades y videos de Odisea. Todo lo marcado como publicado queda disponible para el frontend por `GET /api/public/content`; contenido no publicado nunca aparece allí.

Para rotar solamente el segundo factor de Camila sin cambiar su contraseña ni eliminar la cuenta, ejecutá `npm run reset-totp -- camipero@gmail.com`. El comando verifica que la cuenta exista, reemplaza exclusivamente su secreto TOTP cifrado y muestra una nueva URI para escanear. La URI es sensible: no la compartas ni la guardes en Git.

Para obtener automáticamente título, miniatura y la fecha real de publicación de YouTube, configurá `YOUTUBE_API_KEY` con una clave restringida en Google Cloud para YouTube Data API v3. La clave solo se usa en el servidor. Sin ella, el panel intenta completar título y miniatura con oEmbed, pero deja explícitamente pendiente la fecha oficial.

## API pública estable

Solo hay un endpoint público y no requiere sesión:

`GET /api/public/content`

La respuesta tiene esta forma. Los nombres de campos son camelCase y `version` permite evolucionar el contrato sin romper el frontend:

```json
{
  "version": 1,
  "generatedAt": "2026-10-02T12:00:00.000Z",
  "odisea": [{"id": 1, "youtubeId": "…", "title": "…", "publishedAt": "…", "thumbnail": "https://…", "url": "https://…", "program": "Odisea Argentina", "sortOrder": 0}],
  "books": [{"id": 1, "title": "…", "year": 2026, "publisher": "…", "descriptionEs": "…", "descriptionEn": "…", "coverPath": "/uploads/…webp", "externalUrl": "https://…", "featuredHome": 1, "sortOrder": 0}],
  "news": [{"id": 1, "type": "award", "titleEs": "…", "titleEn": "…", "descriptionEs": "…", "descriptionEn": "…", "eventDate": "2026-10-02", "imagePath": "/uploads/…webp", "externalUrl": "https://…", "featuredHome": 1, "sortOrder": 0}],
  "featured": {"books": [], "news": []}
}
```

Las colecciones ya contienen únicamente contenido publicado. `featured.books` y `featured.news` son subconjuntos del contenido publicado marcado para Home. El frontend no debe depender de columnas internas de SQLite ni de endpoints `/api/admin/*`.

## Integración con el frontend

El HTML/CSS existente no fue rediseñado. La integración deliberada consiste en reemplazar los arreglos de datos estáticos en `js/main.js`, `js/media.js` y `js/publications.js` por una consulta a `/api/public/content`, renderizando solo los campos publicados. Hacerlo al final evita pisar el trabajo visual paralelo.

## Deployment recomendado

GitHub Pages no puede alojar este backend. Opciones:

- Plataforma Node con volumen persistente: simple, HTTPS y variables gestionadas; verificar backups reales del volumen antes de elegirla.
- VPS administrado con Docker/Caddy: mejor compatibilidad con SQLite y portabilidad, pero exige actualizaciones de sistema, firewall, monitoreo y backups.
- Hosting Node administrado con PostgreSQL: más operación de datos, pero adecuado si no se puede garantizar un disco persistente para SQLite.

Para SQLite, montar `data/`, `uploads/` y `backups/` en un volumen persistente. Usar HTTPS, `NODE_ENV=production`, `TRUST_PROXY=1` solo detrás de un proxy TLS conocido, y variables `SESSION_SECRET` y `TOTP_ENCRYPTION_KEY` generadas aleatoriamente. No desplegar `.env`.

## Backups y restauración

Ejecutá `npm run backup` desde el servidor: crea una copia con fecha de la base (tras checkpoint WAL) y de `uploads/` dentro de `backups/`. Programalo diariamente y copiá ese directorio cifrado fuera del servidor. Para migrar: detener el servicio, copiar código, `data/` y `uploads/` a un servidor nuevo, definir nuevas variables de entorno y arrancar. Rotar `SESSION_SECRET` invalida sesiones existentes.
