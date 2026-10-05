const express = require('express');
const router = express.Router();
const contactoController = require('../controllers/contactoController');
const { contactoValidationRules, validate } = require('../middleware/validator');
const { ensureAuthenticated } = require('../middleware/auth');

// Listar contactos
router.get('/lista', contactoController.getLista);

// Crear contacto (Formulario)
router.get('/nuevo', ensureAuthenticated, contactoController.getNuevo);
router.post('/nuevo', ensureAuthenticated, contactoValidationRules(), validate, contactoController.postNuevo);

// Crear contacto por parámetros URL (legacy/tests)
router.get('/nuevo/:nombre/:telefono/:email', contactoController.getNuevoParametros);

// Buscar contactos que empiezan por una letra
router.get('/empieza/:letra', contactoController.getEmpiezaPor);

// Modificar contacto por URL
router.get('/modificar/:id/:nombre', ensureAuthenticated, contactoController.getModificar);

// Borrar contacto por ID
router.get('/borrar/:codigo', ensureAuthenticated, contactoController.getBorrar);

// Ficha detallada (debe ir después de las rutas más específicas para no colisionar)
router.get('/:codigo', contactoController.getFicha);

module.exports = router;
