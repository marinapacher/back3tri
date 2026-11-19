-- TABELA CLIENTE

CREATE TABLE cliente
(
id INT PRIMARY KEY AUTO_INCREMENT,
nome VARCHAR(50) NOT NULL,
cpf CHAR(14) NOT NULL UNIQUE,
celular CHAR(14) NOT NULL,
email VARCHAR(50) NOT NULL UNIQUE,
senha VARCHAR(512) NOT NULL
);

DROP TABLE cliente;

INSERT INTO cliente (
nome, cpf, celular, email, senha
) VALUES

("Marina Pacher", "666.777.444-69", "(42)66666-4444", "marina@pacher.arte", "amogatoslisoslindos777"),
("Isadora", "111.222.333-44", "(41)98888-1111", "isadora.silva@email.com", "isadora123"),
("João", "222.333.444-55", "(42)97777-2222", "joao.santos@email.com", "joao456"),
("Mariana", "333.444.555-66", "(43)96666-3333", "mariana.oliveira@email.com", "mariana789"),
("Lucas", "444.555.666-77", "(44)95555-4444", "lucas.almeida@email.com", "lucas321"),
("Ana", "555.666.777-88", "(45)94444-5555", "ana.costa@email.com", "ana987"),
("Pedro", "777.888.999-00", "(46)93333-6666", "pedro.rocha@email.com", "pedro654"),
("Beatriz", "888.999.000-11", "(47)92222-7777", "beatriz.martins@email.com", "bia2026"),
("Gabriel", "999.000.111-22", "(48)91111-8888", "gabriel.lima@email.com", "gabriel111"),
("Larissa", "123.456.789-10", "(49)90000-9999", "larissa.souza@email.com", "larissa555"),
("Rafael", "987.654.321-00", "(40)98888-0000", "rafael.pereira@email.com", "rafael999");


SELECT email, senha FROM cliente;


SELECT email, senha FROM cliente WHERE email = "ana.silva@email.com";


SELECT * FROM cliente


SELECT * FROM cliente WHERE id <= 10 AND LENGTH(senha) > 20;


DELETE FROM cliente WHERE id = 11;


UPDATE cliente SET nome = "Marina Pacher", email = "marina@pacher.arte" WHERE id = 1;

-- TABELA ENDERECO

CREATE TABLE endereco
(
    id INT PRIMARY KEY AUTO_INCREMENT,
    idCliente INT NOT NULL,
    numero INT NOT NULL,
    rua VARCHAR(100) NOT NULL,
    bairro VARCHAR(50) NOT NULL,
    cidade VARCHAR(50) NOT NULL,
    estado VARCHAR(50) NOT NULL,

    FOREIGN KEY (idcliente) REFERENCES cliente(id)
);

-- TABELA PRODUTO

CREATE TABLE produto
(
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    caminho_img VARCHAR(255),
    quantidade_img INT NOT NULL
);

