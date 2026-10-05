const { body, validationResult } = require('express-validator');

const contactoValidationRules = () => {
    return [
        body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio.'),
        body('telefono').trim().notEmpty().withMessage('El teléfono es obligatorio.'),
        body('email').trim().isEmail().withMessage('Debe proporcionar un email válido.'),
        body('provinciaId').notEmpty().isInt().withMessage('Debe seleccionar una provincia válida.')
    ];
};

const registerValidationRules = () => {
    return [
        body('email').trim().isEmail().withMessage('Debe proporcionar un email válido.'),
        body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.')
    ];
};

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    req.validationErrors = errors.array();
    return next();
};

module.exports = {
    contactoValidationRules,
    registerValidationRules,
    validate
};
