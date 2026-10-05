const getInicio = (req, res) => {
    res.render('inicio.njk', {
        title: 'Página Principal - Express Contactos',
        user: req.user
    });
};

module.exports = {
    getInicio
};
