
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

const {
    verificarSessao,
    lerSessao
} = require('../middlewares/autenticacao');

// Cadastro e login
router.post('/cadastro', authController.cadastrar);
router.post('/login', authController.login);

// Verificar sessão
router.get('/sessao', (req, res, next) => {
    req.usuario = lerSessao(req);
    next();
}, authController.sessao);

// Encerrar sessão
router.post('/logout', authController.logout);

// Perfil
router.get('/perfil', verificarSessao, authController.obterPerfil);
router.put('/perfil', verificarSessao, authController.atualizarPerfil);

module.exports = router;
