const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidationRules, validate } = require('../middleware/validator');
const { ensureGuest, ensureAuthenticated } = require('../middleware/auth');

router.get('/login', ensureGuest, authController.getLogin);
router.post('/login', ensureGuest, authController.postLogin);
router.get('/logout', ensureAuthenticated, authController.getLogout);

router.get('/register', ensureGuest, authController.getRegister);
router.post('/register', ensureGuest, registerValidationRules(), validate, authController.postRegister);

router.get('/verify/email', authController.getVerifyEmail);

module.exports = router;
