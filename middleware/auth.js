function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    req.flash?.('error_msg', 'Por favor, inicia sesión para acceder a esta página.');
    res.redirect('/login');
}

function ensureGuest(req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return next();
    }
    res.redirect('/contacto/lista');
}

module.exports = {
    ensureAuthenticated,
    ensureGuest
};
