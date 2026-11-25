-- =========================================
-- 1. CATEGORIAS
-- =========================================

INSERT INTO categoria (id_categoria, nome_categoria, descricao_categoria)
VALUES
(1, 'Refeições', 'Pratos principais'),
(2, 'Tortas e massas', 'Tortas e pratos com massa'),
(3, 'Café da manhã', 'Opções para o café da manhã'),
(4, 'Acompanhamentos', 'Acompanhamentos e pequenas porções'),
(5, 'Sopas', 'Sopas e caldos'),
(6, 'Bolos e sobremesas', 'Doces e sobremesas'),
(7, 'Biscoitos', 'Biscoitos e pequenos doces'),
(8, 'Bebidas quentes', 'Cafés e chás'),
(9, 'Bebidas frias', 'Leites, sucos e águas'),
(10, 'Lanches especiais', 'Lanches e pratos especiais');


-- =========================================
-- 2. PRODUTOS
-- =========================================

INSERT INTO produto
(id_produto, nome_produto, descricao_produto, preco_produto, id_categoria)
VALUES
(1, 'Ramen do Sosuke', 'Ramen inspirado no filme Ponyo', 32.00, 1),
(2, 'Torta de Arenque', 'Torta salgada de peixe', 28.00, 2),
(3, 'Ovos com Bacon', 'Ovos e bacon preparados na frigideira', 24.00, 3),
(4, 'Bento da Satsuki', 'Refeição japonesa em caixa', 30.00, 1),
(5, 'Onigiri', 'Bolinho japonês de arroz', 12.00, 4),
(6, 'Pão com Leite', 'Pão macio acompanhado de leite', 10.00, 3),
(7, 'Sopa Caseira', 'Sopa de legumes', 18.00, 5),
(8, 'Peixe Assado', 'Peixe assado acompanhado de legumes', 36.00, 1),
(9, 'Bolo de Chocolate', 'Fatia de bolo de chocolate', 14.00, 6),
(10, 'Bolo do Castelo', 'Bolo especial da casa', 16.00, 6),
(11, 'Biscoitos da Casa', 'Porção de biscoitos artesanais', 8.00, 7),
(12, 'Leite', 'Leite gelado', 7.00, 9),
(13, 'Chá', 'Chá quente da casa', 6.00, 8),
(14, 'Café', 'Café tradicional', 7.00, 8),
(15, 'Suco Natural', 'Suco de frutas', 9.00, 9),
(16, 'Água', 'Água mineral', 5.00, 9),
(17, 'Sanduíche da Kiki', 'Sanduíche especial da casa', 22.00, 10),
(18, 'Panqueca', 'Panqueca preparada na hora', 20.00, 10),
(19, 'Maçã Caramelizada', 'Maçã com cobertura caramelizada', 11.00, 10),
(20, 'Pudim', 'Pudim de leite', 12.00, 6),
(21, 'Combo Especial', 'Combinação de produtos da casa', 45.00, 10);


-- =========================================
-- 3. PESSOAS
-- =========================================

INSERT INTO pessoa (cpf, nome, telefone, email, senha)
VALUES
('12345678062', 'Ana Oliveira', '44991234567', 'ana@email.com', 'teste123'),
('12345678143', 'Bruno Santos', '44992345678', 'bruno@email.com', 'teste123'),
('12345678224', 'Clara Mendes', '44993456789', 'clara@email.com', 'teste123'),
('12345678305', 'Daniel Costa', '44994567890', 'daniel@email.com', 'teste123'),
('12345678496', 'Eduarda Lima', '44995678901', 'eduarda@email.com', 'teste123'),
('12345678577', 'Felipe Rocha', '44996789012', 'felipe@email.com', 'teste123'),
('12345678658', 'Gabriela Alves', '44997890123', 'gabriela@email.com', 'teste123'),
('12345678739', 'Henrique Souza', '44998901234', 'henrique@email.com', 'teste123'),
('12345678810', 'Isabela Martins', '44999012345', 'isabela@email.com', 'teste123'),
('12345678909', 'João Pereira', '44990123456', 'joao@email.com', 'teste123'),
('12345679034', 'Karen Ferreira', '44991234568', 'karen@email.com', 'teste123'),
('12345679115', 'Lucas Ribeiro', '44992345679', 'lucas@email.com', 'teste123'),
('12345679204', 'Mariana Castro', '44993456780', 'mariana@email.com', 'teste123'),
('12345679387', 'Nicolas Barros', '44994567801', 'nicolas@email.com', 'teste123'),
('12345679468', 'Olivia Gomes', '44995678902', 'olivia@email.com', 'teste123'),
('12345679549', 'Pedro Almeida', '44996789013', 'pedro@email.com', 'teste123'),
('12345679620', 'Rafaela Dias', '44997890124', 'rafaela@email.com', 'teste123'),
('12345679700', 'Samuel Nunes', '44998901235', 'samuel@email.com', 'teste123'),
('12345679891', 'Tatiane Melo', '44999012346', 'tatiane@email.com', 'teste123'),
('12345679972', 'Vinicius Lopes', '44990123457', 'vinicius@email.com', 'teste123');


