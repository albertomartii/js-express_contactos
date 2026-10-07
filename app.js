const express = require('express');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');
const path = require('path');

dotenv.config();

const app = express();

// Passport Config
require('./config/passport')(passport);

// Middlewares para procesar body y estáticos
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración del motor de vistas Nunjucks
nunjucks.configure('views', {
    autoescape: true,
    express: app,
    noCache: process.env.NODE_ENV !== 'production'
});
app.set('view engine', 'njk');

// Configuración de Sesión Express
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'clave_secreta_por_defecto',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 horas
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Variables globales para plantillas
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Rutas
app.use('/', require('./routes/indexRoutes'));
app.use('/', require('./routes/authRoutes'));
app.use('/contacto', require('./routes/contactoRoutes'));

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).render('error.njk', { error: 'Página no encontrada (404).' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});

module.exports = app;
