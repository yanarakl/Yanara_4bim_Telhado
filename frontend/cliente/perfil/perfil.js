
const URL_API = 'http://127.0.0.1:3001';

// BUSCAR DADOS DO PERFIL
async function carregarPerfil() {
    try {
        const respostaSessao = await fetch(
            `${URL_API}/auth/sessao`,
            { credentials: 'include' }
        );

        const sessao = await respostaSessao.json();

        if (!sessao.autenticado || sessao.usuario.perfil !== 'cliente') {
            window.location.href = '../login/login.html';
            return;
        }

        const resposta = await fetch(
            `${URL_API}/auth/perfil`,
            { credentials: 'include' }
        );

        if (!resposta.ok) {
            throw new Error('Não foi possível carregar o perfil.');
        }

        const pessoa = await resposta.json();

        document.getElementById('nome').value = pessoa.nome || '';
        document.getElementById('telefone').value = pessoa.telefone || '';
        document.getElementById('email').value = pessoa.email || '';

    } catch (erro) {
        console.error('Erro ao carregar perfil:', erro);

        document.getElementById('mensagem').textContent =
            'Não foi possível carregar seus dados.';
    }
}


// ATUALIZAR DADOS DO PERFIL
async function atualizarPerfil(evento) {
    evento.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value;
    const email = document.getElementById('email').value.trim();

    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    const mensagem = document.getElementById('mensagem');
    const botao = document.getElementById('botaoSalvar');

    mensagem.textContent = '';

    if (senha && senha !== confirmarSenha) {
        mensagem.textContent = 'As senhas não coincidem.';
        return;
    }

    if (!senha && confirmarSenha) {
        mensagem.textContent = 'Informe a nova senha.';
        return;
    }

    if (telefone.replace(/\D/g, '').length !== 11) {
        mensagem.textContent = 'O telefone deve ter 11 números.';
        return;
    }

    botao.disabled = true;
    botao.textContent = 'Salvando...';

    try {
        const resposta = await fetch(`${URL_API}/auth/perfil`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                nome,
                telefone,
                email,
                senha
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.mensagem || 'Não foi possível atualizar o perfil.'
            );
        }

        mensagem.textContent = 'Perfil atualizado com sucesso!';

        document.getElementById('senha').value = '';
        document.getElementById('confirmarSenha').value = '';

    } catch (erro) {
        console.error('Erro ao atualizar perfil:', erro);
        mensagem.textContent = erro.message;

    } finally {
        botao.disabled = false;
        botao.textContent = 'Salvar alterações';
    }
}


// ENCERRAR SESSÃO
async function sairDaConta() {
    const confirmar = confirm('Deseja realmente sair da sua conta?');

    if (!confirmar) {
        return;
    }

    try {
        const resposta = await fetch(`${URL_API}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        if (!resposta.ok) {
            throw new Error('Não foi possível encerrar a sessão.');
        }

        window.location.href = '../login/login.html';

    } catch (erro) {
        console.error('Erro ao sair:', erro);
        alert(erro.message);
    }
}


// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    carregarPerfil();

    document.getElementById('formPerfil')
        .addEventListener('submit', atualizarPerfil);

    document.getElementById('botaoLogout')
        .addEventListener('click', sairDaConta);
});
