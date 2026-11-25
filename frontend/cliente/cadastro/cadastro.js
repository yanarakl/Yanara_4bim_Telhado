const URL_API = 'http://localhost:3001';

const formCadastro = document.getElementById('formCadastro');
const avisoCadastro = document.getElementById('aviso');

formCadastro.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    if (senha !== confirmarSenha) {
        mostrarAviso('As senhas não são iguais.', 'erro');
        return;
    }

    const botao = document.getElementById('btCadastrar');

    botao.disabled = true;
    mostrarAviso('Realizando cadastro...', '');

    const dados = {
        nome: document.getElementById('nome').value.trim(),
        cpf: document.getElementById('cpf').value,
        telefone: document.getElementById('telefone').value,
        email: document.getElementById('email').value.trim(),
        senha: senha
    };

    try {
        const resposta = await fetch(`${URL_API}/auth/cadastro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            mostrarAviso(
                resultado.mensagem || 'Não foi possível realizar o cadastro.',
                'erro'
            );
            return;
        }

        mostrarAviso(
            'Cadastro realizado! Você será encaminhado para o login.',
            'sucesso'
        );

        formCadastro.reset();

        setTimeout(() => {
            console.log('Destino:', window.location.href);
            window.location.href = '/frontend/cliente/inicio/inicio.html';
        }, 1300);

    } catch (erro) {
        console.error('Erro no cadastro:', erro);

        mostrarAviso(
            'Não foi possível conectar ao servidor.',
            'erro'
        );

    } finally {
        botao.disabled = false;
    }
});

function mostrarAviso(mensagem, tipo) {
    avisoCadastro.textContent = mensagem;
    avisoCadastro.className = `aviso-form ${tipo || ''}`;
}
