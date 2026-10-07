const express = require('express');
const router = express.Router();
const contactoController = require('../controllers/contactoController');
const { contactoValidationRules, validate } = require('../middleware/validator');

// Listar contactos
router.get('/lista', contactoController.getLista);

// Crear contacto (Formulario)
router.get('/nuevo', contactoController.getNuevo);
router.post('/nuevo', contactoValidationRules(), validate, contactoController.postNuevo);

// Crear contacto por parámetros URL (legacy/tests)
router.get('/nuevo/:nombre/:telefono/:email', contactoController.getNuevoParametros);

// Buscar contactos que empiezan por una letra
router.get('/empieza/:letra', contactoController.getEmpiezaPor);

// Modificar contacto por URL
router.get('/modificar/:id/:nombre', contactoController.getModificar);

// Borrar contacto por ID
router.get('/borrar/:codigo', contactoController.getBorrar);

// Ficha detallada (debe ir después de las rutas más específicas para no colisionar)
router.get('/:codigo', contactoController.getFicha);

module.exports = router;
