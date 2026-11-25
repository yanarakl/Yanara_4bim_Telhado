const URL_API = 'http://127.0.0.1:3001';
const CHAVE_CARRINHO = 'carrinhoGhibli';

function obterCarrinho() {
    return JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || [];
}

function salvarCarrinho(carrinho) {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
    atualizarQuantidadeCarrinho();
}

function atualizarQuantidadeCarrinho() {
    const carrinho = obterCarrinho();

    const quantidade = carrinho.reduce(
        (total, produto) => total + Number(produto.quantidade),
        0
    );

    const elemento = document.getElementById('quantidadeCarrinho');

    if (elemento) {
        elemento.textContent = quantidade;
    }
}

async function verificarSessao() {
    try {
        const resposta = await fetch(`${URL_API}/auth/sessao`, {
            method: 'GET',
            credentials: 'include'
        });

        const dados = await resposta.json();

        const botaoLogin = document.querySelector('.botaoLogin');
        const botaoCadastro = document.querySelector('.botaoCadastro');
        const navegacao = document.querySelector('.navegacao');

        if (dados.autenticado && dados.usuario) {
            if (botaoLogin) botaoLogin.remove();
            if (botaoCadastro) botaoCadastro.remove();

            if (!document.getElementById('botaoMinhaConta')) {
                const conta = document.createElement('a');
                conta.id = 'botaoMinhaConta';
                conta.className = 'botaoLogin';
                conta.textContent = 'Minha conta';

                conta.href = dados.usuario.perfil === 'funcionario'
                    ? '../../menu/menu.html'
                    : '../perfil/perfil.html';

                navegacao.appendChild(conta);
            }
        }
    } catch (erro) {
        console.error('Erro ao verificar sessão:', erro);
    }
}

async function listarCategorias() {
    const container = document.getElementById('categorias');

    try {
        const respostaCategorias = await fetch(`${URL_API}/categoria/listar`);
        const dadosCategorias = await respostaCategorias.json();

        const respostaProdutos = await fetch(`${URL_API}/produto/listar`);
        const dadosProdutos = await respostaProdutos.json();

        if (!respostaCategorias.ok || !respostaProdutos.ok) {
            throw new Error('Não foi possível carregar os produtos.');
        }

        mostrarCategorias(
            dadosCategorias.categorias,
            dadosProdutos.produtos
        );

    } catch (erro) {
        console.error('Erro ao buscar os dados:', erro);

        container.innerHTML = `
            <p class="carregando">
                Não foi possível carregar o cardápio.
                Tente novamente.
            </p>
        `;
    }

    atualizarQuantidadeCarrinho();
}

function mostrarCategorias(categorias, produtos) {
    const container = document.getElementById('categorias');
    window.produtosCarregados = produtos;

    container.innerHTML = '';

    categorias.forEach(categoria => {
        const produtosCategoria = produtos.filter(produto =>
            String(produto.id_categoria) === String(categoria.id_categoria)
        );

        if (produtosCategoria.length === 0) {
            return;
        }

        const section = document.createElement('section');
        section.className = 'categoria';

        const titulo = document.createElement('h2');
        titulo.textContent = categoria.nome_categoria;

        const carrossel = document.createElement('div');
        carrossel.className = 'carrossel';

        produtosCategoria.forEach(produto => {
            const card = document.createElement('div');
            card.className = 'produto';

            const imagem = document.createElement('img');
            imagem.src = `../../imagens/${produto.id_produto}.png`;
            imagem.alt = produto.nome_produto;

            imagem.onerror = function () {
                this.style.display = 'none';
            };

            const nome = document.createElement('h3');
            nome.textContent = produto.nome_produto;

            const descricao = document.createElement('p');
            descricao.textContent = produto.descricao_produto || '';

            const preco = document.createElement('p');
            preco.className = 'preco-produto';
            preco.textContent = Number(produto.preco_produto)
                .toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                });

            const controles = document.createElement('div');
            controles.className = 'controles-produto';

            card.appendChild(imagem);
            card.appendChild(nome);
            card.appendChild(descricao);
            card.appendChild(preco);
            card.appendChild(controles);

            carrossel.appendChild(card);

            atualizarControlesProduto(produto, controles);
        });

        section.appendChild(titulo);
        section.appendChild(carrossel);

        container.appendChild(section);
    });
}

function atualizarControlesProduto(produto, container) {
    const carrinho = obterCarrinho();

    const produtoExistente = carrinho.find(item =>
        String(item.id_produto) === String(produto.id_produto)
    );

    container.innerHTML = '';

    if (!produtoExistente) {
        const botaoAdicionar = document.createElement('button');
        botaoAdicionar.textContent = 'Adicionar ao carrinho';

        botaoAdicionar.addEventListener('click', () => {
            adicionarAoCarrinho(produto);
        });

        container.appendChild(botaoAdicionar);
        return;
    }

    const diminuir = document.createElement('button');
    diminuir.textContent = '−';

    diminuir.addEventListener('click', () => {
        alterarQuantidade(produto.id_produto, -1);
    });

    const quantidade = document.createElement('span');
    quantidade.textContent = produtoExistente.quantidade;

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

    container.appendChild(diminuir);
    container.appendChild(quantidade);
    container.appendChild(aumentar);
    container.appendChild(remover);
}

function atualizarTodosOsControles() {
    document.querySelectorAll('.produto').forEach(card => {
        const nome = card.querySelector('h3')?.textContent;
        const produto = window.produtosCarregados?.find(item =>
            item.nome_produto === nome
        );

        if (produto) {
            const controles = card.querySelector('.controles-produto');
            atualizarControlesProduto(produto, controles);
        }
    });
}

function adicionarAoCarrinho(produto) {
    const carrinho = obterCarrinho();

    const produtoExistente = carrinho.find(item =>
        String(item.id_produto) === String(produto.id_produto)
    );

    if (produtoExistente) {
        produtoExistente.quantidade++;
    } else {
        carrinho.push({
            id_produto: produto.id_produto,
            nome_produto: produto.nome_produto,
            preco_produto: Number(produto.preco_produto),
            quantidade: 1
        });
    }

    salvarCarrinho(carrinho);
    atualizarTodosOsControles();
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
    atualizarTodosOsControles();
}

function removerProduto(idProduto) {
    const carrinho = obterCarrinho().filter(produto =>
        String(produto.id_produto) !== String(idProduto)
    );

    salvarCarrinho(carrinho);
    atualizarTodosOsControles();
}

document.addEventListener('DOMContentLoaded', () => {
    verificarSessao();
    atualizarQuantidadeCarrinho();
});

window.addEventListener('storage', () => {
    atualizarQuantidadeCarrinho();
    atualizarTodosOsControles();
});
