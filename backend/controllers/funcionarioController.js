
const { query } = require('../database');

// Listar todos os funcionários
exports.listarFuncionarios = async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM public.funcionario ORDER BY id_funcionario'
        );

        res.json({ sucesso: true, funcionarios: result.rows });
    } catch (error) {
        console.error('Erro ao listar funcionários:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao listar funcionários.'
        });
    }
};

// Obter funcionário pelo CPF
exports.obterFuncionario = async (req, res) => {
    try {
        const cpf = req.params.id;

        const result = await query(
            'SELECT * FROM public.funcionario WHERE cpf = $1',
            [cpf]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Funcionário não encontrado.'
            });
        }

        res.json({ sucesso: true, funcionario: result.rows[0] });

    } catch (error) {
        console.error('Erro ao obter funcionário:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor.'
        });
    }
};

// Criar funcionário
exports.criarFuncionario = async (req, res) => {
    try {
        const { cpf, cargo } = req.body;

        if (!cpf || !cargo) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'CPF e cargo são obrigatórios.'
            });
        }

        const sql = `
        INSERT INTO public.funcionario (cpf, cargo)
        VALUES ($1, $2)
        RETURNING *
        `;

        const result = await query(sql, [cpf, cargo]);

        res.status(201).json({
            sucesso: true,
            mensagem: 'Funcionário inserido com sucesso!',
            funcionario: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao criar funcionário:', error);

        if (error.code === '23505') {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Funcionário já está cadastrado.'
            });
        }

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao inserir funcionário no banco de dados.'
        });
    }
};

// Atualizar funcionário
exports.atualizarFuncionario = async (req, res) => {
    try {
        const cpf = req.params.id;
        const { cargo } = req.body;

        if (!cargo) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'O cargo é obrigatório.'
            });
        }

        const sql = `
            UPDATE public.funcionario
            SET cargo = $1
            WHERE cpf = $2
            RETURNING *
        `;

        const result = await query(sql, [cargo, cpf]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Funcionário não encontrado.'
            });
        }

        res.json({
            sucesso: true,
            mensagem: 'Funcionário alterado com sucesso!',
            funcionario: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao atualizar funcionário:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao atualizar funcionário.'
        });
    }
};

// Deletar funcionário
exports.deletarFuncionario = async (req, res) => {
    try {
        const cpf = req.params.id;

        const result = await query(
            'DELETE FROM public.funcionario WHERE cpf = $1 RETURNING *',
            [cpf]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Funcionário não encontrado.'
            });
        }

        res.json({
            sucesso: true,
            mensagem: 'Funcionário excluído com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao deletar funcionário:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao excluir funcionário.'
        });
    }
};
