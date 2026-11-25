// Separa as 30 obras da imagem "30-imagens.png" (grade 6x5) em arquivos
// individuais na pasta img/, que é servida pela API.
// Rodar uma vez antes de iniciar a API: npm run imagens
// As imagens separadas também ficam no GitHub (pasta img/), assim como a
// imagem original "30-imagens.png".

const fs = require("fs")
const path = require("path")
const zlib = require("zlib")

const IMAGEM_ORIGEM = "30-imagens.png"
const PASTA_DESTINO = "img"

// Nome do arquivo local de cada obra (mesmo caminho_img salvo no banco)
const NOMES_LOCAIS = [
    "obra-01.png", "obra-02.png", "obra-03.png", "obra-04.png", "obra-05.png",
    "obra-06.png", "obra-07.png", "obra-08.png", "obra-09.png", "obra-10.png",
    "obra-11.png", "obra-12.png", "obra-13.png", "obra-14.png", "obra-15.png",
    "obra-16.png", "obra-17.png", "obra-18.png", "obra-19.png", "obra-20.png",
    "obra-21.png", "obra-22.png", "obra-23.png", "obra-24.png", "obra-25.png",
    "obra-26.png", "obra-27.png", "obra-28.png", "obra-29.png", "obra-30.png"
]

const LADO = 600
const MARGEM = 24

// ---------------------------------------------------------------------------
// Leitura e escrita de PNG (sem dependências externas)
// ---------------------------------------------------------------------------

const TABELA_CRC = (function () {
    const tabela = new Int32Array(256)
    for (let n = 0; n < 256; n++) {
        let c = n
        for (let k = 0; k < 8; k++) {
            c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
        }
        tabela[n] = c
    }
    return tabela
})()

function crc32(buffer) {
    let c = 0xffffffff
    for (let i = 0; i < buffer.length; i++) {
        c = TABELA_CRC[(c ^ buffer[i]) & 0xff] ^ (c >>> 8)
    }
    return (c ^ 0xffffffff) >>> 0
}

function bloco_png(tipo, dados) {
    const tamanho = Buffer.alloc(4)
    tamanho.writeUInt32BE(dados.length, 0)

    const tipo_e_dados = Buffer.concat([Buffer.from(tipo, "ascii"), dados])

    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(tipo_e_dados), 0)

    return Buffer.concat([tamanho, tipo_e_dados, crc])
}

function ler_png(caminho) {
    const buffer = fs.readFileSync(caminho)

    const assinatura = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
    if (!buffer.subarray(0, 8).equals(assinatura)) {
        throw new Error(caminho + " não é um arquivo PNG válido")
    }

    let posicao = 8
    let ihdr = null
    const idat = []

    while (posicao < buffer.length) {
        const tamanho = buffer.readUInt32BE(posicao)
        const tipo = buffer.toString("ascii", posicao + 4, posicao + 8)
        const dados = buffer.subarray(posicao + 8, posicao + 8 + tamanho)
        posicao += 12 + tamanho

        if (tipo === "IHDR") {
            ihdr = {
                largura: dados.readUInt32BE(0),
                altura: dados.readUInt32BE(4),
                profundidade: dados[8],
                cor: dados[9],
                compressao: dados[10],
                filtro: dados[11],
                entrelacado: dados[12]
            }
        } else if (tipo === "IDAT") {
            idat.push(dados)
        } else if (tipo === "IEND") {
            break
        }
    }

    if (!ihdr) {
        throw new Error("PNG sem cabeçalho IHDR: " + caminho)
    }
    if (ihdr.profundidade !== 8 || (ihdr.cor !== 2 && ihdr.cor !== 6) || ihdr.entrelacado !== 0) {
        throw new Error("Formato de PNG não suportado: " + caminho)
    }

    const canais = ihdr.cor === 6 ? 4 : 3
    const bytes_por_linha = ihdr.largura * canais
    const cru = zlib.inflateSync(Buffer.concat(idat))
    const dados = Buffer.alloc(bytes_por_linha * ihdr.altura)

    let p = 0
    for (let y = 0; y < ihdr.altura; y++) {
        const filtro = cru[p++]
        const linha = dados.subarray(y * bytes_por_linha, (y + 1) * bytes_por_linha)
        const anterior = y > 0
            ? dados.subarray((y - 1) * bytes_por_linha, y * bytes_por_linha)
            : Buffer.alloc(bytes_por_linha)

        for (let x = 0; x < bytes_por_linha; x++) {
            const valor = cru[p++]
            const a = x >= canais ? linha[x - canais] : 0
            const b = anterior[x]
            const c = x >= canais ? anterior[x - canais] : 0

            if (filtro === 0) {
                linha[x] = valor
            } else if (filtro === 1) {
                linha[x] = (valor + a) & 255
            } else if (filtro === 2) {
                linha[x] = (valor + b) & 255
            } else if (filtro === 3) {
                linha[x] = (valor + ((a + b) >> 1)) & 255
            } else if (filtro === 4) {
                const pa = Math.abs(b - c)
                const pb = Math.abs(a - c)
                const pc = Math.abs(a + b - 2 * c)
                const preditor = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c)
                linha[x] = (valor + preditor) & 255
            } else {
                throw new Error("Filtro de PNG inválido: " + filtro)
            }
        }
    }

    return { largura: ihdr.largura, altura: ihdr.altura, canais: canais, dados: dados }
}

