let link_api = "http://localhost:3000"

export async function buscar_produtos(queryParams) {
    let rota = "/produto"
    const queryString = queryParams.toString();
    if (queryString){
        rota+= "?" + queryString
    }
    const resposta = await fetch(link_api + rota);

    if (!resposta.ok) {
        throw new Error("Erro ao buscar produtos");
    }

    const resposta_json = await resposta.json();
    return resposta_json;
}
