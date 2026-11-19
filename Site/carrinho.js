// Carrinho de compras salvo no localStorage do navegador
// Também é responsável por finalizar a compra na API (rota /compra com JWT)

const CHAVE_CARRINHO = "carrinho"
// Nome diferente de produtos.js para não colidir no escopo global
const LINK_API_CARRINHO = "http://localhost:3000"

// RETORNA OS ITENS SALVOS NO CARRINHO
function ler_carrinho() {
    try {
        const carrinho = localStorage.getItem(CHAVE_CARRINHO)
        if (carrinho) {
            return JSON.parse(carrinho)
        }
    } catch (e) {
        console.error("Erro ao ler carrinho do localStorage:", e)
    }
    return []
}

// SALVA A LISTA DE ITENS NO CARRINHO
function salvar_carrinho(itens) {
    try {
        localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(itens))
    } catch (e) {
        console.error("Erro ao salvar carrinho no localStorage:", e)
    }
}

// ADICIONA UM PRODUTO AO CARRINHO
// Se o produto já estiver no carrinho, apenas aumenta a quantidade
function adicionar_ao_carrinho(produto) {
    const id = Number(produto.id)
    if (isNaN(id)) {
        mostrarToast("❌ Produto inválido!", "bg-danger")
        return
    }

    const itens = ler_carrinho()
    const item_existente = itens.find(item => item.id === id)

    if (item_existente) {
        item_existente.quantidade++
    } else {
        itens.push({
            id: id,
            nome: produto.nome,
            preco: Number(produto.preco),
            caminho_img: produto.caminho_img,
            quantidade: 1
        })
    }

    salvar_carrinho(itens)
    atualizar_contador_carrinho()
    if (typeof mostrarToast === "function") {
        mostrarToast("✅ " + produto.nome + " adicionado ao carrinho!", "bg-success")
    }
}

// REMOVE UM PRODUTO DO CARRINHO
function remover_do_carrinho(id) {
    const itens = ler_carrinho().filter(item => item.id !== id)
    salvar_carrinho(itens)
    mostrar_carrinho()
    atualizar_contador_carrinho()
}

// ALTERA A QUANTIDADE DE UM PRODUTO DO CARRINHO
function alterar_quantidade(id, quantidade) {
    const itens = ler_carrinho()
    const item = itens.find(item => item.id === id)
    if (!item) {
        return
    }

    quantidade = parseInt(quantidade)
    if (isNaN(quantidade) || quantidade < 1) {
        quantidade = 1
    }
    item.quantidade = quantidade

    salvar_carrinho(itens)
    mostrar_carrinho()
    atualizar_contador_carrinho()
}

// LIMPA O CARRINHO
function limpar_carrinho() {
    localStorage.removeItem(CHAVE_CARRINHO)
    mostrar_carrinho()
    atualizar_contador_carrinho()
}

// SOMA O VALOR TOTAL DOS ITENS DO CARRINHO
function total_carrinho() {
    return ler_carrinho().reduce(
        (total, item) => total + item.preco * item.quantidade,
        0
    )
}

// ATUALIZA O CONTADOR DE ITENS NO LINK "CARRINHO" DA NAVBAR
function atualizar_contador_carrinho() {
    const nav_carrinho = document.getElementById("nav-carrinho")
    if (!nav_carrinho) {
        return
    }

    const itens = ler_carrinho()
    const quantidade = itens.reduce((total, item) => total + item.quantidade, 0)

    if (quantidade > 0) {
        nav_carrinho.textContent = "CARRINHO (" + quantidade + ")"
    } else {
        nav_carrinho.textContent = "CARRINHO"
    }
}

