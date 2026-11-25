
DROP TABLE IF EXISTS produto, categoria, pessoa, funcionario, cliente, pedido, item_pedido, pagamento;

CREATE TABLE categoria (
    id_categoria INTEGER PRIMARY KEY,
    nome_categoria VARCHAR(100) NOT NULL,
    descricao_categoria VARCHAR(255)
);

CREATE TABLE produto (
    id_produto INTEGER PRIMARY KEY,
    nome_produto VARCHAR(100) NOT NULL,
    descricao_produto VARCHAR(255),
    preco_produto NUMERIC(10, 2) NOT NULL,
    id_categoria INT NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);

CREATE TABLE pessoa (
    cpf VARCHAR(14) PRIMARY KEY,
    nome VARCHAR(100),
    telefone VARCHAR(20) CHECK (telefone ~ '^[0-9]{11}$') NULL,
    email VARCHAR(100) UNIQUE,
    senha VARCHAR(255)
);

CREATE TABLE funcionario (
    id_funcionario SERIAL PRIMARY KEY,
    cpf VARCHAR(14) UNIQUE,
    cargo VARCHAR(50) NOT NULL,
    FOREIGN KEY (cpf)
        REFERENCES pessoa(cpf)
);

CREATE TABLE cliente (
    id_cliente SERIAL PRIMARY KEY,
    cpf VARCHAR(14) UNIQUE,
    FOREIGN KEY (cpf)
        REFERENCES pessoa(cpf)
);

CREATE TABLE pedido (
    id_pedido INTEGER PRIMARY KEY,
    data_hora TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    id_cliente INTEGER,
    FOREIGN KEY (id_cliente)
        REFERENCES cliente(id_cliente)
        ON DELETE SET NULL
);

CREATE TABLE item_pedido (
    id_item SERIAL PRIMARY KEY,
    id_pedido INTEGER NOT NULL,
    id_produto INTEGER NOT NULL,
    quantidade INTEGER NOT NULL,
    preco_unitario NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    FOREIGN KEY (id_pedido)
        REFERENCES pedido(id_pedido),
    FOREIGN KEY (id_produto)
        REFERENCES produto(id_produto)
);

CREATE TABLE pagamento (
    id_pagamento INTEGER PRIMARY KEY,
    id_pedido INTEGER NOT NULL UNIQUE,
    forma_pagamento VARCHAR(20) NOT NULL,
    valor NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    FOREIGN KEY (id_pedido)
        REFERENCES pedido(id_pedido)
);