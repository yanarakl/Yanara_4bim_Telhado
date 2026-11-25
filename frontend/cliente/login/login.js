const URL_API = 'http://127.0.0.1:3001';

const formLogin = document.getElementById('formLogin');
const avisoLogin = document.getElementById('aviso');
const opcoesPerfil = document.getElementById('opcoesPerfil');

let perfilEscolhido = null;

formLogin.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    perfilEscolhido = null;
    opcoesPerfil.hidden = true;

    await fazerLogin();
});

async function fazerLogin() {
    const botao = document.getElementById('btEntrar');

    botao.disabled = true;
    mostrarAviso('Verificando seus dados...', '');

    const dados = {
        email: document.getElementById('email').value.trim(),
        senha: document.getElementById('senha').value
    };

    if (perfilEscolhido) {
        dados.perfil = perfilEscolhido;
    }

    try {
        const resposta = await fetch(`${URL_API}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            mostrarAviso(
                resultado.mensagem || 'Não foi possível entrar.',
                'erro'
            );
            return;
        }

        if (resultado.escolherPerfil) {
            opcoesPerfil.hidden = false;

            mostrarAviso(
                'Escolha como deseja acessar o sistema.',
                ''
            );

            return;
        }

        opcoesPerfil.hidden = true;

        mostrarAviso(
            'Login realizado! Redirecionando...',
            'sucesso'
        );

        if (resultado.perfil === 'funcionario') {
            window.location.href = '../../menu/menu.html';
        } else {
            window.location.href = '../inicio/inicio.html';
        }

    } catch (erro) {
        console.error('Erro no login:', erro);

        mostrarAviso(
            'Não foi possível conectar ao servidor.',
            'erro'
        );

    } finally {
        botao.disabled = false;
    }
}

async function entrarComo(perfil) {
    perfilEscolhido = perfil;
    await fazerLogin();
}

function mostrarAviso(mensagem, tipo) {
    avisoLogin.textContent = mensagem;
    avisoLogin.className = `aviso-form ${tipo || ''}`;
}