-- =========================================
-- 4. CLIENTES
-- =========================================

INSERT INTO cliente (cpf)
VALUES
('12345678062'),
('12345678143'),
('12345678305'),
('12345678496'),
('12345678658'),
('12345678810'),
('12345679034'),
('12345679204'),
('12345679468'),
('12345679620'),
('12345679891'),
('12345679972');


-- =========================================
-- 5. FUNCIONÁRIOS
-- =========================================

INSERT INTO funcionario (cpf, cargo)
VALUES
('12345678224', 'Cozinheiro'),
('12345678305', 'Gerente'),
('12345678577', 'Atendente'),
('12345678739', 'Caixa'),
('12345678909', 'Auxiliar de cozinha'),
('12345679115', 'Cozinheiro');


-- =========================================
-- 6. PEDIDOS
-- =========================================

INSERT INTO pedido
(id_pedido, data_hora, status, valor_total, id_cliente)
SELECT
    dados.id_pedido,
    dados.data_hora,
    dados.status,
    dados.valor_total,
    cliente.id_cliente
FROM (
    VALUES
    (1, '2026-11-10 12:30:00'::timestamp, 'Entregue', 44.00, '12345678062'),
    (2, '2026-11-10 13:15:00'::timestamp, 'Entregue', 48.00, '12345678143'),
    (3, '2026-11-11 11:45:00'::timestamp, 'Entregue', 34.00, '12345678305'),
    (4, '2026-11-11 14:20:00'::timestamp, 'Entregue', 44.00, '12345678496'),
    (5, '2026-11-12 12:00:00'::timestamp, 'Pronto', 52.00, '12345678658'),
    (6, '2026-11-12 13:40:00'::timestamp, 'Em preparo', 37.00, '12345678810'),
    (7, '2026-11-13 12:10:00'::timestamp, 'Entregue', 39.00, '12345679034'),
    (8, '2026-11-14 15:30:00'::timestamp, 'Entregue', 37.00, '12345679204'),
    (9, '2026-11-15 11:50:00'::timestamp, 'Entregue', 64.00, '12345679468'),
    (10, '2026-11-16 12:25:00'::timestamp, 'Em preparo', 54.00, '12345679620')
) AS dados(id_pedido, data_hora, status, valor_total, cpf)
JOIN cliente ON cliente.cpf = dados.cpf;


-- =========================================
-- 7. ITENS DOS PEDIDOS
-- =========================================

INSERT INTO item_pedido
(id_pedido, id_produto, quantidade, preco_unitario, subtotal)
VALUES
-- Pedido 1: 44,00
(1, 1, 1, 32.00, 32.00),
(1, 5, 1, 12.00, 12.00),

-- Pedido 2: 48,00
(2, 2, 1, 28.00, 28.00),
(2, 9, 1, 14.00, 14.00),
(2, 13, 1, 6.00, 6.00),

-- Pedido 3: 34,00
(3, 3, 1, 24.00, 24.00),
(3, 6, 1, 10.00, 10.00),

-- Pedido 4: 44,00
(4, 4, 1, 30.00, 30.00),
(4, 15, 1, 9.00, 9.00),
(4, 16, 1, 5.00, 5.00),

-- Pedido 5: 52,00
(5, 8, 1, 36.00, 36.00),
(5, 10, 1, 16.00, 16.00),

-- Pedido 6: 37,00
(6, 7, 1, 18.00, 18.00),
(6, 20, 1, 12.00, 12.00),
(6, 12, 1, 7.00, 7.00),

-- Pedido 7: 39,00
(7, 17, 1, 22.00, 22.00),
(7, 11, 1, 8.00, 8.00),
(7, 15, 1, 9.00, 9.00),

-- Pedido 8: 37,00
(8, 18, 1, 20.00, 20.00),
(8, 19, 1, 11.00, 11.00),
(8, 13, 1, 6.00, 6.00),

-- Pedido 9: 64,00
(9, 21, 1, 45.00, 45.00),
(9, 9, 1, 14.00, 14.00),
(9, 16, 1, 5.00, 5.00),

-- Pedido 10: 54,00
(10, 1, 1, 32.00, 32.00),
(10, 6, 1, 10.00, 10.00),
(10, 20, 1, 12.00, 12.00);


-- =========================================
-- 8. PAGAMENTOS
-- =========================================

INSERT INTO pagamento
(id_pagamento, id_pedido, forma_pagamento, valor, status)
VALUES
(1, 1, 'Pix', 44.00, 'Aprovado'),
(2, 2, 'Cartão', 48.00, 'Aprovado'),
(3, 3, 'Dinheiro', 34.00, 'Aprovado'),
(4, 4, 'Pix', 44.00, 'Aprovado'),
(5, 5, 'Cartão', 52.00, 'Pendente'),
(6, 6, 'Pix', 37.00, 'Pendente'),
(7, 7, 'Dinheiro', 39.00, 'Aprovado'),
(8, 8, 'Pix', 37.00, 'Aprovado'),
(9, 9, 'Cartão', 64.00, 'Aprovado');