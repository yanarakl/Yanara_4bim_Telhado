const bcrypt = require('bcrypt');
const { pool, query } = require('../database');
const {
    salvarSessao,
    encerrarSessao
} = require('../middlewares/autenticacao');

// Remove pontos, traços e outros caracteres do CPF.
function limparCPF(cpf) {
    return String(cpf || '').replace(/\D/g, '');
}

// Mantém somente os números do telefone.
function limparTelefone(telefone) {
    return String(telefone || '').replace(/\D/g, '');
}

// CADASTRAR CLIENTE
exports.cadastrar = async (req, res) => {
    const { nome, cpf, telefone, email, senha } = req.body;

    const cpfLimpo = limparCPF(cpf);
    const telefoneLimpo = limparTelefone(telefone);
    const emailLimpo = String(email || '').trim().toLowerCase();

    if (!nome || !cpfLimpo || !telefoneLimpo || !emailLimpo || !senha) {
        return res.status(400).json({
            mensagem: 'Preencha todos os campos.'
        });
    }

    if (telefoneLimpo.length !== 11) {
        return res.status(400).json({
            mensagem: 'O telefone deve ter 11 números.'
        });
    }

    if (senha.length < 6) {
        return res.status(400).json({
            mensagem: 'A senha deve ter pelo menos 6 caracteres.'
        });
    }

    let conexao;

    try {
        conexao = await pool.connect();

        await conexao.query('BEGIN');

        const pessoaExistente = await conexao.query(
            `SELECT cpf FROM pessoa
             WHERE cpf = $1 OR LOWER(email) = $2`,
            [cpfLimpo, emailLimpo]
        );

        if (pessoaExistente.rows.length > 0) {
            await conexao.query('ROLLBACK');

            return res.status(409).json({
                mensagem: 'Já existe uma conta com esse CPF ou e-mail.'
            });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        await conexao.query(
            `INSERT INTO pessoa (cpf, nome, telefone, email, senha)
             VALUES ($1, $2, $3, $4, $5)`,
            [cpfLimpo, nome.trim(), telefoneLimpo, emailLimpo, senhaCriptografada]
        );

        await conexao.query(
            `INSERT INTO cliente (cpf)
             VALUES ($1)`,
            [cpfLimpo]
        );

        await conexao.query('COMMIT');

        return res.status(201).json({
            mensagem: 'Cadastro realizado com sucesso!'
        });

    } catch (erro) {
        if (conexao) {
            await conexao.query('ROLLBACK');
        }

        console.error('Erro ao cadastrar:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao realizar o cadastro.'
        });

    } finally {
        if (conexao) {
            conexao.release();
        }
    }
};


// FAZER LOGIN

exports.login = async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const senha = String(req.body.senha || '');
    const perfilSolicitado = req.body.perfil;

    if (!email || !senha) {
        return res.status(400).json({
            mensagem: 'Informe o e-mail e a senha.'
        });
    }

    try {
        const resultado = await query(
            `SELECT
                p.cpf,
                p.nome,
                p.email,
                p.senha,
                c.id_cliente,
                f.id_funcionario
             FROM pessoa p
             LEFT JOIN cliente c ON c.cpf = p.cpf
             LEFT JOIN funcionario f ON f.cpf = p.cpf
             WHERE LOWER(p.email) = $1`,
            [email]
        );

        if (resultado.rows.length === 0) {
            return res.status(401).json({
                mensagem: 'E-mail ou senha incorretos.'
            });
        }

        const pessoa = resultado.rows[0];

        let senhaCorreta = false;

        if (String(pessoa.senha).startsWith('$2')) {
            senhaCorreta = await bcrypt.compare(senha, pessoa.senha);
        } else {
            senhaCorreta = senha === pessoa.senha;

            if (senhaCorreta) {
                const novaSenha = await bcrypt.hash(senha, 10);

                await query(
                    'UPDATE pessoa SET senha = $1 WHERE cpf = $2',
                    [novaSenha, pessoa.cpf]
                );
            }
        }

        if (!senhaCorreta) {
            return res.status(401).json({
                mensagem: 'E-mail ou senha incorretos.'
            });
        }

        const ehCliente = pessoa.id_cliente !== null;
        const ehFuncionario = pessoa.id_funcionario !== null;

        if (!ehCliente && !ehFuncionario) {
            return res.status(403).json({
                mensagem: 'Esta conta não possui um perfil de acesso.'
            });
        }

        // Se possui os dois perfis, precisa escolher um.
        if (ehCliente && ehFuncionario && !perfilSolicitado) {
            return res.json({
                escolherPerfil: true,
                mensagem: 'Escolha como deseja acessar o sistema.'
            });
        }

        let perfil;

        if (ehCliente && ehFuncionario) {
            if (
                perfilSolicitado !== 'cliente' &&
                perfilSolicitado !== 'funcionario'
            ) {
                return res.status(400).json({
                    mensagem: 'Selecione um perfil válido.'
                });
            }

            perfil = perfilSolicitado;

        } else if (ehFuncionario) {
            perfil = 'funcionario';

        } else {
            perfil = 'cliente';
        }

        salvarSessao(res, {
            cpf: pessoa.cpf,
            nome: pessoa.nome,
            perfil,
            id_cliente: pessoa.id_cliente,
            id_funcionario: pessoa.id_funcionario
        });

        return res.json({
            sucesso: true,
            mensagem: 'Login realizado com sucesso!',
            perfil
        });

    } catch (erro) {
        console.error('Erro no login:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao realizar login.'
        });
    }
};



