// npm init

// npm i dotenv
const dotenv = require("dotenv")
dotenv.config()

// npm i express

// http://localhost:3000​/cliente

const express = require("express")
const app = express()
const port = process.env.API_PORT
app.use(express.json())

// npm i mysql2
const db = require("./db")

// npm i bcrypt
const bcrypt = require("bcrypt")

// npm i jsonwebtoken
const jwt = require("jsonwebtoken")

// npm i cors
const cors = require("cors")
app.use(cors())

// SERVIR AS IMAGENS DOS PRODUTOS NO LADO DO SERVIDOR
// As imagens são baixadas do Google Drive pelo "npm run imagens" (não ficam no GitHub)
// Ex.: http://localhost:3000/img/arte.png
app.use("/img", express.static("img"))

// CADASTRAR CLIENTE
app.post("/cliente", async (req, res) => {
    try {
        const cliente = req.body

        const senhaCript = bcrypt.hashSync(cliente.senha, 10)
        cliente.senha = senhaCript

        const resultado = await db.pool.query(
            `INSERT INTO cliente (
                nome, cpf, celular, email, senha
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                cliente.nome,
                cliente.cpf,
                cliente.celular,
                cliente.email,
                cliente.senha
            ]
        )

        res.status(201).json({
            msg: "Cliente cadastrado, ID = " + resultado[0].insertId
        })

    } catch (error) {
        res.status(500).json({
            erro: error.message
        })
    }
})

app.post("/login", async (req,res) => {
    try { 
        const user = req.body
        const resultado = await db.pool.query(
            "SELECT id, nome, email, senha FROM cliente WHERE email = ?", [user.email]
        )
        const dados_bd = resultado[0][0]
        if(!dados_bd) {
            return res.status(401).json({msg: "Email não cadastrado!"})
        }
        
        const senha_valida = await bcrypt.compare(user.senha, dados_bd.senha)

        if(!senha_valida) {
            return res.status(401).json({msg: "Credenciais inválidas!"})
        }
        const payload ={
            id: dados_bd.id,
            email: dados_bd.email
        }
        
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h'})
        return res.status(200).json({nome: dados_bd.nome, token: token})
        
    } catch (error) {
        res.status(500).json({
            erro: error.message
        })
    }
})


// CONSULTAR TODOS OS CLIENTES
app.get("/cliente", async (req, res) => {
    try {

        const resultado = await db.pool.query(
            "SELECT * FROM cliente"
        )

        res.status(200).json(resultado[0])

    } catch (error) {
        res.status(500).json({
            erro: error.message
        })
    }
})

// CONSULTAR UM CLIENTE ESPECÍFICO
app.get("/cliente/perfil", autenticar, async (req, res) => {
    try {

        const id = req.usuario.id

        const resultado = await db.pool.query(
            "SELECT * FROM cliente WHERE id = ?",
            [id]
        );
    
        if (resultado[0].length === 0) {
            return res.status(404).json({
                mensagem: "Cliente não encontrado"
            })
        }
        
        const perfil = resultado[0][0]
        // delete perfil.senha

        res.status(200).json(perfil)

    } catch (error) {
        res.status(500).json({
            erro: error.message
        })
    }
})

// ALTERAR CLIENTE
app.put("/cliente/:id", async (req, res) => {
    try {

        const id = req.params.id
        const cliente = req.body

        const senhaCript = bcrypt.hashSync(cliente.senha, 10)

        const resultado = await db.pool.query(
            `UPDATE cliente
             SET nome = ?,
                 cpf = ?,
                 celular = ?,
                 email = ?,
                 senha = ?
             WHERE id = ?`,
            [
                cliente.nome,
                cliente.cpf,
                cliente.celular,
                cliente.email,
                senhaCript,
                id
            ]
        )

        if (resultado[0].affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Cliente não encontrado"
            })
        }

        res.status(200).json({
            mensagem: "Cliente alterado com sucesso"
        })

    } catch (error) {
        res.status(500).json({
            erro: error.message
        })
    }
})

// EXCLUIR CLIENTE
app.delete("/cliente/:id", async (req, res) => {
    try {

        const id = req.params.id

        const resultado = await db.pool.query(
            "DELETE FROM cliente WHERE id = ?",
            [id]
        )

        if (resultado[0].affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Cliente não encontrado"
            })
        }

        res.status(200).json({
            mensagem: "Cliente excluído com sucesso"
        })

    } catch (error) {
        res.status(500).json({
            erro: error.message
        })
    }
})

// CONSULTAR PRODUTOS (busca, filtros, ordenação e paginação)
app.get("/produto", async (req, res) => {
    try {
        let sql = "SELECT * FROM produto WHERE 1=1"
        const params = []

        // Query Parameters
        const {
            busca,
            ordenacao,
            categoria,
            preco_min,
            preco_max,
            pagina
        } = req.query

        // Filtro de busca por nome
        if (busca) {
            sql += " AND nome LIKE ?"
            params.push(`%${busca}%`)
        }

        // Filtro por categoria
        if (categoria) {
            sql += " AND categoria = ?"
            params.push(categoria)
        }

        // Filtro por preço mínimo
        if (preco_min) {
            sql += " AND preco >= ?"
            params.push(preco_min)
        }

        // Filtro por preço máximo
        if (preco_max) {
            sql += " AND preco <= ?"
            params.push(preco_max)
        }

        // Ordenação por menor ou maior preço
        let orderBy = " ORDER BY id ASC"
        if (ordenacao) {
            const ordem = String(ordenacao).toLowerCase()
            if (ordem === "maior preco" || ordem === "maior_preco" || ordem === "desc") {
                orderBy = " ORDER BY preco DESC"
            } else if (ordem === "menor preco" || ordem === "menor_preco" || ordem === "asc") {
                orderBy = " ORDER BY preco ASC"
            }
        }
        sql += orderBy

        // Paginação: quantidade fixa de 10 produtos por página
        const limite = 10
        let paginaAtual = parseInt(pagina)
        if (isNaN(paginaAtual) || paginaAtual < 1) {
            paginaAtual = 1
        }
        const offset = (paginaAtual - 1) * limite

        sql += " LIMIT ? OFFSET ?"
        params.push(limite, offset)

        const resultado = await db.pool.query(sql, params)
        res.status(200).json(resultado[0])
    } catch (error) {
        res.status(500).json({erro: error.message})
    }
})

app.get("/produto/:id", async (req, res) => {
    try {
        // Path Parameter
        const id = req.params.id
        const resultado = await db.pool.query("SELECT * FROM produto WHERE id = ?", [id])
        const produto = resultado[0][0]
        res.status(200).json(produto)
    } catch (error) {
        res.status(500).json({erro: error.message})
    }
})

// CADASTRAR COMPRA (exige login com JWT)
// Recebe uma lista de produtos: { "forma_pagamento": "pix", "produtos": [{"id": 1, "quantidade": 2}] }
app.post("/compra", autenticar, async (req, res) => {
    const connection = await db.pool.getConnection()
    try {
        const compra = req.body
        const produtos = compra.produtos

        if (!Array.isArray(produtos) || produtos.length === 0) {
            return res.status(400).json({
                erro: "Enviar uma lista de produtos: [{id, quantidade}]"
            })
        }

        if (!compra.forma_pagamento) {
            return res.status(400).json({
                erro: "Enviar forma_pagamento"
            })
        }

        // Transação: a compra e os produtos são salvos juntos
        await connection.beginTransaction()

        // Cadastra a compra do cliente logado (req.usuario.id vem do token JWT)
        const resultado = await connection.query(
            `INSERT INTO compra (
                idCliente, data, forma_pagamento, valor_total
            ) VALUES (?, CURDATE(), ?, 0)`,
            [req.usuario.id, compra.forma_pagamento]
        )
        const idCompra = resultado[0].insertId

        // Cadastra cada produto da lista e soma o valor total
        let valor_total = 0
        for (const item of produtos) {
            const resultado_produto = await connection.query(
                "SELECT preco FROM produto WHERE id = ?",
                [item.id]
            )
            const produto = resultado_produto[0][0]
            if (!produto) {
                throw new Error("Produto id " + item.id + " não encontrado")
            }

            const quantidade = parseInt(item.quantidade)
            if (isNaN(quantidade) || quantidade < 1) {
                throw new Error("Quantidade inválida para o produto id " + item.id)
            }

            await connection.query(
                `INSERT INTO produtocompra (
                    idproduto, idcompra, quantidade, valor_unitario
                ) VALUES (?, ?, ?, ?)`,
                [item.id, idCompra, quantidade, produto.preco]
            )

            valor_total += Number(produto.preco) * quantidade
        }

        // Atualiza o valor total da compra
        await connection.query(
            "UPDATE compra SET valor_total = ? WHERE id = ?",
            [valor_total.toFixed(2), idCompra]
        )

        await connection.commit()

        res.status(201).json({
            msg: "Compra cadastrada, ID = " + idCompra,
            valor_total: valor_total.toFixed(2)
        })

    } catch (error) {
        await connection.rollback()
        res.status(500).json({
            erro: error.message
        })
    } finally {
        connection.release()
    }
})

// CONSULTAR AS COMPRAS DO CLIENTE LOGADO (exige login com JWT)
app.get("/compra", autenticar, async (req, res) => {
    try {
        const id = req.usuario.id

        const resultado = await db.pool.query(
            "SELECT * FROM compra WHERE idCliente = ? ORDER BY id DESC",
            [id]
        )
        const compras = resultado[0]

        // Para cada compra, busca os produtos comprados
        for (const compra of compras) {
            const resultado_itens = await db.pool.query(
                `SELECT produtocompra.idproduto,
                        produto.nome,
                        produto.caminho_img,
                        produtocompra.quantidade,
                        produtocompra.valor_unitario
                 FROM produtocompra
                 JOIN produto ON produto.id = produtocompra.idproduto
                 WHERE produtocompra.idcompra = ?`,
                [compra.id]
            )
            compra.produtos = resultado_itens[0]
        }

        res.status(200).json(compras)

    } catch (error) {
        res.status(500).json({
            erro: error.message
        })
    }
})

app.listen(port, () => {
    console.log("API da Marina Pacher rodando na porta " + port)
})

// https//:dontpad.com/backendapi
function autenticar(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null){
        return res.status(401).json({erro: "Token não enviado, usar Authorization Bearer <token>"})
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
        if (err) return res.status(403).json({erro: "Token inválido"})
        req.usuario = usuario
        next()
    })   
}
