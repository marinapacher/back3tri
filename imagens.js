// Baixa as imagens dos produtos do Google Drive para a pasta img/
// As imagens NÃO são armazenadas no GitHub (img/ está no .gitignore)
// Rodar uma vez antes de iniciar a API: npm run imagens

// npm i dotenv
const dotenv = require("dotenv")
dotenv.config()

const fs = require("fs")

// Pasta do Google Drive com as imagens dos produtos
// https://drive.google.com/drive/folders/1ydknV47-TAs4sDZpUcE3u_7xEX3MDD31
// ID de cada arquivo no Drive, na mesma ordem dos produtos (id 1 até 30)
const ARQUIVOS_DRIVE = [
    "1VnrTxDzl4I4PFhxaTbKrDj3OzUR0h47P", // 01 - obra-01.png
    "125uMYB5YxJh2duVzRVeo_Fsbi7mOK5I_", // 02 - obra-02.png
    "1tA6xaCFIjT_bTKobLnbC_O_UnBLBMztv", // 03 - obra-03.png
    "1paHYzEu07abyIXVWJkUvDmYyvOcP2LSL", // 04 - obra-04.png
    "19WMzPkq9udxLMP4OqFaKz5NS1hcJk29G", // 05 - obra-05.png
    "1hjoy60Y1OOQiRixntdbEaOU_SPROfL9Y", // 06 - obra-06.png
    "1rkIZTPZ6sNVmMQh7He6IdMY6Y8KCV0DW", // 07 - obra-07.png
    "1qmsZuv9Ke0IgnK0sWtl6KTY87XZIpL6p", // 08 - obra-08.png
    "15nD54JOxGp7slzOIVzUFt2glJaVudPuI", // 09 - obra-09.png
    "10xDtgxQ2ufxgRNPMdNL9o3GSLVkLhCVi", // 10 - obra-10.png
    "1sxBUsqkIFsFHVtfFm1QJEnRJP0ABb6KU", // 11 - obra-11.png
    "14ncvjXUkWGMgoZJqlzo8pRKkloXZ2WWy", // 12 - obra-12.png
    "1IZxyGuYse5LyK0JHQKy79SmCsg8u7Qf8", // 13 - obra-13.png
    "17biTEqjuzC3x0KBgifay_3ihdryp71u-", // 14 - obra-14.png
    "1roGB60bI9r8Y1G1vnRN2OnIUKuDuFBMM", // 15 - obra-15.png
    "1XY5lXoy4sB2VBsUCy9wwRJq72WFzTlXx", // 16 - obra-16.png
    "118dE5WexZd1LtzmazKP4P94L1wNSi954", // 17 - obra-17.png
    "1KsADgo40_QLdLMKsolPldqfjNPziizHQ", // 18 - obra-18.png
    "1NOIFVebTlS93Gb8kphMY6eChzlkFersu", // 19 - obra-19.png
    "1B_Ngou_I6i9rxbwXHluq-4HYHkK1vJlK", // 20 - obra-20.png
    "1GsZNKr5jWSwybFL38tNausZTwqTx-85C", // 21 - obra-21.png
    "1aTj8GQbiTCDP0ySsCndNiiFamaKnGqhW", // 22 - obra-22.png
    "11itCAuCfRaJQjDndKJMVXs8Z6VM8ZnCU", // 23 - obra-23.png
    "11sAEw4IhoeAJYUFr64FL4IfrJAUS_seb", // 24 - obra-24.png
    "1SHlvWcivyuI2IAcfI1oFd4p2yFevZ172", // 25 - obra-25.png
    "1Res9KKgeIwm4N6bvo_l9w-AlZI-ouRjX", // 26 - obra-26.png
    "1INOpx-2JgfrYqdwe_Go7ZChkWSkhz9-7", // 27 - obra-27.png
    "1DggV0bV_pWViEuPRTr9-FUCR6F2ZQxjY", // 28 - obra-28.png
    "1am_AP49FfmPh50w5mpI-60QZGJNmpOA7", // 29 - obra-29.png
    "13PmLcvp6CJ7JmbbocXJcqKT5UMpRRkZS"  // 30 - obra-30.png
]

// Nome do arquivo local de cada produto (mesmo caminho_img salvo no banco)
const NOMES_LOCAIS = [
    "obra-01.png", "obra-02.png", "obra-03.png", "obra-04.png", "obra-05.png",
    "obra-06.png", "obra-07.png", "obra-08.png", "obra-09.png", "obra-10.png",
    "obra-11.png", "obra-12.png", "obra-13.png", "obra-14.png", "obra-15.png",
    "obra-16.png", "obra-17.png", "obra-18.png", "obra-19.png", "obra-20.png",
    "obra-21.png", "obra-22.png", "obra-23.png", "obra-24.png", "obra-25.png",
    "obra-26.png", "obra-27.png", "obra-28.png", "obra-29.png", "obra-30.png"
]

// Baixa um arquivo do Google Drive (link de download direto)
async function baixar_imagem(id_arquivo, caminho_local) {
    const resposta = await fetch(
        "https://drive.google.com/uc?export=download&id=" + id_arquivo
    )

    if (!resposta.ok) {
        throw new Error("Erro ao baixar " + caminho_local + " (HTTP " + resposta.status + ")")
    }

    const buffer = Buffer.from(await resposta.arrayBuffer())
    fs.writeFileSync(caminho_local, buffer)
    console.log("Imagem salva: " + caminho_local)
}

async function baixar_todas_imagens() {
    // Cria a pasta img/ se ela não existir
    if (!fs.existsSync("img")) {
        fs.mkdirSync("img")
    }

    for (let i = 0; i < ARQUIVOS_DRIVE.length; i++) {
        await baixar_imagem(ARQUIVOS_DRIVE[i], "img/" + NOMES_LOCAIS[i])
    }

    console.log("Todas as imagens foram baixadas do Google Drive!")
    process.exit(0)
}

baixar_todas_imagens().catch((error) => {
    console.log(error.message)
    process.exit(1)
})