function escrever_png(caminho, largura, altura, rgb) {
    const bytes_por_linha = largura * 3
    const cru = Buffer.alloc((bytes_por_linha + 1) * altura)

    for (let y = 0; y < altura; y++) {
        const inicio = y * (bytes_por_linha + 1)
        cru[inicio] = 0 // filtro "None"
        for (let x = 0; x < bytes_por_linha; x++) {
            cru[inicio + 1 + x] = rgb[y * bytes_por_linha + x]
        }
    }

    const ihdr = Buffer.alloc(13)
    ihdr.writeUInt32BE(largura, 0)
    ihdr.writeUInt32BE(altura, 4)
    ihdr[8] = 8   // profundidade
    ihdr[9] = 2   // RGB
    ihdr[10] = 0  // compressão
    ihdr[11] = 0  // filtro
    ihdr[12] = 0  // sem entrelaçamento

    fs.writeFileSync(caminho, Buffer.concat([
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
        bloco_png("IHDR", ihdr),
        bloco_png("IDAT", zlib.deflateSync(cru)),
        bloco_png("IEND", Buffer.alloc(0))
    ]))
}

// ---------------------------------------------------------------------------
// Utilidades de pixel
// ---------------------------------------------------------------------------

function eh_branco(imagem, x, y, limiar) {
    const o = (y * imagem.largura + x) * imagem.canais
    return imagem.dados[o] > limiar
        && imagem.dados[o + 1] > limiar
        && imagem.dados[o + 2] > limiar
}

function cor_do_pixel(imagem, x, y) {
    x = Math.min(imagem.largura - 1, Math.max(0, x))
    y = Math.min(imagem.altura - 1, Math.max(0, y))
    const o = (y * imagem.largura + x) * imagem.canais
    return [imagem.dados[o], imagem.dados[o + 1], imagem.dados[o + 2]]
}

function cor_interpolada(imagem, x, y) {
    const x0 = Math.floor(x)
    const y0 = Math.floor(y)
    const x1 = Math.min(imagem.largura - 1, x0 + 1)
    const y1 = Math.min(imagem.altura - 1, y0 + 1)
    const fx = x - x0
    const fy = y - y0

    const p00 = cor_do_pixel(imagem, x0, y0)
    const p10 = cor_do_pixel(imagem, x1, y0)
    const p01 = cor_do_pixel(imagem, x0, y1)
    const p11 = cor_do_pixel(imagem, x1, y1)

    const cor = [0, 0, 0]
    for (let c = 0; c < 3; c++) {
        const cima = p00[c] * (1 - fx) + p10[c] * fx
        const baixo = p01[c] * (1 - fx) + p11[c] * fx
        cor[c] = Math.round(cima * (1 - fy) + baixo * fy)
    }
    return cor
}

function contar_vaos_brancos(fracao) {
    const vaos = []
    let inicio = null

    for (let i = 0; i < fracao.length; i++) {
        if (fracao[i] > 0.98 && inicio === null) {
            inicio = i
        } else if (fracao[i] <= 0.98 && inicio !== null) {
            vaos.push([inicio, i - 1])
            inicio = null
        }
    }
    if (inicio !== null) {
        vaos.push([inicio, fracao.length - 1])
    }

    return vaos.filter(v => v[1] - v[0] >= 2)
}

