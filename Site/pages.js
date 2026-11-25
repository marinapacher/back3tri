// Necessário possuir o TOAST do Bootstrap no HTML para funcionar!
function mostrarToast(mensagem, bgClass) {
    const toastEl = document.getElementById("liveToast");
    const toastMessage = document.getElementById("toast-message");
    const bsToast = new bootstrap.Toast(toastEl);
    toastMessage.textContent = mensagem;

    // remove classes de cor antigas
    toastEl.classList.remove("bg-success", "bg-danger");
    toastEl.classList.add(bgClass);

    bsToast.show();
}

function atualizar_navbar() {
    const nome = localStorage.getItem("nome_cliente")
    const token = localStorage.getItem("token")

    const nav_login = document.getElementById("nav-login")
    const btn_user_info = document.getElementById("user-info")

    if(token && nome) {
        nav_login.style.display = "none"
        btn_user_info.style.display = "inline"
        btn_user_info.innerText= "Olá, " + nome.split(" ")[0]
    } else {
        nav_login.style.display = "inline"
        btn_user_info.style.display = "none"
    }
}

function logout() {
    localStorage.removeItem("nome_cliente")
    localStorage.removeItem("token")
    window.location.href = "login.html"
}

const API_URL = "http://localhost:3000/produto";

const lista = document.getElementById("lista-produtos");
const pesquisa = document.getElementById("pesquisa");

let produtos = [];

async function carregarProdutos() {
    try {
        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error("Erro ao consultar produtos");
        }

        produtos = await resposta.json();
        mostrarProdutos(produtos);

    } catch (erro) {
        console.error(erro);
        lista.textContent =
            "Não foi possível carregar os produtos do estoque.";
    }
}

function mostrarProdutos(listaProdutos) {
    lista.replaceChildren();

    if (listaProdutos.length === 0) {
        lista.textContent = "Nenhum produto encontrado.";
        return;
    }

    listaProdutos.forEach(produto => {
        const card = document.createElement("article");
        card.className = "produto-estoque";

        const imagem = document.createElement("img");
        // A imagem é servida pela API (pasta img/ gerada por npm run imagens)
        imagem.src = "http://localhost:3000/" + produto.caminho_img;
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
        quantidade.textContent =
            "Estoque: " + produto.quantidade + " unidades";

        card.append(imagem, nome, categoria, descricao, preco, quantidade);

        // BOTÃO ADICIONAR AO CARRINHO
        const btn_carrinho = document.createElement("button");
        btn_carrinho.textContent = "🛒 Adicionar ao carrinho";
        btn_carrinho.className = "btn-carrinho";
        btn_carrinho.addEventListener("click", () => {
            adicionar_ao_carrinho(produto);
        });
        card.append(btn_carrinho);

        lista.appendChild(card);
    });
}

// Só ativa o carregamento/filtro automático na página inicial (index.html),
// pois a página de produtos (produtos.html) usa o produtos.js com a própria lógica
if (lista && pesquisa) {
    pesquisa.addEventListener("input", () => {
        const termo = pesquisa.value.toLowerCase();

        mostrarProdutos(
            produtos.filter(produto =>
                produto.nome.toLowerCase().includes(termo)
            )
        );
    });

    carregarProdutos();
}

window.addEventListener("DOMContentLoaded", atualizar_navbar)
