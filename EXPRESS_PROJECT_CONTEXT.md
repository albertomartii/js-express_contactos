# Contexto de Proyecto: Express Contactos (Node.js & Express.js)

Este documento sirve como archivo de contexto y especificación técnica para migrar o construir desde cero una aplicación idéntica a la aplicación original de Symfony, utilizando **JavaScript (Node.js)** y el framework **Express.js**.

---

## 1. Visión General del Proyecto

La aplicación es un sistema web monolítico SSR (Server-Side Rendering) para la gestión de contactos y usuarios. Ofrece funcionalidad CRUD completa para contactos, categorización por provincias, filtrado de búsquedas, autenticación de usuarios mediante sesión y verificación de correo electrónico.

---

## 2. Stack Tecnológico Sugerido

- **Entorno de Ejecución**: Node.js (v18+)
- **Framework Web**: Express.js
- **Motor de Plantillas**: Nunjucks o EJS (Nunjucks se recomienda por su sintaxis casi idéntica a Twig)
- **ORM / Base de Datos**: Prisma ORM o Sequelize con PostgreSQL (o MySQL)
- **Autenticación**: Passport.js o `express-session` con `bcryptjs`
- **Verificación de Email**: `nodemailer` con tokens firmados (`jsonwebtoken` o hashes aleatorios)
- **Validación de Formularios**: `express-validator` o `zod`
- **Estilos**: CSS nativo servido desde la carpeta estática `public/`
- **Contenedores**: Docker Compose para la base de datos PostgreSQL

---

## 3. Modelo de Datos y Entidades

### Entidad `Contacto`
- `id`: entero, clave primaria, autoincremental.
- `nombre`: cadena (varchar 255), requerido.
- `telefono`: cadena (varchar 15), requerido.
- `email`: cadena (varchar 255), requerido.
- `provinciaId`: entero, clave foránea (Relación ManyToOne con `Provincia`).

### Entidad `Provincia`
- `id`: entero, clave primaria, autoincremental.
- `nombre`: cadena (varchar 255), requerido.
- `contactos`: relación OneToMany con `Contacto`.

### Entidad `User`
- `id`: entero, clave primaria, autoincremental.
- `email`: cadena (varchar 255), único, requerido.
- `password`: cadena (hash bcrypt), requerido.
- `roles`: array de cadenas o formato JSON (por defecto `["ROLE_USER"]`).
- `isVerified`: booleano, por defecto `false`.
- `verificationToken`: cadena (opcional, para confirmar email).

---

## 4. Estructura de Directorios Propuesta

```text
express-contactos/
├── config/
│   ├── database.js           # Conexión a la base de datos
│   └── passport.js           # Estrategia de autenticación
├── controllers/
│   ├── contactoController.js # Lógica de contactos (listado, ficha, nuevo, borrar, modificar)
│   ├── pageController.js     # Página principal de inicio
│   ├── authController.js     # Registro, login, logout y verificación de email
├── middleware/
│   ├── auth.js               # Control de acceso a rutas protegidas
│   └── validator.js          # Validaciones de entrada de formularios
├── models/                   # Modelos de ORM (Prisma / Sequelize)
│   ├── Contacto.js
│   ├── Provincia.js
│   └── User.js
├── public/
│   ├── css/
│   │   └── estilos.css       # Hoja de estilos de la aplicación
│   └── js/
├── routes/
│   ├── contactoRoutes.js     # Rutas /contacto/*
│   ├── authRoutes.js         # Rutas /login, /logout, /register, /verify/email
│   └── indexRoutes.js        # Ruta raíz /
├── utils/
│   └── emailVerifier.js      # Envío de correos de confirmación con Nodemailer
├── views/                    # Plantillas vistas (Nunjucks / EJS)
│   ├── base.njk               # Layout principal
│   ├── inicio.njk
│   ├── lista_contactos.njk
│   ├── ficha_contacto.njk
│   ├── nuevo_contacto.njk
│   └── auth/
│       ├── login.njk
│       └── register.njk
├── .env                      # Variables de entorno (PORT, DATABASE_URL, SESSION_SECRET)
├── compose.yaml              # Servicio PostgreSQL en Docker
├── package.json
└── app.js                    # Punto de entrada de la aplicación Express
```

---

## 5. Especificación de Rutas y Controladores

### Rutas Principales
- `GET /` -> Renderiza la vista de inicio (`inicio.njk`).

