const db = require("./db")

const ESTRUTURA_CLIENTE = `
CREATE TABLE IF NOT EXISTS cliente (
id int NOT NULL AUTO_INCREMENT,
nome varchar(50) NOT NULL,
cpf char(14) NOT NULL,
celular char(14) NOT NULL,
email varchar(50) NOT NULL,
senha varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
PRIMARY KEY (id),
UNIQUE KEY cpf (cpf),
UNIQUE KEY email (email)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;`

const DADOS_CLIENTE = `
INSERT INTO cliente VALUES 
(2,'Isadora','111.222.333-44','(41)98888-1111','isadora.silva@email.com','isadora123'),(3,'João','222.333.444-55','(42)97777-2222','joao.santos@email.com','joao456'),(4,'Mariana','333.444.555-66','(43)96666-3333','mariana.oliveira@email.com','$2b$10$dl68TJDYI9QGfygH.zSP7uuDo.YkQAabrBlmbW4LY3ZrdfpKqRXZ.'),
(5,'Lucas','444.555.666-77','(44)95555-4444','lucas.almeida@email.com','lucas321'),(6,'Ana','555.666.777-88','(45)94444-5555','ana.costa@email.com','ana987'),(7,'Pedro','777.888.999-00','(46)93333-6666','pedro.rocha@email.com','pedro654'),(8,'Beatriz','888.999.000-11','(47)92222-7777','beatriz.martins@email.com','bia2026'),(9,'Gabriel','999.000.111-22','(48)91111-8888','gabriel.lima@email.com','gabriel111'),(10,'Larissa','123.456.789-10','(49)90000-9999','larissa.souza@email.com','larissa555'),(12,'Ianzeen','11.322.322-44','(43)98888-1111','ianzeen.isadora@email.com','$2b$10$Mo.W9JRtsCskWxse/pNWuuM0q8IGwyNyFw/usAQ3rT/OEK7KZnDda');`
 
 const ESTRUTURA_PRODUTO = `
 CREATE TABLE IF NOT EXISTS produto (
    id int NOT NULL AUTO_INCREMENT,
    nome varchar(100) NOT NULL,
    descricao varchar(255) NOT NULL,
    categoria varchar(50) NOT NULL,
    preco decimal(10,2) NOT NULL,
    caminho_img varchar(255) DEFAULT NULL,
    quantidade_img int NOT NULL,
    PRIMARY KEY (id)
  ) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;`

  const DADOS_PRODUTO = `
    INSERT INTO produto VALUES
    (1,'Tela Azul Profunda','Óleo sobre tela, abstrato em tons de azul.','Pintura',1500.00,'img/obra-01.png',3),(2,'Escultura em Bronze','Escultura abstrata em bronze fundido.','Escultura',3500.00,'img/obra-02.png',2),(3,'Desenho a Carvão','Estudo de figura humana a carvão sobre papel.','Desenho',450.00,'img/obra-03.png',5),(4,'Fotografia Preto e Branco','Paisagem urbana capturada em película B&W.','Fotografia',800.00,'img/obra-04.png',8),(5,'Gravura em Madeira','Xilogravura com tema da natureza.','Gravura',600.00,'img/obra-05.png',10),(6,'Instalação de Luz','Instalação luminosa com LEDs e metal.','Instalação',2200.00,'img/obra-06.png',1),(7,'Aquarela Floral','Estudo botânico em aquarela sobre papel.','Pintura',700.00,'img/obra-07.png',4),(8,'Escultura em Madeira','Figura entalhada em madeira de reflorestamento.','Escultura',1800.00,'img/obra-08.png',3),(9,'Desenho a Tinta','Ilustração a nanquim sobre papel.','Desenho',500.00,'img/obra-09.png',6),(10,'Fotografia Colorida','Retrato em impressão fine art.','Fotografia',950.00,'img/obra-10.png',7),(11,'Gravura em Metal','Água-forte com tema celestial.','Gravura',750.00,'img/obra-11.png',5),(12,'Instalação Sonora','Obra sonora com objetos encontrados.','Instalação',3000.00,'img/obra-12.png',1),(13,'Óleo sobre Tela','Paisagem urbana em óleo sobre tela.','Pintura',2100.00,'img/obra-13.png',2),(14,'Escultura em Argila','Peça cerâmica queimada em alto-forno.','Escultura',900.00,'img/obra-14.png',4),(15,'Desenho a Lápis','Estudo anatômico a lápis grafite.','Desenho',350.00,'img/obra-15.png',8),(16,'Fotografia Analógica','Cena de rua em película 35mm.','Fotografia',1100.00,'img/obra-16.png',3),(17,'Litografia','Impressão em pedra litográfica.','Gravura',850.00,'img/obra-17.png',6),(18,'Instalação de Vídeo','Projeção em loop com som ambiente.','Instalação',2800.00,'img/obra-18.png',1),(19,'Acrílico sobre Tela','Obra abstrata em acrílico vibrante.','Pintura',1600.00,'img/obra-19.png',4),(20,'Escultura em Pedra','Figura esculpida em mármore branco.','Escultura',4200.00,'img/obra-20.png',2),(21,'Desenho a Giz','Estudo de natureza morta a giz pastel.','Desenho',480.00,'img/obra-21.png',7),(22,'Fotografia Digital','Impressão em papel de algodão.','Fotografia',780.00,'img/obra-22.png',5),(23,'Serigrafia','Edição limitada em tela de seda.','Gravura',520.00,'img/obra-23.png',9),(24,'Instalação Imersiva','Ambiente com múltiplos elementos sensoriais.','Instalação',3800.00,'img/obra-24.png',1),(25,'Mista sobre Tela','Colagem e tinta sobre tela.','Pintura',1300.00,'img/obra-25.png',3),(26,'Escultura em Ferro','Peça abstrata em ferro soldado.','Escultura',2500.00,'img/obra-26.png',2),(27,'Desenho Digital','Ilustração criada em tabela digital.','Desenho',390.00,'img/obra-27.png',6),(28,'Fotografia de Rua','Impressão baryta de cena urbana.','Fotografia',870.00,'img/obra-28.png',4),(29,'Monotipia','Peça única em monotipia sobre papel.','Gravura',650.00,'img/obra-29.png',1),(30,'Instalação Cinética','Obra com elementos em movimento.','Instalação',3200.00,'img/obra-30.png',1);`
 
  const ESTRUTURA_COMPRA = `
  CREATE TABLE IF NOT EXISTS compra (
     id int NOT NULL AUTO_INCREMENT,
     idCliente int NOT NULL,
     data date NOT NULL,
     forma_pagamento varchar(50) NOT NULL,
     valor_total decimal(10,2) NOT NULL,
     PRIMARY KEY (id),
     KEY idCliente (idCliente),
     CONSTRAINT compra_ibfk_1 FOREIGN KEY (idCliente) REFERENCES cliente (id)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;`

   const ESTRUTURA_PRODUTOCOMPRA = `
   CREATE TABLE IF NOT EXISTS produtocompra (
     idproduto int NOT NULL,
     idcompra int NOT NULL,
     quantidade int NOT NULL,
     valor_unitario decimal(10,2) NOT NULL,
     PRIMARY KEY (idproduto, idcompra),
     KEY idcompra (idcompra),
     CONSTRAINT produtocompra_ibfk_1 FOREIGN KEY (idproduto) REFERENCES produto (id),
     CONSTRAINT produtocompra_ibfk_2 FOREIGN KEY (idcompra) REFERENCES compra (id)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;`

  async function criar_tabelas() {
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        // Insere dados apenas se a tabela estiver vazia (não apaga dados existentes)
        async function inserirSeVazio(tabela, dadosSql) {
            const [linhas] = await connection.query(`SELECT COUNT(*) AS total FROM ${tabela}`);
            if (linhas[0].total === 0) {
                console.log("Inserindo dados iniciais em '" + tabela + "'...");
                await connection.query(dadosSql);
            } else {
                console.log("Tabela '" + tabela + "' já possui dados. Pulando inserção.");
            }
        }

        console.log("Criando tabela 'cliente'...");
        await connection.query(ESTRUTURA_CLIENTE);
        await inserirSeVazio("cliente", DADOS_CLIENTE);

        console.log("Criando tabela 'produto'...");
        await connection.query(ESTRUTURA_PRODUTO);
        await inserirSeVazio("produto", DADOS_PRODUTO);

        console.log("Criando tabelas 'compra' e 'produtocompra'...");
        await connection.query(ESTRUTURA_COMPRA);
        await connection.query(ESTRUTURA_PRODUTOCOMPRA);

        await connection.commit();
        console.log("Migration executada com sucesso!");
        process.exit(0);
    } catch (error) {
        await connection.rollback();
        console.log(error)
        process.exit(1);
    } finally {
        connection.release();
    }
}
criar_tabelas()
