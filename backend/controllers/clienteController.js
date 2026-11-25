
const { query } = require('../database');

// Listar todos os clientes
exports.listarClientes = async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM public.cliente ORDER BY id_cliente'
        );

        res.json({ sucesso: true, clientes: result.rows });
    } catch (error) {
        console.error('Erro ao listar clientes:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao listar clientes.'
        });
    }
};

// Obter cliente pelo CPF
exports.obterCliente = async (req, res) => {
    try {
        const cpf = req.params.id;

        const result = await query(
            'SELECT * FROM public.cliente WHERE cpf = $1',
            [cpf]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Cliente não encontrado.'
            });
        }

        res.json({ sucesso: true, cliente: result.rows[0] });

    } catch (error) {
        console.error('Erro ao obter cliente:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor.'
        });
    }
};

// Criar cliente
exports.criarCliente = async (req, res) => {
    try {
        const { cpf } = req.body;

        if (!cpf) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'O CPF é obrigatório.'
            });
        }

        const sql = `
        INSERT INTO public.cliente (cpf)
        VALUES ($1)
        RETURNING *
        `;

        const result = await query(sql, [cpf]);

        res.status(201).json({
            sucesso: true,
            mensagem: 'Cliente inserido com sucesso!',
            cliente: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao criar cliente:', error);

        if (error.code === '23505') {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Cliente já está cadastrado.'
            });
        }

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao inserir cliente no banco de dados.'
        });
    }
};

// Atualizar cliente
exports.atualizarCliente = async (req, res) => {
    try {
        const cpf = req.params.id;

        // Cliente não possui outros campos para atualizar.
        const result = await query(
            'SELECT * FROM public.cliente WHERE cpf = $1',
            [cpf]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Cliente não encontrado.'
            });
        }

        res.json({
            sucesso: true,
            mensagem: 'Cliente já está cadastrado!',
            cliente: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao atualizar cliente.'
        });
    }
};

// Deletar cliente
exports.deletarCliente = async (req, res) => {
    try {
        const cpf = req.params.id;

        const result = await query(
            'DELETE FROM public.cliente WHERE cpf = $1 RETURNING *',
            [cpf]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Cliente não encontrado.'
            });
        }

        res.json({
            sucesso: true,
            mensagem: 'Cliente excluído com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao deletar cliente:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao excluir cliente.'
        });
    }
};
