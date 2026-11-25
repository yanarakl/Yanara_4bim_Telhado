
const express = require('express');
const router = express.Router();
const pessoaController = require('../controllers/pessoaController');

router.get('/listar', pessoaController.listarPessoas);
router.get('/:cpf', pessoaController.obterPessoa);
router.post('/', pessoaController.criarPessoa);
router.put('/:cpf', pessoaController.atualizarPessoa);
router.delete('/:cpf', pessoaController.deletarPessoa);

module.exports = router;