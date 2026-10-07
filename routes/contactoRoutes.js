const express = require('express');
const router = express.Router();
const contactoController = require('../controllers/contactoController');
const { contactoValidationRules, validate } = require('../middleware/validator');
const { ensureAuthenticated } = require('../middleware/auth');

// Listar contactos (público)
router.get('/lista', contactoController.getLista);

// Crear contacto (Formulario - Protegido)
router.get('/nuevo', ensureAuthenticated, contactoController.getNuevo);
router.post('/nuevo', ensureAuthenticated, contactoValidationRules(), validate, contactoController.postNuevo);

// Crear contacto por parámetros URL (legacy/tests)
router.get('/nuevo/:nombre/:telefono/:email', contactoController.getNuevoParametros);

// Buscar contactos que empiezan por una letra (público)
router.get('/empieza/:letra', contactoController.getEmpiezaPor);

// Modificar contacto por URL (Protegido)
router.get('/modificar/:id/:nombre', ensureAuthenticated, contactoController.getModificar);

// Borrar contacto por ID (Protegido)
router.get('/borrar/:codigo', ensureAuthenticated, contactoController.getBorrar);

// Ficha detallada (público)
router.get('/:codigo', contactoController.getFicha);

module.exports = router;
