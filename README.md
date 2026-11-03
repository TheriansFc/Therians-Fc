# Therians F.C. — web colaborativa (TAFC)

## Contenido
- `index.html`, `styles.css`, `app.js`: sitio web adaptable a móviles.
- `assets/escudo-tafc.jpg`: escudo original proporcionado.
- `schema.sql`: tablas, permisos de lectura/edición y auditoría de cambios.
- `config.js`: configuración pública de Supabase (vacía por seguridad).

## Ver la demostración
Abre `index.html` en un navegador. Verás un ejemplo local sin conexión: NO es un sistema de edición compartida y los datos de ejemplo NO son resultados reales.

## Activar cuentas y edición compartida
1. Crea un proyecto en https://supabase.com/ (plan gratuito disponible con límites).
2. Abre SQL Editor y ejecuta el contenido completo de `schema.sql`.
3. En Project Settings / API copia **Project URL** y la clave **anon/publishable** a `config.js`. **Nunca uses la clave `service_role` o `secret` en el navegador.**
4. En Authentication / Providers habilita Email y el acceso por enlace mágico (OTP). Revisa los límites de correo del plan gratuito.
5. En Authentication / URL Configuration agrega la dirección definitiva de GitHub Pages en Site URL y Redirect URLs (por ejemplo `https://TUUSUARIO.github.io/therians-fc/`).
6. Sube la carpeta a un repositorio de GitHub y activa Settings > Pages > Deploy from a branch > main / root. Espera a que aparezca la URL pública.
7. Abre la web, pulsa «Ingresar», escribe un correo y sigue el enlace recibido. Cualquier usuario autenticado puede agregar y editar los registros; todos los visitantes pueden leerlos.

## Seguridad y límites
- Cualquier persona con un correo válido puede crear una cuenta y modificar TODOS los registros. Es lo solicitado, pero existe riesgo de vandalismo. No se permite borrar desde el sitio y los cambios se auditan en la base de datos.
- El historial conserva valores anteriores y posteriores, autor y fecha. La interfaz muestra las últimas 50 acciones. En esta versión el correo del editor se muestra públicamente: informa de ello a los usuarios o modifica el sistema para usar alias antes de lanzarlo públicamente.
- Para restaurar un dato alterado, un administrador debe revisar `historial` y recuperar el valor anterior manualmente desde Supabase; todavía no hay botón de revertir.
- El Fantasy actual solo muestra precios ficticios editables manualmente; no tiene mercado automático, compras ni ligas de usuarios.
- No subas información privada o fotos de compañeros sin su autorización.
- El plan gratuito de los servicios puede cambiar y tiene límites de capacidad y uso.

## Próximas fases
- Fotografías de jugadores y galería con almacenamiento.
- Ranking de goleadores, asistencias y MVP.
- Fantasy con presupuesto, fichajes, plantillas y puntos automáticos.
- Historial con alias y restauración de versiones.
