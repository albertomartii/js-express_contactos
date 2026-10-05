const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const passport = require('passport');
const prisma = require('../config/database');
const { sendVerificationEmail } = require('../utils/emailVerifier');

const getLogin = (req, res) => {
    res.render('auth/login.njk', {
        title: 'Iniciar Sesión',
        user: req.user
    });
};

const postLogin = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/contacto/lista',
        failureRedirect: '/login',
        failureFlash: false
    })(req, res, next);
};

const getLogout = (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/login');
    });
};

const getRegister = (req, res) => {
    res.render('auth/register.njk', {
        title: 'Registro de Usuario',
        user: req.user,
        errors: req.validationErrors || []
    });
};

const postRegister = async (req, res) => {
    try {
        if (req.validationErrors && req.validationErrors.length > 0) {
            return res.render('auth/register.njk', {
                title: 'Registro de Usuario',
                user: req.user,
                errors: req.validationErrors,
                form: req.body
            });
        }

        const { email, password } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.render('auth/register.njk', {
                title: 'Registro de Usuario',
                user: req.user,
                errors: [{ msg: 'El correo electrónico ya está registrado.' }],
                form: req.body
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                roles: '["ROLE_USER"]',
                isVerified: false,
                verificationToken
            }
        });

        // Intentar enviar correo de verificación
        const hostUrl = `${req.protocol}://${req.get('host')}`;
        try {
            await sendVerificationEmail(email, verificationToken, hostUrl);
        } catch (emailErr) {
            console.error('Error al enviar correo de verificación:', emailErr);
        }

        // Iniciar sesión automáticamente
        req.login(user, (err) => {
            if (err) {
                return res.redirect('/login');
            }
            return res.redirect('/contacto/lista');
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('error.njk', { error: 'Error en el proceso de registro.' });
    }
};

const getVerifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).render('error.njk', { error: 'Token de verificación no proporcionado.' });
        }

        const user = await prisma.user.findFirst({
            where: { verificationToken: token }
        });

        if (!user) {
            return res.status(400).render('error.njk', { error: 'Token de verificación inválido o expirado.' });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null
            }
        });

        res.render('auth/verified.njk', {
            title: 'Correo Verificado',
            user: req.user
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('error.njk', { error: 'Error durante la verificación del correo.' });
    }
};

module.exports = {
    getLogin,
    postLogin,
    getLogout,
    getRegister,
    postRegister,
    getVerifyEmail
};
