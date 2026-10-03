# Seguridad

## Modelo de amenazas y controles

El sistema protege un único panel administrador frente a fuerza bruta, robo de contraseña, CSRF, XSS, SQL injection, subida de archivos maliciosos, enumeración de usuarios y exposición accidental de secretos. Las contraseñas se derivan con Argon2id del runtime de Node; el segundo factor TOTP es obligatorio; las sesiones son identificadores aleatorios opacos guardados como hash en SQLite. Las cookies son `HttpOnly`, `SameSite=Strict` y `Secure` en producción. No hay JWT ni secretos en frontend.

Se aplican rate limit al login, token CSRF por sesión, queries parametrizadas, límites de cuerpo, Helmet/CSP/HSTS en HTTPS, respuestas de login uniformes, registro de auditoría y validación servidor de URLs e inputs. Los secretos TOTP se cifran con AES-256-GCM cuando `TOTP_ENCRYPTION_KEY` está configurada (es obligatorio en producción). Uploads acepta solo JPEG/PNG/WebP, limita tamaño/píxeles, valida y re-codifica a WebP con nombre aleatorio. SVG y archivos genéricos están prohibidos.

## Límites

No hay garantía de invulnerabilidad. La protección depende de HTTPS, parches de Node/SO/dependencias, configuración correcta del proxy y backups probados. El TOTP debe conservarse en una app segura; si un dispositivo administrador está comprometido, revocar sesiones y cambiar contraseña/segundo factor.

## Operación ante incidente

1. Poner el sitio en mantenimiento o restringir `/admin`.
2. Rotar `SESSION_SECRET`, contraseña y secreto TOTP; revisar `audit_log`.
3. Revisar el servidor, dependencias y cambios no esperados; restaurar datos desde un backup verificado si corresponde.
4. Actualizar dependencias y Node antes de reabrir el panel.

Nunca subir `.env`, la base de datos, `uploads/` o backups al repositorio. Ejecutar `npm audit` antes de cada deploy y usar un gestor de secretos del hosting.
