const { pool, query } = require('../database');

exports.listarPedidosSemPagamento = async (req, res) => {
    try {
        const result = await query(`
            SELECT p.*
            FROM public.pedido p
            LEFT JOIN public.pagamento pg
                ON pg.id_pedido = p.id_pedido
            WHERE pg.id_pedido IS NULL
        `);
        res.json({
            sucesso: true,
            pedidos: result.rows
        });
    } catch (error) {
        console.error('Erro ao listar pedidos:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao listar pedidos.'
        });
    }
};

// Listar todos os pedidos
exports.listarPedidos = async (req, res) => {
    try {
        const result = await query('SELECT * FROM public.pedido ORDER BY id_pedido');
        res.json({ sucesso: true, pedidos: result.rows });
    } catch (error) {
        console.error('Erro ao listar pedidos:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar pedidos.' });
    }
};

// Obter pedido por ID
exports.obterPedido = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID inválido.' });
        };
        const result = await query('SELECT * FROM public.pedido WHERE id_pedido = $1', [id]);
        if (result.rows.length === 0)
            return res.status(404).json({ sucesso: false, mensagem: 'Pedido não encontrado.' });
        const itens = await query(`
            SELECT *
            FROM public.item_pedido
            INNER JOIN public.produto
            ON produto.id_produto = item_pedido.id_produto
            WHERE item_pedido.id_pedido = $1
        `, [id]);
        res.json({
            sucesso: true,
            pedido: result.rows[0],
            produtos: itens.rows
        });
    } catch (error) {
        console.error('Erro ao obter pedido:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
    }
};