// VERIFICAR SE EXISTE UMA SESSÃO
exports.sessao = (req, res) => {
    if (!req.usuario) {
        return res.status(401).json({
            autenticado: false
        });
    }

    return res.json({
        autenticado: true,
        usuario: req.usuario
    });
};


// ENCERRAR SESSÃO
exports.logout = (req, res) => {
    encerrarSessao(res);

    return res.json({
        mensagem: 'Sessão encerrada.'
    });
};


// BUSCAR DADOS DO PERFIL
exports.obterPerfil = async (req, res) => {
    try {
        const resultado = await query(
            `SELECT cpf, nome, telefone, email
             FROM pessoa
             WHERE cpf = $1`,
            [req.usuario.cpf]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem: 'Pessoa não encontrada.'
            });
        }

        return res.json(resultado.rows[0]);

    } catch (erro) {
        console.error('Erro ao buscar perfil:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao buscar os dados do perfil.'
        });
    }
};


// ATUALIZAR DADOS DO PERFIL
exports.atualizarPerfil = async (req, res) => {
    const { nome, telefone, email, senha } = req.body;

    const telefoneLimpo = limparTelefone(telefone);
    const emailLimpo = String(email || '').trim().toLowerCase();

    if (!nome || !telefoneLimpo || !emailLimpo) {
        return res.status(400).json({
            mensagem: 'Preencha nome, telefone e e-mail.'
        });
    }

    if (telefoneLimpo.length !== 11) {
        return res.status(400).json({
            mensagem: 'O telefone deve ter 11 números.'
        });
    }

    try {
        const emailExistente = await query(
            `SELECT cpf FROM pessoa
             WHERE LOWER(email) = $1 AND cpf <> $2`,
            [emailLimpo, req.usuario.cpf]
        );

        if (emailExistente.rows.length > 0) {
            return res.status(409).json({
                mensagem: 'Este e-mail já está sendo utilizado.'
            });
        }

        if (senha && senha.length < 6) {
            return res.status(400).json({
                mensagem: 'A nova senha deve ter pelo menos 6 caracteres.'
            });
        }

        if (senha) {
            const senhaCriptografada = await bcrypt.hash(senha, 10);

            await query(
                `UPDATE pessoa
                 SET nome = $1, telefone = $2, email = $3, senha = $4
                 WHERE cpf = $5`,
                [
                    nome.trim(),
                    telefoneLimpo,
                    emailLimpo,
                    senhaCriptografada,
                    req.usuario.cpf
                ]
            );
        } else {
            await query(
                `UPDATE pessoa
                 SET nome = $1, telefone = $2, email = $3
                 WHERE cpf = $4`,
                [
                    nome.trim(),
                    telefoneLimpo,
                    emailLimpo,
                    req.usuario.cpf
                ]
            );
        }

        return res.json({
            mensagem: 'Perfil atualizado com sucesso!'
        });

    } catch (erro) {
        console.error('Erro ao atualizar perfil:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao atualizar o perfil.'
        });
    }
};