INSERT INTO produto
(nome, descricao, categoria, preco, caminho_img, quantidade_img)
VALUES
('Tela Azul Profunda', 'Óleo sobre tela, abstrato em tons de azul.', 'Pintura', 1500.00, 'img/obra-01.png', 3),
('Escultura em Bronze', 'Escultura abstrata em bronze fundido.', 'Escultura', 3500.00, 'img/obra-02.png', 2),
('Desenho a Carvão', 'Estudo de figura humana a carvão sobre papel.', 'Desenho', 450.00, 'img/obra-03.png', 5),
('Fotografia Preto e Branco', 'Paisagem urbana capturada em película B&W.', 'Fotografia', 800.00, 'img/obra-04.png', 8),
('Gravura em Madeira', 'Xilogravura com tema da natureza.', 'Gravura', 600.00, 'img/obra-05.png', 10),
('Instalação de Luz', 'Instalação luminosa com LEDs e metal.', 'Instalação', 2200.00, 'img/obra-06.png', 1),
('Aquarela Floral', 'Estudo botânico em aquarela sobre papel.', 'Pintura', 700.00, 'img/obra-07.png', 4),
('Escultura em Madeira', 'Figura entalhada em madeira de reflorestamento.', 'Escultura', 1800.00, 'img/obra-08.png', 3),
('Desenho a Tinta', 'Ilustração a nanquim sobre papel.', 'Desenho', 500.00, 'img/obra-09.png', 6),
('Fotografia Colorida', 'Retrato em impressão fine art.', 'Fotografia', 950.00, 'img/obra-10.png', 7),
('Gravura em Metal', 'Água-forte com tema celestial.', 'Gravura', 750.00, 'img/obra-11.png', 5),
('Instalação Sonora', 'Obra sonora com objetos encontrados.', 'Instalação', 3000.00, 'img/obra-12.png', 1),
('Óleo sobre Tela', 'Paisagem urbana em óleo sobre tela.', 'Pintura', 2100.00, 'img/obra-13.png', 2),
('Escultura em Argila', 'Peça cerâmica queimada em alto-forno.', 'Escultura', 900.00, 'img/obra-14.png', 4),
('Desenho a Lápis', 'Estudo anatômico a lápis grafite.', 'Desenho', 350.00, 'img/obra-15.png', 8),
('Fotografia Analógica', 'Cena de rua em película 35mm.', 'Fotografia', 1100.00, 'img/obra-16.png', 3),
('Litografia', 'Impressão em pedra litográfica.', 'Gravura', 850.00, 'img/obra-17.png', 6),
('Instalação de Vídeo', 'Projeção em loop com som ambiente.', 'Instalação', 2800.00, 'img/obra-18.png', 1),
('Acrílico sobre Tela', 'Obra abstrata em acrílico vibrante.', 'Pintura', 1600.00, 'img/obra-19.png', 4),
('Escultura em Pedra', 'Figura esculpida em mármore branco.', 'Escultura', 4200.00, 'img/obra-20.png', 2),
('Desenho a Giz', 'Estudo de natureza morta a giz pastel.', 'Desenho', 480.00, 'img/obra-21.png', 7),
('Fotografia Digital', 'Impressão em papel de algodão.', 'Fotografia', 780.00, 'img/obra-22.png', 5),
('Serigrafia', 'Edição limitada em tela de seda.', 'Gravura', 520.00, 'img/obra-23.png', 9),
('Instalação Imersiva', 'Ambiente com múltiplos elementos sensoriais.', 'Instalação', 3800.00, 'img/obra-24.png', 1),
('Mista sobre Tela', 'Colagem e tinta sobre tela.', 'Pintura', 1300.00, 'img/obra-25.png', 3),
('Escultura em Ferro', 'Peça abstrata em ferro soldado.', 'Escultura', 2500.00, 'img/obra-26.png', 2),
('Desenho Digital', 'Ilustração criada em tabela digital.', 'Desenho', 390.00, 'img/obra-27.png', 6),
('Fotografia de Rua', 'Impressão baryta de cena urbana.', 'Fotografia', 870.00, 'img/obra-28.png', 4),
('Monotipia', 'Peça única em monotipia sobre papel.', 'Gravura', 650.00, 'img/obra-29.png', 1),
('Instalação Cinética', 'Obra com elementos em movimento.', 'Instalação', 3200.00, 'img/obra-30.png', 1);

-- TABELA COMPRA

CREATE TABLE compra
(
    id INT PRIMARY KEY AUTO_INCREMENT,
    idCliente INT NOT NULL,
    idEndereco INT NOT NULL,
    data DATE NOT NULL,
    forma_pagamento VARCHAR(50) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (idcliente) REFERENCES cliente(id),
    FOREIGN KEY (idendereco) REFERENCES endereco(id)
);

-- TABELA PRODUTO COMPRA

CREATE TABLE produtocompra
(
    idproduto INT NOT NULL,
    idcompra INT NOT NULL,
    quantidade INT NOT NULL,
    valor_unitario DECIMAL(10,2) NOT NULL,

    PRIMARY KEY (idproduto, idcompra),

    FOREIGN KEY (idproduto) REFERENCES produto(id),
    FOREIGN KEY (idcompra) REFERENCES compra(id)
);
