
const { query } = require('../database');
const bcrypt = require('bcrypt');

// LISTAR PESSOAS
exports.listarPessoas = async (req, res) => {
    try {
        const sql = `
            SELECT cpf, nome, telefone, email
            FROM pessoa
            ORDER BY nome
        `;

        const resultado = await query(sql);

        res.json({
            sucesso: true,
            pessoas: resultado.rows
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao listar pessoas.'
        });
    }
};

// PROCURAR PESSOA PELO CPF
exports.obterPessoa = async (req, res) => {
    try {
        const { cpf } = req.params;

        const sql = `
            SELECT
                p.cpf,
                p.nome,
                p.telefone,
                p.email,
                c.id_cliente,
                f.id_funcionario,
                f.cargo
            FROM pessoa p
            LEFT JOIN cliente c ON p.cpf = c.cpf
            LEFT JOIN funcionario f ON p.cpf = f.cpf
            WHERE p.cpf = $1;
        `;

        const resultado = await query(sql, [cpf]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Pessoa não encontrada.'
            });
        }

        res.json({
            sucesso: true,
            pessoa: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao procurar pessoa.'
        });
    }
};

// CADASTRAR PESSOA
exports.criarPessoa = async (req, res) => {
    try {
        const { cpf, nome, telefone, email, senha } = req.body;

        if (!cpf || !nome || !telefone || !email || !senha) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Preencha todos os campos.'
            });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const sql = `
            INSERT INTO pessoa (cpf, nome, telefone, email, senha)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING cpf
        `;

        await query(sql, [
            cpf,
            nome,
            telefone,
            email,
            senhaHash
        ]);

        res.json({
            sucesso: true,
            mensagem: 'Pessoa cadastrada com sucesso.'
        });

    } catch (erro) {
        console.error("ERRO AO CADASTRAR:", erro);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao cadastrar pessoa.'
        });
    }
};

// ALTERAR PESSOA
exports.atualizarPessoa = async (req, res) => {
    try {
        const { cpf } = req.params;
        const { nome, telefone, email, senha } = req.body;

        let senhaHash = null;

        if (senha && senha.trim() !== '') {
            senhaHash = await bcrypt.hash(senha, 10);
        }

        const sql = `
            UPDATE pessoa
            SET nome = $1,
                telefone = $2,
                email = $3,
                senha = CASE
                    WHEN $4::VARCHAR <> '' THEN $4
                    ELSE senha
                END
            WHERE cpf = $5
        `;

        const resultado = await query(sql, [
            nome,
            telefone,
            email,
            senhaHash,
            cpf
        ]);

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Pessoa não encontrada.'
            });
        }

        res.json({
            sucesso: true,
            mensagem: 'Pessoa alterada com sucesso.'
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao alterar pessoa.'
        });
    }
};

// EXCLUIR PESSOA
exports.deletarPessoa = async (req, res) => {
    try {
        const { cpf } = req.params;

        const sql = `
            DELETE FROM pessoa
            WHERE cpf = $1
        `;

        const resultado = await query(sql, [cpf]);

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Pessoa não encontrada.'
            });
        }

        res.json({
            sucesso: true,
            mensagem: 'Pessoa excluída com sucesso.'
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Não foi possível excluir. Verifique se existem vínculos de cliente ou funcionário.'
        });
    }
};
