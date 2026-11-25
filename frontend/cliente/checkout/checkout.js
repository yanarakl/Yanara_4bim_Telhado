const URL_API = 'http://127.0.0.1:3001';
const CHAVE_CARRINHO = 'carrinhoGhibli';

function obterCarrinho() {
    return JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || [];
}

function formatarPreco(valor) {
    return Number(valor).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function mostrarResumo() {
    const carrinho = obterCarrinho();
    const lista = document.getElementById('listaProdutos');
    const totalElemento = document.getElementById('valorTotal');

    lista.innerHTML = '';

    if (carrinho.length === 0) {
        lista.textContent = 'Seu carrinho está vazio.';
        totalElemento.textContent = formatarPreco(0);
        document.getElementById('botaoConfirmar').disabled = true;
        return;
    }

    let total = 0;

    carrinho.forEach(produto => {
        const subtotal = Number(produto.preco_produto) *
            Number(produto.quantidade);

        total += subtotal;

        const item = document.createElement('div');
        item.className = 'item-checkout';

        const nome = document.createElement('span');
        nome.textContent = `${produto.nome_produto} (${produto.quantidade}x)`;

        const preco = document.createElement('strong');
        preco.textContent = formatarPreco(subtotal);

        item.appendChild(nome);
        item.appendChild(preco);

        lista.appendChild(item);
    });

    totalElemento.textContent = formatarPreco(total);
}

async function verificarSessao() {
    try {
        const resposta = await fetch(`${URL_API}/auth/sessao`, {
            credentials: 'include'
        });

        const dados = await resposta.json();

        if (!dados.autenticado || dados.usuario?.perfil !== 'cliente') {
            alert('Entre na sua conta de cliente para finalizar a compra.');
            window.location.href = '../login/login.html';
            return false;
        }

        return true;

    } catch (erro) {
        console.error('Erro ao verificar sessão:', erro);
        alert('Não foi possível verificar sua sessão.');
        window.location.href = '../carrinho/carrinho.html';
        return false;
    }
}

async function finalizarCompra(evento) {
    evento.preventDefault();

    const carrinho = obterCarrinho();
    const formaPagamento = document.getElementById('formaPagamento').value;
    const botao = document.getElementById('botaoConfirmar');
    const mensagem = document.getElementById('mensagem');

    if (carrinho.length === 0) {
        mensagem.textContent = 'Seu carrinho está vazio.';
        return;
    }

    if (!formaPagamento) {
        mensagem.textContent = 'Selecione uma forma de pagamento.';
        return;
    }

    botao.disabled = true;
    botao.textContent = 'Processando...';
    mensagem.textContent = '';

    try {
        const resposta = await fetch(`${URL_API}/pedido/finalizar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                produtos: carrinho.map(produto => ({
                    id_produto: produto.id_produto,
                    quantidade: produto.quantidade
                })),
                forma_pagamento: formaPagamento
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok || !dados.sucesso) {
            throw new Error(dados.mensagem || 'Não foi possível finalizar o pedido.');
        }

        localStorage.removeItem(CHAVE_CARRINHO);

        document.querySelector('.pagina-checkout').innerHTML = `
            <section class="confirmacao-pedido">
                <h1>Pedido realizado!</h1>
                <p>Seu pedido foi registrado com sucesso.</p>
                <p>Número do pedido: <strong>${dados.pedido.id_pedido}</strong></p>
                <p>Forma de pagamento: ${formaPagamento}</p>
                <p>Valor total: ${formatarPreco(dados.pedido.valor_total)}</p>
                <p>Status do pagamento: Pendente</p>
                <a href="../inicio/inicio.html">Voltar ao início</a>
            </section>
        `;

    } catch (erro) {
        console.error('Erro ao finalizar compra:', erro);
        mensagem.textContent = erro.message;
        botao.disabled = false;
        botao.textContent = 'Confirmar pedido';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const autenticado = await verificarSessao();

    if (!autenticado) return;

    mostrarResumo();

    document.getElementById('formPagamento')
        .addEventListener('submit', finalizarCompra);
});
