
const express = require('express');
const router = express.Router();

const pedidoController = require('../controllers/pedidoController');
const { verificarSessao } = require('../middlewares/autenticacao');

router.get('/listar', pedidoController.listarPedidos);
router.get('/sem-pagamento', pedidoController.listarPedidosSemPagamento);

// Rota de finalização do pedido pelo cliente
router.post('/finalizar', verificarSessao, pedidoController.finalizarPedido);

router.get('/:id', pedidoController.obterPedido);
router.post('/', pedidoController.criarPedido);
router.put('/:id', pedidoController.atualizarPedido);
router.delete('/:id', pedidoController.deletarPedido);

module.exports = router;
