// Deve coincidir com o LIMITE fixado no back-end (index.js - rota /produto)
const LIMITE_POR_PAGINA = 10;

// URL base da API, mesmo padrão do pages.js
const LINK_API = "http://localhost:3000";

const lista_produtos = document.getElementById("lista-produtos");
const filtro_busca = document.getElementById("filtro-busca");
const filtro_categoria = document.getElementById("filtro-categoria");
const filtro_preco_min = document.getElementById("filtro-preco-min");
const filtro_preco_max = document.getElementById("filtro-preco-max");
const filtro_ordenacao = document.getElementById("filtro-ordenacao");
const btn_filtrar = document.getElementById("btn-filtrar");
const btn_limpar = document.getElementById("btn-limpar");
const btn_anterior = document.getElementById("btn-anterior");
const btn_proximo = document.getElementById("btn-proximo");
const info_pagina = document.getElementById("info-pagina");

let pagina_atual = 1;

// Monta os query parameters (filtros vindos do back-end: busca, categoria,
// preco_min, preco_max, ordenacao e pagina)
function construir_filtros() {
    const params = new URLSearchParams();

    const busca = filtro_busca.value.trim();
    if (busca) {
        params.set("busca", busca);
    }

    if (filtro_categoria.value) {
        params.set("categoria", filtro_categoria.value);
    }

    if (filtro_preco_min.value !== "") {
        params.set("preco_min", filtro_preco_min.value);
    }

    if (filtro_preco_max.value !== "") {
        params.set("preco_max", filtro_preco_max.value);
    }

    if (filtro_ordenacao.value) {
        params.set("ordenacao", filtro_ordenacao.value);
    }

    params.set("pagina", pagina_atual);

    return params;
}

// Atualiza o rodapé da paginação: número da página e botões desabilitados
function atualizar_paginacao(quantidade_retornada) {
    info_pagina.textContent = "Página " + pagina_atual;

    btn_anterior.disabled = pagina_atual <= 1;

    // Se a página veio com menos produtos que o limite, não existe próxima página
    btn_proximo.disabled = quantidade_retornada < LIMITE_POR_PAGINA;
}

async function carregar_produtos() {
    try {
        const resposta = await fetch(LINK_API + "/produto?" + construir_filtros());

        if (!resposta.ok) {
            throw new Error("Erro ao consultar produtos");
        }

        const produtos = await resposta.json();
        mostrar_produtos(produtos);
        atualizar_paginacao(produtos.length);
    } catch (erro) {
        console.error(erro);
        mostrar_mensagem("Não foi possível carregar os produtos do estoque.");
        atualizar_paginacao(0);
    }
}

function criar_card(produto) {
    const card = document.createElement("article");
    card.className = "produto-estoque";

    const imagem = document.createElement("img");
    // A imagem é servida pela API (pasta img/ baixada do Google Drive)
    if (produto.caminho_img) {
        imagem.src = LINK_API + "/" + produto.caminho_img;
    }
    imagem.alt = produto.nome;
    imagem.onerror = () => {
        imagem.alt = "Imagem indisponível";
        imagem.removeAttribute("src");
    };

    const nome = document.createElement("h2");
    nome.textContent = produto.nome;

    const categoria = document.createElement("p");
    categoria.textContent = "Categoria: " + produto.categoria;

    const descricao = document.createElement("p");
    descricao.textContent = produto.descricao;

    const preco = document.createElement("p");
    preco.className = "preco";
    preco.textContent = Number(produto.preco).toLocaleString(
        "pt-BR",
        { style: "currency", currency: "BRL" }
    );

    const quantidade = document.createElement("p");
    quantidade.className = "quantidade";
    const estoque = produto.quantidade_img ?? produto.quantidade;
    if (estoque !== undefined) {
        quantidade.textContent = "Estoque: " + estoque + " unidades";
        card.append(quantidade);
    }

    card.append(imagem, nome, categoria, descricao, preco);

    // BOTÃO ADICIONAR AO CARRINHO
    const btn_carrinho = document.createElement("button");
    btn_carrinho.textContent = "🛒 Adicionar ao carrinho";
    btn_carrinho.className = "btn-carrinho";
    btn_carrinho.addEventListener("click", () => {
        adicionar_ao_carrinho(produto);
    });
    card.append(btn_carrinho);

    return card;
}

function mostrar_produtos(produtos) {
    lista_produtos.replaceChildren();

    if (produtos.length === 0) {
        mostrar_mensagem("Nenhum produto encontrado com esses filtros.");
        return;
    }

    produtos.forEach(produto => {
        lista_produtos.appendChild(criar_card(produto));
    });
}

function mostrar_mensagem(texto) {
    const mensagem = document.createElement("p");
    mensagem.className = "mensagem sem-produtos";
    mensagem.textContent = texto;
    lista_produtos.appendChild(mensagem);
}

// Aplica os filtros: sempre volta para a primeira página
function aplicar_filtros() {
    pagina_atual = 1;
    carregar_produtos();
}

btn_filtrar.addEventListener("click", aplicar_filtros);

// Permite filtrar apertando Enter nos campos de texto/number
[filtro_busca, filtro_preco_min, filtro_preco_max].forEach(campo => {
    campo.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter") {
            aplicar_filtros();
        }
    });
});

// Ordenação aplica imediatamente
filtro_ordenacao.addEventListener("change", aplicar_filtros);

btn_limpar.addEventListener("click", () => {
    filtro_busca.value = "";
    filtro_categoria.value = "";
    filtro_preco_min.value = "";
    filtro_preco_max.value = "";
    filtro_ordenacao.value = "";
    aplicar_filtros();
});

btn_anterior.addEventListener("click", () => {
    if (pagina_atual > 1) {
        pagina_atual--;
        carregar_produtos();
    }
});

btn_proximo.addEventListener("click", () => {
    pagina_atual++;
    carregar_produtos();
});

carregar_produtos();
