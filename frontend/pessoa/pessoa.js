const URL_API = 'http://localhost:3001';
let pessoa = null;
let oQueEstaFazendo = '';

function abrirMenu() {
    window.location = "/frontend/menu/menu.html";
};
function abrirProduto() {
    window.location = "/frontend/produto/produto.html";
};
function abrirPessoa() {
    window.location = "/frontend/pessoa/pessoa.html";
};
function abrirPedido() {
    window.location = "/frontend/pedido/pedido.html";
};
function abrirPagamento() {
    window.location = "/frontend/pagamento/pagamento.html";
};

function controlarCargo() {
    const funcionario = document.getElementById("checkboxFuncionario").checked;
    const campoCargo = document.getElementById("cargo_id_cargo");

    campoCargo.style.display = funcionario ? "inline" : "none";
    campoCargo.disabled = !funcionario;
}

async function procurePorChavePrimaria(chave) {
    try {
        const resposta = await fetch(`${URL_API}/pessoa/${chave}`);
        const data = await resposta.json();
        return data.sucesso ? data.pessoa : null;
    } catch (erro) {
        return null;
    }
}

async function procure() {
    const cpf = document.getElementById("InputCpf").value;
    if (cpf === '') {
        mostrarAviso("O CPF não pode ficar vazio.");
        return;
    }

    pessoa = await procurePorChavePrimaria(cpf);
    oQueEstaFazendo = '';

    if (pessoa) {
        mostrarDadosPessoa(pessoa);
        visibilidadeDosBotoes('inline', 'none', 'inline', 'inline', 'none');
        mostrarAviso("Achou no banco, pode alterar ou excluir");
    } else {
        limparAtributos();
        visibilidadeDosBotoes('inline', 'inline', 'none', 'none', 'none');
        mostrarAviso("Não achou no banco, pode inserir");
    }
}

function inserir() {
    oQueEstaFazendo = 'inserindo';
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    mostrarAviso("INSERINDO - Preencha os dados e clique em salvar");
}

function alterar() {
    oQueEstaFazendo = 'alterando';
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    mostrarAviso("ALTERANDO - Altere os dados e clique em salvar");
}

function excluir() {
    bloquearAtributos(true);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'excluindo';
    mostrarAviso("EXCLUINDO - Clique em salvar para confirmar a exclusão");
}

async function funcaoEhFuncionario(cpf) {
    const resp = await fetch(`${URL_API}/funcionario/${cpf}`);

    if (resp.status === 404) {
        return false;
    }

    if (!resp.ok) {
        throw new Error("Erro ao consultar funcionário.");
    }

    return true;
}

async function funcaoEhCliente(cpf) {
    const resp = await fetch(`${URL_API}/cliente/${cpf}`);

    if (resp.status === 404) {
        return false;
    }

    if (!resp.ok) {
        throw new Error("Erro ao consultar cliente.");
    }

    return true;
}

