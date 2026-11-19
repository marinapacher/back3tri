import {buscar_produtos} from "./api";

async function carregar_produtos(){
    let produtos
    try {
        produtos = await buscar_produtos(0, 0)
        alert(JSON.stringify(produtos))
    } catch (error) {
        alert(error)
    }
}
window.addEventListener("DOMContentLoaded", carregar_produtos)