### Rutas de Contactos (`/contacto`)
- `GET /contacto/lista` -> Obtiene todos los contactos ordenados por ID e incluye los datos de la provincia asociada.
- `GET /contacto/nuevo` -> Renderiza el formulario de alta de contacto (incluyendo el listado de provincias para el desplegable).
- `POST /contacto/nuevo` -> Valida y procesa la creación de un nuevo contacto. Redirige a `/contacto/lista`.
- `GET /contacto/:codigo` -> Muestra la ficha detallada de un contacto específico buscando por su ID.
- `GET /contacto/nuevo/:nombre/:telefono/:email` -> Creación directa de contacto mediante parámetros URL (para pruebas/legacy).
- `GET /contacto/empieza/:letra` -> Filtra contactos cuyo campo `nombre` empiece por la letra recibida (Consulta SQL equivalente: `WHERE nombre LIKE 'letra%'`).
- `GET /contacto/modificar/:id/:nombre` -> Actualiza el nombre del contacto identificado por `id` y redirige a la ficha del contacto.
- `GET /contacto/borrar/:codigo` -> Elimina el contacto especificado por su `codigo` y redirige al inicio o listado.

### Rutas de Autenticación (`/auth`)
- `GET /login` -> Renderiza el formulario de inicio de sesión.
- `POST /login` -> Autentica las credenciales con `passport.authenticate('local')` o middleware de sesión. Redirige al listado o inicio.
- `GET /logout` -> Destruye la sesión del usuario (`req.logout()`) y redirige a `/login`.
- `GET /register` -> Renderiza el formulario de registro de usuario.
- `POST /register` -> Registra un nuevo usuario:
  1. Hashing de contraseña con `bcrypt.hash(password, 10)`.
  2. Guardado en BD con `isVerified: false`.
  3. Generación de token firmado de verificación.
  4. Envío de correo electrónico con enlace `/verify/email?token=...`.
  5. Autenticación automática de la sesión.
- `GET /verify/email` -> Procesa el token de verificación, marca `isVerified: true` en el usuario y muestra mensaje flash de éxito.

---

## 6. Equivalencias Directas entre Symfony y Express

| Componente en Symfony | Equivalente en Express.js |
| :--- | :--- |
| `src/Controller/ContactoController.php` | `controllers/contactoController.js` + `routes/contactoRoutes.js` |
| `src/Entity/Contacto.php` | Modelo Prisma / Sequelize `Contacto` |
| `templates/*.html.twig` | `views/*.njk` (Nunjucks) o `views/*.ejs` |
| `ContactoRepository::startsWith($letra)` | Método del modelo usando `Op.startsWith` (Sequelize) o `startsWith` (Prisma) |
| `security.yaml` & `SecurityController.php` | `middleware/auth.js`, `passport.js` & `controllers/authController.js` |
| `VerifyEmailBundle` & `EmailVerifier.php` | `nodemailer` + generación/verificación de tokens JWT |
| `public/css/estilos.css` | `app.use(express.static('public'))` servirá `public/css/estilos.css` |

---

## 7. Instrucciones para la Inicialización del Proyecto

1. **Inicializar proyecto Node.js**:
   ```bash
   mkdir express-contactos
   cd express-contactos
   npm init -y
   ```

2. **Instalar paquetes necesarios**:
   ```bash
   npm install express nunjucks dotenv prisma @prisma/client bcryptjs express-session passport passport-local nodemailer express-validator
   npm install -D nodemon prisma
   ```

3. **Configurar Docker Compose para la base de datos PostgreSQL**:
   ```yaml
   services:
     database:
       image: postgres:16-alpine
       environment:
         POSTGRES_DB: express_db
         POSTGRES_USER: app
         POSTGRES_PASSWORD: secretpassword
       ports:
         - "5432:5432"
   ```

4. **Variables de entorno (`.env`)**:
   ```ini
   PORT=3000
   DATABASE_URL="postgresql://app:secretpassword@localhost:5432/express_db?schema=public"
   SESSION_SECRET="clave_secreta_para_sesiones"
   SMTP_HOST="smtp.mailtrap.io"
   SMTP_PORT=2525
   SMTP_USER="tu_usuario"
   SMTP_PASS="tu_password"
   ```

5. **Punto de Entrada Básico (`app.js`)**:
   ```javascript
   const express = require('express');
   const nunjucks = require('nunjucks');
   const dotenv = require('dotenv');

   dotenv.config();
   const app = express();

   app.use(express.urlencoded({ extended: true }));
   app.use(express.json());
   app.use(express.static('public'));

   nunjucks.configure('views', {
       autoescape: true,
       express: app
   });
   app.set('view engine', 'njk');

   // Rutas
   app.use('/', require('./routes/indexRoutes'));
   app.use('/contacto', require('./routes/contactoRoutes'));
   app.use('/', require('./routes/authRoutes'));

   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => {
       console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
   });
   ```

---

## 8. Criterios de Aceptación y Validación

- Todas las operaciones CRUD de contactos deben comportarse exactamente igual que en la versión original de Symfony.
- Las vistas HTML renderizadas deben mantener la misma estructura visual usando la hoja de CSS compartida (`estilos.css`).
- Los usuarios deben poder registrarse, autenticarse, cerrar sesión y recibir un correo de confirmación para verificar su cuenta.
