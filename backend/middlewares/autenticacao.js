const crypto = require('crypto');

const CHAVE_SECRETA =
    process.env.SESSION_SECRET || 'chave-temporaria-do-projeto-ghibli';

const NOME_COOKIE = 'sessao';
const TEMPO_SESSAO = 24 * 60 * 60; // 24 horas

// Gera uma assinatura para os dados da sessão.
function gerarAssinatura(dados) {
    return crypto
        .createHmac('sha256', CHAVE_SECRETA)
        .update(dados)
        .digest('base64url');
}

// Cria a sessão e envia o cookie para o navegador.
function salvarSessao(res, usuario) {
    const dados = Buffer.from(
        JSON.stringify({
            ...usuario,
            exp: Date.now() + TEMPO_SESSAO * 1000
        })
    ).toString('base64url');

    const assinatura = gerarAssinatura(dados);
    const token = `${dados}.${assinatura}`;

    res.setHeader(
        'Set-Cookie',
        `${NOME_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${TEMPO_SESSAO}; SameSite=Lax`
    );
}

// Lê e verifica a sessão enviada pelo navegador.
function lerSessao(req) {
    const cookies = req.headers.cookie || '';

    const cookie = cookies
        .split(';')
        .map(item => item.trim())
        .find(item => item.startsWith(`${NOME_COOKIE}=`));

    if (!cookie) {
        return null;
    }

    try {
        const token = cookie.substring(NOME_COOKIE.length + 1);
        const partes = token.split('.');

        if (partes.length !== 2) {
            return null;
        }

        const [dados, assinaturaRecebida] = partes;
        const assinaturaEsperada = gerarAssinatura(dados);

        const assinaturaBuffer = Buffer.from(assinaturaRecebida);
        const esperadaBuffer = Buffer.from(assinaturaEsperada);

        if (
            assinaturaBuffer.length !== esperadaBuffer.length ||
            !crypto.timingSafeEqual(assinaturaBuffer, esperadaBuffer)
        ) {
            return null;
        }

        const usuario = JSON.parse(
            Buffer.from(dados, 'base64url').toString('utf8')
        );

        if (!usuario.exp || usuario.exp < Date.now()) {
            return null;
        }

        delete usuario.exp;

        return usuario;

    } catch (erro) {
        return null;
    }
}

// Middleware que verifica se o usuário está logado.
function verificarSessao(req, res, next) {
    const usuario = lerSessao(req);

    if (!usuario) {
        return res.status(401).json({
            mensagem: 'Faça login para acessar esta página.'
        });
    }

    req.usuario = usuario;
    next();
}

// Apaga o cookie e encerra a sessão.
function encerrarSessao(res) {
    res.setHeader(
        'Set-Cookie',
        `${NOME_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
    );
}

module.exports = {
    salvarSessao,
    lerSessao,
    verificarSessao,
    encerrarSessao
};