function cortes_da_grade(imagem) {
    const colunas = new Float64Array(imagem.largura)
    const linhas = new Float64Array(imagem.altura)

    for (let y = 0; y < imagem.altura; y++) {
        for (let x = 0; x < imagem.largura; x++) {
            if (eh_branco(imagem, x, y, 245)) {
                colunas[x]++
                linhas[y]++
            }
        }
    }
    for (let x = 0; x < imagem.largura; x++) colunas[x] /= imagem.altura
    for (let y = 0; y < imagem.altura; y++) linhas[y] /= imagem.largura

    const vaos_colunas = contar_vaos_brancos(colunas)
    const vaos_linhas = contar_vaos_brancos(linhas)

    function montar_cortes(vaos, tamanho) {
        // 6 colunas = 7 cortes / 5 linhas = 6 cortes
        if (vaos.length < 3) {
            const quantidade = tamanho === imagem.largura ? 6 : 5
            return Array.from({ length: quantidade + 1 }, (_, i) => Math.round(i * tamanho / quantidade))
        }
        return [0]
            .concat(vaos.slice(1, -1).map(v => Math.round((v[0] + v[1]) / 2)))
            .concat([tamanho])
    }

    return {
        colunas: montar_cortes(vaos_colunas, imagem.largura),
        linhas: montar_cortes(vaos_linhas, imagem.altura)
    }
}

// ---------------------------------------------------------------------------
// Separação das obras
// ---------------------------------------------------------------------------

function separar_imagens() {
    if (!fs.existsSync(PASTA_DESTINO)) {
        fs.mkdirSync(PASTA_DESTINO)
    }

    if (!fs.existsSync(IMAGEM_ORIGEM)) {
        const faltando = NOMES_LOCAIS.filter(nome => !fs.existsSync(path.join(PASTA_DESTINO, nome)))
        if (faltando.length === 0) {
            console.log("As 30 imagens já estão em " + PASTA_DESTINO + "/.")
            return
        }
        throw new Error(
            "Arquivo " + IMAGEM_ORIGEM + " não encontrado. " +
            "Coloque a imagem com a grade das 30 obras na raiz do projeto."
        )
    }

    console.log("Lendo " + IMAGEM_ORIGEM + "...")
    const imagem = ler_png(IMAGEM_ORIGEM)
    const cortes = cortes_da_grade(imagem)

    const alvo = LADO - 2 * MARGEM

    for (let linha = 0; linha < 5; linha++) {
        for (let coluna = 0; coluna < 6; coluna++) {
            const x0 = cortes.colunas[coluna]
            const x1 = cortes.colunas[coluna + 1]
            const y0 = cortes.linhas[linha]
            const y1 = cortes.linhas[linha + 1]

            // Recorta a célula com uma pequena margem de segurança
            let bx0 = x0 + 2
            let bx1 = x1 - 2
            let by0 = y0 + 2
            let by1 = y1 - 2

            // Descarta o fundo branco em volta da obra
            let menor_x = bx1
            let maior_x = bx0
            let menor_y = by1
            let maior_y = by0

            for (let y = by0; y < by1; y++) {
                for (let x = bx0; x < bx1; x++) {
                    if (!eh_branco(imagem, x, y, 244)) {
                        if (x < menor_x) menor_x = x
                        if (x > maior_x) maior_x = x
                        if (y < menor_y) menor_y = y
                        if (y > maior_y) maior_y = y
                    }
                }
            }

            if (maior_x >= menor_x && maior_y >= menor_y) {
                bx0 = menor_x
                bx1 = maior_x + 1
                by0 = menor_y
                by1 = maior_y + 1
            }

            const largura_obra = bx1 - bx0
            const altura_obra = by1 - by0
            const escala = Math.min(alvo / largura_obra, alvo / altura_obra)
            const largura_destino = Math.max(1, Math.round(largura_obra * escala))
            const altura_destino = Math.max(1, Math.round(altura_obra * escala))

            // Tela branca quadrada com a obra centralizada
            const tela = Buffer.alloc(LADO * LADO * 3, 255)
            const deslocamento_x = Math.floor((LADO - largura_destino) / 2)
            const deslocamento_y = Math.floor((LADO - altura_destino) / 2)

            for (let dy = 0; dy < altura_destino; dy++) {
                for (let dx = 0; dx < largura_destino; dx++) {
                    const sx = bx0 + (dx + 0.5) * largura_obra / largura_destino - 0.5
                    const sy = by0 + (dy + 0.5) * altura_obra / altura_destino - 0.5
                    const cor = cor_interpolada(imagem, sx, sy)

                    const px = deslocamento_x + dx
                    const py = deslocamento_y + dy
                    const o = (py * LADO + px) * 3
                    tela[o] = cor[0]
                    tela[o + 1] = cor[1]
                    tela[o + 2] = cor[2]
                }
            }

            const numero = linha * 6 + coluna + 1
            const nome = "obra-" + String(numero).padStart(2, "0") + ".png"
            const destino = path.join(PASTA_DESTINO, nome)

            escrever_png(destino, LADO, LADO, tela)
            console.log("Imagem salva: " + destino)
        }
    }

    console.log("As 30 imagens foram separadas em " + PASTA_DESTINO + "/!")
}

try {
    separar_imagens()
} catch (error) {
    console.log(error.message)
    process.exit(1)
}