async function salvar() {
    const cpf = document.getElementById("InputCpf").value;
    const nome = document.getElementById("InputNome").value;
    const telefone = document.getElementById("InputTelefone").value;
    const email = document.getElementById("InputEmail").value;
    const senha = document.getElementById("InputSenha").value;

    const funcionario = document.getElementById("checkboxFuncionario").checked;
    const cliente = document.getElementById("checkboxCliente").checked;
    const cargo = document.getElementById("cargo_id_cargo").value;

    if (telefone.length !== 11) {
        mostrarAviso("O telefone deve ter 11 dígitos, incluindo o DDD.");
        return;
    }

    if (!cpfValido(cpf)) {
        mostrarAviso("CPF inválido!");
        return;
    }

    if (funcionario && cargo === '') {
        mostrarAviso("Selecione um cargo para o funcionário.");
        return;
    }

    const dadosPessoa = { cpf, nome, telefone, email, senha };
    const dadosPessoaSenha = { cpf, nome, telefone, email };
    const dadosFuncionario = { cpf, cargo };
    const dadosCliente = { cpf };

    try {
        if (oQueEstaFazendo === 'inserindo') {

            const resp = await fetch(`${URL_API}/pessoa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosPessoa)
            });

            const data = await resp.json();

            if (!data.sucesso) {
                return mostrarAviso(data.mensagem);
            }

            if (funcionario) {
                const respo = await fetch(`${URL_API}/funcionario`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosFuncionario)
                });

                const dataFuncionario = await respo.json();

                if (!dataFuncionario.sucesso) {
                    return mostrarAviso(dataFuncionario.mensagem);
                }
            }

            if (cliente) {
                const respoCliente = await fetch(`${URL_API}/cliente`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosCliente)
                });

                const dataCliente = await respoCliente.json();

                if (!dataCliente.sucesso) {
                    return mostrarAviso(dataCliente.mensagem);
                }
            }

            mostrarAviso("Inserido no Banco de Dados com sucesso!");
        }

        else if (oQueEstaFazendo === 'alterando') {

            const resp = await fetch(`${URL_API}/pessoa/${cpf}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosPessoaSenha)
            });

            const data = await resp.json();

            if (!data.sucesso) {
                return mostrarAviso(data.mensagem);
            }

            // Verifica se já existe um vínculo de funcionário
            const jaEhFuncionario = await funcaoEhFuncionario(cpf);

            if (funcionario) {
                if (jaEhFuncionario) {
                    const respo = await fetch(`${URL_API}/funcionario/${cpf}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dadosFuncionario)
                    });

                    const dataFuncionario = await respo.json();

                    if (!dataFuncionario.sucesso) {
                        return mostrarAviso(dataFuncionario.mensagem);
                    }
                } else {
                    const respo = await fetch(`${URL_API}/funcionario`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dadosFuncionario)
                    });

                    const dataFuncionario = await respo.json();

                    if (!dataFuncionario.sucesso) {
                        return mostrarAviso(dataFuncionario.mensagem);
                    }
                }
            } else if (jaEhFuncionario) {
                await fetch(`${URL_API}/funcionario/${cpf}`, {
                    method: 'DELETE'
                });
            }

            // Verifica se já existe um vínculo de cliente
            const jaEhCliente = await funcaoEhCliente(cpf);

            if (cliente) {
                if (jaEhCliente) {
                    const respoCliente = await fetch(`${URL_API}/cliente/${cpf}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dadosCliente)
                    });

                    const dataCliente = await respoCliente.json();

                    if (!dataCliente.sucesso) {
                        return mostrarAviso(dataCliente.mensagem);
                    }
                } else {
                    const respoCliente = await fetch(`${URL_API}/cliente`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dadosCliente)
                    });

                    const dataCliente = await respoCliente.json();

                    if (!dataCliente.sucesso) {
                        return mostrarAviso(dataCliente.mensagem);
                    }
                }
            } else if (jaEhCliente) {
                await fetch(`${URL_API}/cliente/${cpf}`, {
                    method: 'DELETE'
                });
            }

            mostrarAviso("Alterado no Banco de Dados com sucesso!");
        }

        else if (oQueEstaFazendo === 'excluindo') {

            if (await funcaoEhFuncionario(cpf)) {
                await fetch(`${URL_API}/funcionario/${cpf}`, {
                    method: 'DELETE'
                });
            }

            if (await funcaoEhCliente(cpf)) {
                await fetch(`${URL_API}/cliente/${cpf}`, {
                    method: 'DELETE'
                });
            }

            const resp = await fetch(`${URL_API}/pessoa/${cpf}`, {
                method: 'DELETE'
            });

            const data = await resp.json();

            if (!data.sucesso) {
                return mostrarAviso(data.mensagem);
            }

            mostrarAviso("Excluído do Banco de Dados com sucesso!");
        }

        visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
        limparAtributos();
        document.getElementById("InputCpf").value = "";
        listar();

    } catch (erro) {
        mostrarAviso("Erro ao realizar a operação: " + erro.message);
    }
}

