const URL_API = 'http://127.0.0.1:3001';
const CHAVE_CARRINHO = 'carrinhoGhibli';

function obterCarrinho() {
    return JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || [];
}

function salvarCarrinho(carrinho) {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
}

function formatarPreco(valor) {
    return Number(valor).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

async function verificarSessao() {
    try {
        const resposta = await fetch(`${URL_API}/auth/sessao`, {
            method: 'GET',
            credentials: 'include'
        });

        const dados = await resposta.json();

        const linkEntrar = document.querySelector(
            '.acoes-cabecalho a[href="../login/login.html"]'
        );

        const resumo = document.querySelector('.resumo-carrinho');

        if (dados.autenticado && dados.usuario) {
            if (linkEntrar) {
                linkEntrar.remove();
            }

            if (dados.usuario.perfil === 'cliente') {
                criarBotaoConcluir(resumo);
            }
        } else {
            removerBotaoConcluir();

            if (!linkEntrar) {
                const navegacao = document.querySelector('.acoes-cabecalho');

                const entrar = document.createElement('a');
                entrar.href = '../login/login.html';
                entrar.textContent = 'Entrar';

                navegacao.appendChild(entrar);
            }
        }
    } catch (erro) {
        console.error('Erro ao verificar sessão:', erro);
    }
}

function criarBotaoConcluir(resumo) {
    if (!resumo || document.getElementById('botaoConcluirCompra')) {
        return;
    }

    const botao = document.createElement('button');
    botao.type = 'button';
    botao.id = 'botaoConcluirCompra';
    botao.className = 'botao-concluir';
    botao.textContent = 'Concluir compra';

    botao.addEventListener('click', () => {
        if (obterCarrinho().length === 0) {
            alert('Adicione produtos ao carrinho antes de concluir a compra.');
            return;
        }

        window.location.href = '../checkout/checkout.html';
    });

    resumo.appendChild(botao);
}

function removerBotaoConcluir() {
    const botao = document.getElementById('botaoConcluirCompra');

    if (botao) {
        botao.remove();
    }
}

function mostrarCarrinho() {
    const carrinho = obterCarrinho();

    const lista = document.getElementById('listaCarrinho');
    const valorTotal = document.getElementById('valorTotal');

    lista.innerHTML = '';

    if (carrinho.length === 0) {
        lista.innerHTML = `
            <div class="carrinho-vazio">
                <h2>Seu carrinho está vazio.</h2>
                <p>Que tal escolher alguma coisa no nosso cardápio?</p>
                <a href="../inicio/inicio.html" class="botao-continuar">
                    Ver produtos
                </a>
            </div>
        `;

        valorTotal.textContent = formatarPreco(0);
        return;
    }

    let total = 0;

    carrinho.forEach(produto => {
        const subtotal = produto.preco_produto * produto.quantidade;
        total += subtotal;

        const item = document.createElement('div');
        item.className = 'item-carrinho';

        const imagem = document.createElement('img');
        imagem.className = 'imagem-produto-carrinho';
        imagem.src = `../../imagens/${produto.id_produto}.png`;
        imagem.alt = produto.nome_produto;

        imagem.onerror = function () {
            this.style.display = 'none';
        };

        const dados = document.createElement('div');
        dados.className = 'dados-produto';

        const nome = document.createElement('h3');
        nome.textContent = produto.nome_produto;

        const preco = document.createElement('p');
        preco.textContent = `Preço unitário: ${formatarPreco(produto.preco_produto)}`;

        const subtotalTexto = document.createElement('p');
        subtotalTexto.textContent = `Subtotal: ${formatarPreco(subtotal)}`;

        dados.appendChild(nome);
        dados.appendChild(preco);
        dados.appendChild(subtotalTexto);

        const controles = document.createElement('div');
        controles.className = 'controles-quantidade';

        const diminuir = document.createElement('button');
        diminuir.textContent = '−';
        diminuir.disabled = produto.quantidade <= 1;

        diminuir.addEventListener('click', () => {
            alterarQuantidade(produto.id_produto, -1);
        });

        const quantidade = document.createElement('span');
        quantidade.textContent = produto.quantidade;

        const aumentar = document.createElement('button');
        aumentar.textContent = '+';

        aumentar.addEventListener('click', () => {
            alterarQuantidade(produto.id_produto, 1);
        });

        const remover = document.createElement('button');
        remover.textContent = 'Remover';
        remover.className = 'botao-remover';

        remover.addEventListener('click', () => {
            removerProduto(produto.id_produto);
        });

        controles.appendChild(diminuir);
        controles.appendChild(quantidade);
        controles.appendChild(aumentar);
        controles.appendChild(remover);

        item.appendChild(imagem);
        item.appendChild(dados);
        item.appendChild(controles);

        lista.appendChild(item);
    });

    valorTotal.textContent = formatarPreco(total);
}

function alterarQuantidade(idProduto, alteracao) {
    const carrinho = obterCarrinho();

    const produto = carrinho.find(item =>
        String(item.id_produto) === String(idProduto)
    );

    if (!produto) return;

    produto.quantidade += alteracao;

    if (produto.quantidade <= 0) {
        removerProduto(idProduto);
        return;
    }

    salvarCarrinho(carrinho);
    mostrarCarrinho();
}

function removerProduto(idProduto) {
    const carrinho = obterCarrinho().filter(produto =>
        String(produto.id_produto) !== String(idProduto)
    );

    salvarCarrinho(carrinho);
    mostrarCarrinho();
}

function limparCarrinho() {
    const confirmar = confirm('Deseja realmente limpar o carrinho?');

    if (!confirmar) return;

    salvarCarrinho([]);
    mostrarCarrinho();
}

document
    .getElementById('limparCarrinho')
    .addEventListener('click', limparCarrinho);

document.addEventListener('DOMContentLoaded', () => {
    verificarSessao();
    mostrarCarrinho();
});
