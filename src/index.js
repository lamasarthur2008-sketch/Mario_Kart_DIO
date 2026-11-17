const readline = require("readline")

// Escolha o modo de seleção: "manual" (terminal) ou "aleatorio" (sorteio)
const MODO_ESCOLHA = "manual"

// Declaração dos personagens do Jogo
const personagens = [
    { Nome: "Mário", Velocidade: 4, Manobrabilidade: 3, Poder: 3, Pontos: 0 },
    { Nome: "Luigi", Velocidade: 3, Manobrabilidade: 4, Poder: 4, Pontos: 0 },
    { Nome: "Yoshi", Velocidade: 2, Manobrabilidade: 4, Poder: 3, Pontos: 0 },
    { Nome: "Bowser", Velocidade: 5, Manobrabilidade: 2, Poder: 5, Pontos: 0 },
    { Nome: "Peach", Velocidade: 3, Manobrabilidade: 4, Poder: 2, Pontos: 0 },
    { Nome: "Donkey Kong", Velocidade: 2, Manobrabilidade: 2, Poder: 5, Pontos: 0 },
]

// ---------- ESCOLHA DE PERSONAGENS ----------

// Opção A: sorteio de dois personagens diferentes
function sortearPersonagens(lista) {
    const indice1 = Math.floor(Math.random() * lista.length)

    let indice2
    do {
        indice2 = Math.floor(Math.random() * lista.length)
    } while (indice2 === indice1)

    // {...obj} cria uma cópia, assim os Pontos sempre começam zerados
    return [{ ...lista[indice1] }, { ...lista[indice2] }]
}

// Opção B: jogadores escolhem pelo terminal
function perguntar(rl, texto) {
    return new Promise((resolve) => rl.question(texto, resolve))
}

async function escolherPersonagem(rl, lista, titulo, indiceBloqueado = -1) {
    console.log(`\n${titulo}`)
    lista.forEach((p, i) => {
        if (i !== indiceBloqueado) {
            console.log(`${i + 1} - ${p.Nome} (Vel: ${p.Velocidade} | Man: ${p.Manobrabilidade} | Pod: ${p.Poder})`)
        }
    })

    while (true) {
        const resposta = await perguntar(rl, "Digite o número: ")
        const indice = parseInt(resposta) - 1

        const valido = indice >= 0 && indice < lista.length && indice !== indiceBloqueado
        if (valido) return indice

        console.log("❌ Opção inválida, tente novamente.")
    }
}

async function escolherDois(lista) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

    const i1 = await escolherPersonagem(rl, lista, "Jogador 1, escolha seu personagem:")
    const i2 = await escolherPersonagem(rl, lista, "Jogador 2, escolha seu personagem:", i1)

    rl.close()
    return [{ ...lista[i1] }, { ...lista[i2] }]
}

// ---------- LÓGICA DA CORRIDA ----------

async function rollDice() {
    return Math.floor(Math.random() * 6) + 1
}

async function logRollResult(characterName, block, diceResult, attribute) {
    console.log(
        `${characterName} 🎲 rolou um dado de ${block} ${diceResult} + ${attribute} = ${diceResult + attribute}`
    )
}

async function getRandomBlock() {
    const random = Math.random()
    let result

    switch (true) {
        case random < 0.33:
            result = "RETA"
            break
        case random < 0.66:
            result = "CURVA"
            break
        default:
            result = "CONFRONTO"
            break
    }

    return result
}

async function playRaceEngine(character1, character2) {
    for (let round = 1; round <= 5; round++) {
        console.log(`🏁 RODADA ${round}`)

        const block = await getRandomBlock()
        console.log(`BLOCO: ${block}`)

        const diceResult1 = await rollDice()
        const diceResult2 = await rollDice()

        if (block === "RETA" || block === "CURVA") {
            const isReta = block === "RETA"
            const attrName = isReta ? "velocidade" : "manobrabilidade"
            const attr1 = isReta ? character1.Velocidade : character1.Manobrabilidade
            const attr2 = isReta ? character2.Velocidade : character2.Manobrabilidade

            const total1 = diceResult1 + attr1
            const total2 = diceResult2 + attr2

            await logRollResult(character1.Nome, attrName, diceResult1, attr1)
            await logRollResult(character2.Nome, attrName, diceResult2, attr2)

            if (total1 > total2) {
                console.log(`${character1.Nome} marcou um ponto!`)
                character1.Pontos++
            } else if (total2 > total1) {
                console.log(`${character2.Nome} marcou um ponto!`)
                character2.Pontos++
            } else {
                console.log("Empate! Ninguém marcou ponto.")
            }
        }

        if (block === "CONFRONTO") {
            const power1 = diceResult1 + character1.Poder
            const power2 = diceResult2 + character2.Poder

            console.log(`${character1.Nome} confrontou com ${character2.Nome}! 🥊`)
            await logRollResult(character1.Nome, "poder", diceResult1, character1.Poder)
            await logRollResult(character2.Nome, "poder", diceResult2, character2.Poder)

            if (power1 > power2) {
                if (character2.Pontos > 0) {
                    character2.Pontos--
                    console.log(`${character1.Nome} venceu o confronto! ${character2.Nome} perdeu 1 ponto 🐢`)
                } else {
                    console.log(`${character1.Nome} venceu o confronto, mas ${character2.Nome} não tinha pontos para perder.`)
                }
            } else if (power2 > power1) {
                if (character1.Pontos > 0) {
                    character1.Pontos--
                    console.log(`${character2.Nome} venceu o confronto! ${character1.Nome} perdeu 1 ponto 🐢`)
                } else {
                    console.log(`${character2.Nome} venceu o confronto, mas ${character1.Nome} não tinha pontos para perder.`)
                }
            } else {
                console.log("Confronto empatado, nenhum ponto foi perdido!")
            }
        }

        console.log("-----------------------------\n")
    }
}

// Função para declarar o vencedor!
async function declareWinner(character1, character2) {
    console.log("Resultado final:")
    console.log(`${character1.Nome}: ${character1.Pontos} ponto(s)`)
    console.log(`${character2.Nome}: ${character2.Pontos} ponto(s)`)

    if (character1.Pontos > character2.Pontos) {
        console.log(`\n${character1.Nome} venceu a corrida! 🏆`)
    } else if (character2.Pontos > character1.Pontos) {
        console.log(`\n${character2.Nome} venceu a corrida! 🏆`)
    } else {
        console.log("\nA corrida terminou empatada!")
    }
}

(async function main() {
    const [player1, player2] =
        MODO_ESCOLHA === "manual"
            ? await escolherDois(personagens)
            : sortearPersonagens(personagens)

    console.log(`\n🏁🚨 Corrida entre ${player1.Nome} e ${player2.Nome} começando...\n`)

    await playRaceEngine(player1, player2)
    await declareWinner(player1, player2)
})()