// MOSTRA OS ITENS DO CARRINHO NA PÁGINA
function mostrar_carrinho() {
    const lista_carrinho = document.getElementById("lista-carrinho")
    if (!lista_carrinho) {
        return
    }

    const itens = ler_carrinho()
    lista_carrinho.replaceChildren()

    // Carrinho vazio
    if (itens.length === 0) {
        const mensagem = document.createElement("p")
        mensagem.className = "mensagem sem-produtos"
        mensagem.textContent = "Seu carrinho está vazio."
        lista_carrinho.appendChild(mensagem)
    }

    itens.forEach(item => {
        const card = document.createElement("article")
        card.className = "item-carrinho"

        const imagem = document.createElement("img")
        if (item.caminho_img) {
            imagem.src = LINK_API_CARRINHO + "/" + item.caminho_img
        }
        imagem.alt = item.nome

        const info = document.createElement("div")
        info.className = "info-carrinho"

        const nome = document.createElement("h2")
        nome.textContent = item.nome

        const preco = document.createElement("p")
        preco.textContent = "Preço unitário: " + item.preco.toLocaleString(
            "pt-BR",
            { style: "currency", currency: "BRL" }
        )

        info.append(nome, preco)

        const quantidade = document.createElement("input")
        quantidade.type = "number"
        quantidade.min = "1"
        quantidade.value = item.quantidade
        quantidade.className = "quantidade-carrinho"
        quantidade.addEventListener("change", (evento) => {
            alterar_quantidade(item.id, evento.target.value)
        })

        const subtotal = document.createElement("p")
        subtotal.className = "subtotal-carrinho"
        subtotal.textContent = (item.preco * item.quantidade).toLocaleString(
            "pt-BR",
            { style: "currency", currency: "BRL" }
        )

        const btn_remover = document.createElement("button")
        btn_remover.textContent = "🗑️ Remover"
        btn_remover.className = "btn-remover"
        btn_remover.addEventListener("click", () => {
            remover_do_carrinho(item.id)
        })

        card.append(imagem, info, quantidade, subtotal, btn_remover)
        lista_carrinho.appendChild(card)
    })

    // Mostra o valor total
    const total = document.getElementById("total-carrinho")
    total.textContent = "Total: " + total_carrinho().toLocaleString(
        "pt-BR",
        { style: "currency", currency: "BRL" }
    )
}

// ENVIA A COMPRA DOS PRODUTOS DO CARRINHO PARA A API
// A rota /compra exige o token JWT salvo no login
async function finalizar_compra() {
    const token = localStorage.getItem("token")

    // Verifica se o cliente está logado
    if (!token) {
        mostrarToast("❌ Faça login para finalizar a compra!", "bg-danger")
        setTimeout(() => {
            window.location.href = "login.html"
        }, 2000)
        return
    }

    const itens = ler_carrinho()
    if (itens.length === 0) {
        mostrarToast("❌ Seu carrinho está vazio!", "bg-danger")
        return
    }

    const forma_pagamento = document.getElementById("forma-pagamento").value
    if (!forma_pagamento) {
        mostrarToast("❌ Selecione a forma de pagamento!", "bg-danger")
        return
    }

    const btn_finalizar = document.getElementById("btn-finalizar")
    btn_finalizar.disabled = true
    btn_finalizar.textContent = "Finalizando..."

    try {
        const resposta = await fetch(LINK_API_CARRINHO + "/compra", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                forma_pagamento: forma_pagamento,
                // Envia a lista de produtos: [{id, quantidade}]
                produtos: itens.map(item => ({
                    id: item.id,
                    quantidade: item.quantidade
                }))
            })
        })

        const json_resposta = await resposta.json()

        if (resposta.status === 401 || resposta.status === 403) {
            throw new Error("Sessão expirada, faça login novamente!")
        }
        if (!resposta.ok) {
            throw new Error(json_resposta.erro || "Erro ao finalizar a compra")
        }

        // Compra realizada: limpa o carrinho
        limpar_carrinho()
        mostrarToast("✅ Compra realizada com sucesso! Valor total: R$ " + json_resposta.valor_total, "bg-success")

    } catch (error) {
        mostrarToast("❌ " + error.message, "bg-danger")
    } finally {
        btn_finalizar.disabled = false
        btn_finalizar.textContent = "Finalizar compra"
    }
}

// EVENTOS DA PÁGINA DO CARRINHO
const btn_finalizar = document.getElementById("btn-finalizar")
if (btn_finalizar) {
    btn_finalizar.addEventListener("click", finalizar_compra)
}

const btn_limpar_carrinho = document.getElementById("btn-limpar-carrinho")
if (btn_limpar_carrinho) {
    btn_limpar_carrinho.addEventListener("click", () => {
        limpar_carrinho()
        mostrarToast("🛒 Carrinho esvaziado!", "bg-success")
    })
}

// Carrega o carrinho ao abrir a página
mostrar_carrinho()
atualizar_contador_carrinho()