// Criar pedido
exports.criarPedido = async (req, res) => {
    try {
        const {
            id_pedido,
            data_hora_pedido,
            status_pedido,
            valor_total_pedido,
            produtos = []
        } = req.body;

        const id_cliente_pedido = req.usuario.id_cliente;

        if (req.usuario.perfil !== 'cliente' || !id_cliente_pedido) {
            return res.status(403).json({
                mensagem: 'Somente clientes podem realizar pedidos.'
            });
        }

        if (!data_hora_pedido || !status_pedido || !valor_total_pedido || !id_cliente_pedido) {
            return res.status(400).json({ sucesso: false, mensagem: 'Os atributos são obrigatórios.' });
        }

        const sql = `
            INSERT INTO public.pedido (id_pedido, data_hora, status, id_cliente, valor_total)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const values = [
            id_pedido,
            data_hora_pedido,
            status_pedido,
            id_cliente_pedido,
            valor_total_pedido
        ];

        const result = await query(sql, values);

        for (let produto of produtos) {
            const subtotal = produto.preco_produto * produto.quantidade;

            await query(
                `INSERT INTO public.item_pedido
        (id_pedido, id_produto, quantidade, preco_unitario, subtotal)
        VALUES ($1, $2, $3, $4, $5)`,
                [
                    id_pedido,
                    produto.id_produto,
                    produto.quantidade,
                    produto.preco_produto,
                    subtotal
                ]
            );
        }
        res.status(201).json({ sucesso: true, mensagem: 'Pedido inserido com sucesso!', pedido: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        if (error.code === '23503') {
            return res.status(400).json({ sucesso: false, mensagem: 'cliente informado não existe no cadastro.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao inserir pedido no banco de dados.' });
    }
};

// Atualizar pedido
exports.atualizarPedido = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        const { data_hora_pedido, status_pedido, id_cliente_pedido, valor_total_pedido, produtos = [] } = req.body;
        const sql = `
            UPDATE public.pedido 
            SET data_hora = $1, 
                status = $2, 
                id_cliente = $3, 
                valor_total = $4 
            WHERE id_pedido = $5
            RETURNING *
        `;

        const values = [
            data_hora_pedido,
            status_pedido,
            id_cliente_pedido,
            valor_total_pedido,
            id
        ];


        const result = await query(sql, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Pedido não encontrado.' });
        }
        await query(
            `DELETE FROM public.item_pedido
     WHERE id_pedido = $1`,
            [id]
        );

        for (let produto of produtos || []) {
            const subtotal = produto.preco_produto * produto.quantidade;

            await query(
                `INSERT INTO public.item_pedido
        (id_pedido, id_produto, quantidade, preco_unitario, subtotal)
        VALUES ($1, $2, $3, $4, $5)`,
                [
                    id,
                    produto.id_produto,
                    produto.quantidade,
                    produto.preco_produto,
                    subtotal
                ]
            );
        }


        res.json({ sucesso: true, mensagem: 'Pedido alterado com sucesso!', pedido: result.rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar pedido:', error);
        if (error.code === '23503') {
            return res.status(400).json({ sucesso: false, mensagem: 'O cliente informado não existe no cadastro.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar pedido.' });
    }
};

// Deletar pedido
exports.deletarPedido = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        const pagamento = await query('SELECT 1 FROM public.pagamento WHERE id_pedido = $1', [id]);

        if (pagamento.rows.length > 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Não é possível excluir o pedido porque ele possui um pagamento associado.'
            });
        }

        await query('DELETE FROM public.item_pedido WHERE id_pedido = $1', [id]);

        const resultado = await query('DELETE FROM public.pedido WHERE id_pedido = $1 RETURNING *', [id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Pedido não encontrado.'
            });
        }

        res.json({
            sucesso: true,
            mensagem: 'Pedido excluído com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao deletar pedido:', error);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao excluir pedido.'
        });
    }
};


// Finalizar pedido pelo checkout do cliente
exports.finalizarPedido = async (req, res) => {
    const conexao = await pool.connect();

    try {
        const resultadoCliente = await query(
            'SELECT id_cliente FROM cliente WHERE cpf = $1',
            [req.usuario.cpf]
        );

        if (resultadoCliente.rows.length === 0) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Cliente não encontrado. Faça login novamente.'
            });
        }

        const id_cliente = resultadoCliente.rows[0].id_cliente;
        const produtos = req.body.produtos;

        if (req.usuario.perfil !== 'cliente' || !id_cliente) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Somente clientes podem realizar pedidos.'
            });
        }

        if (!Array.isArray(produtos) || produtos.length === 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'O carrinho está vazio.'
            });
        }

        // Validar os produtos e as quantidades
        for (const produto of produtos) {
            if (
                !Number.isInteger(Number(produto.id_produto)) ||
                !Number.isInteger(Number(produto.quantidade)) ||
                Number(produto.quantidade) <= 0
            ) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Produto ou quantidade inválida.'
                });
            }
        }

        await conexao.query('BEGIN');

        // Buscar os preços diretamente no banco
        const ids = [...new Set(
            produtos.map(p => Number(p.id_produto))
        )];

        const resultadoProdutos = await conexao.query(
            `SELECT id_produto, preco_produto
             FROM public.produto
             WHERE id_produto = ANY($1::int[])`,
            [ids]
        );

        if (resultadoProdutos.rows.length !== ids.length) {
            throw new Error('Um ou mais produtos não foram encontrados.');
        }

        const precos = new Map();

        resultadoProdutos.rows.forEach(produto => {
            precos.set(
                produto.id_produto,
                Math.round(Number(produto.preco_produto) * 100)
            );
        });

        // Calcular o total em centavos
        let totalCentavos = 0;

        const itens = produtos.map(produto => {
            const id_produto = Number(produto.id_produto);
            const quantidade = Number(produto.quantidade);
            const precoCentavos = precos.get(id_produto);

            const subtotalCentavos = precoCentavos * quantidade;
            totalCentavos += subtotalCentavos;

            return {
                id_produto,
                quantidade,
                precoCentavos,
                subtotalCentavos
            };
        });

        const valorTotal = totalCentavos / 100;

        // Criar pedido: o ID é gerado pelo banco
        const resultadoPedido = await conexao.query(
            `INSERT INTO public.pedido
                (data_hora, status, id_cliente, valor_total)
             VALUES (NOW(), 'Pendente', $1, $2)
             RETURNING *`,
            [id_cliente, valorTotal]
        );

        const pedido = resultadoPedido.rows[0];

        // Inserir os produtos do pedido
        for (const item of itens) {
            await conexao.query(
                `INSERT INTO public.item_pedido
                    (id_pedido, id_produto, quantidade,
                     preco_unitario, subtotal)
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    pedido.id_pedido,
                    item.id_produto,
                    item.quantidade,
                    item.precoCentavos / 100,
                    item.subtotalCentavos / 100
                ]
            );
        }

        const { forma_pagamento } = req.body;

        const formasPermitidas = ['Pix', 'Dinheiro', 'Credito', 'Debito'];

        if (!formasPermitidas.includes(forma_pagamento)) {
            throw new Error('Forma de pagamento inválida.');
        }

        await conexao.query(
            `INSERT INTO public.pagamento
        (id_pedido, forma_pagamento, valor, status)
     VALUES ($1, $2, $3, $4)`,
            [pedido.id_pedido, forma_pagamento, valorTotal, 'Pendente']
        );

        await conexao.query('COMMIT');

        res.status(201).json({
            sucesso: true,
            mensagem: 'Pedido realizado com sucesso!',
            pedido
        });

    } catch (error) {
        await conexao.query('ROLLBACK');

        console.error('Erro ao finalizar pedido:', error);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Não foi possível finalizar o pedido.'
        });

    } finally {
        conexao.release();
    }
};