async function listar() {
    try {
        const resposta = await fetch(`${URL_API}/pessoa/listar`);

        const data = await resposta.json();

        if (data.sucesso) {
            let texto = "";

            for (let linha of data.pessoas) {
                texto += `
                    <div class="pessoa-card">
                        <span class="pessoa-cpf">CPF: ${linha.cpf}</span>

                        <div class="pessoa-info">
                            <h5>${linha.nome}</h5>
                            <p>Telefone: ${linha.telefone}</p>
                            <p>E-mail: ${linha.email}</p>
                        </div>
                    </div>
                `;
            }

            document.getElementById("outputSaida").innerHTML =
                texto || "Nenhuma pessoa cadastrada.";
        } else {
            document.getElementById("outputSaida").innerHTML =
                `Erro no banco: ${data.mensagem}`;
        }

    } catch (erro) {
        console.error("Erro ao listar:", erro);
        document.getElementById("outputSaida").innerHTML =
            "Servidor offline ou erro de conexão (CORS).";
    }
}

function cancelarOperacao() {
    limparAtributos();
    bloquearAtributos(true);
    visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
    mostrarAviso("Cancelou a operação");
}

function mostrarAviso(mensagem) {
    document.getElementById("divAviso").innerHTML = mensagem;
}

function mostrarDadosPessoa(u) {
    document.getElementById("InputCpf").value = u.cpf;
    document.getElementById("InputNome").value = u.nome;
    document.getElementById("InputTelefone").value = u.telefone;
    document.getElementById("InputEmail").value = u.email;
    document.getElementById("InputSenha").value = "";

    document.getElementById("checkboxFuncionario").checked =
        u.id_funcionario !== null;

    document.getElementById("checkboxCliente").checked =
        u.id_cliente !== null;

    if (u.id_funcionario !== null) {
        document.getElementById("cargo_id_cargo").value = u.cargo;
    }

    bloquearAtributos(true);
    controlarCargo();
}

function limparAtributos() {
    pessoa = null;
    oQueEstaFazendo = '';

    document.getElementById("InputCpf").value = "";
    document.getElementById("InputNome").value = "";
    document.getElementById("InputTelefone").value = "";
    document.getElementById("InputEmail").value = "";
    document.getElementById("InputSenha").value = "";

    document.getElementById("checkboxFuncionario").checked = false;
    document.getElementById("checkboxCliente").checked = false;
    document.getElementById("cargo_id_cargo").value = "";

    bloquearAtributos(true);
    controlarCargo();
}

function bloquearAtributos(soLeitura) {
    document.getElementById("InputCpf").readOnly = !soLeitura;
    document.getElementById("InputNome").readOnly = soLeitura;
    document.getElementById("InputTelefone").readOnly = soLeitura;
    document.getElementById("InputEmail").readOnly = soLeitura;
    document.getElementById("InputSenha").readOnly =
        soLeitura || oQueEstaFazendo !== "inserindo";
    document.getElementById("checkboxFuncionario").disabled = soLeitura;
    document.getElementById("checkboxCliente").disabled = soLeitura;
    document.getElementById("cargo_id_cargo").disabled = soLeitura;
}

function visibilidadeDosBotoes(btP, btI, btA, btE, btS) {
    document.getElementById("btProcure").style.display = btP;
    document.getElementById("btInserir").style.display = btI;
    document.getElementById("btAlterar").style.display = btA;
    document.getElementById("btExcluir").style.display = btE;
    document.getElementById("btSalvar").style.display = btS;
    document.getElementById("btCancelar").style.display = btS;
}
function cpfValido(cpf) {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf[i]) * (10 - i);
    }

    let resto = (soma * 10) % 11;
    if (resto === 10) {
        resto = 0;
    }
    if (resto !== parseInt(cpf[9])) {
        return false;
    }

    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf[i]) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10) {
        resto = 0;
    }
    return resto === parseInt(cpf[10]);
}