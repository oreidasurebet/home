function calcularSurebet() {
    const banca = parseFloat(document.getElementById("banca").value);
    const reservaPct = parseFloat(document.getElementById("reservaPorcentagem").value) || 0;
    const lucro = parseFloat(document.getElementById("lucro").value);
    const prejuizoMax = parseFloat(document.getElementById("prejuizo").value);
    const oddA = parseFloat(document.getElementById("oddA").value);
    const oddB = parseFloat(document.getElementById("oddB").value);

    if (!banca || !lucro || !prejuizoMax || !oddA || !oddB) {
      document.getElementById("resultado").innerHTML = "⚠️ Preencha todos os campos corretamente.";
      return;
    }

    if (reservaPct < 0 || reservaPct > 100) {
      document.getElementById("resultado").innerHTML = "⚠️ A reserva deve estar entre 0% e 100%.";
      return;
    }

    // Calcula o valor disponível para apostas A e B
    const reservaValor = (reservaPct / 100) * banca;
    const bancaDisponivel = banca - reservaValor;

    // Retorno desejado (banca + lucro)
    const retornoDesejado = banca + lucro;

    // Apostas para A e B baseadas na banca disponível e odds
    // Recalculando para que apostaA + apostaB = bancaDisponivel * ajuste proporcional para garantir lucro
    // Cálculo da proporção das apostas que geram o retorno desejado independente do resultado A ou B:

    // A lógica para surebet é apostar de forma que:
    // apostaA * oddA = apostaB * oddB = retornoDesejado

    // Para isso, podemos usar:
    // apostaA = retornoDesejado / oddA
    // apostaB = retornoDesejado / oddB
    // Soma apostas = apostaA + apostaB

    // Porém, soma apostas deve ser <= bancaDisponivel. Se não, ajustamos as apostas proporcionalmente.

    let apostaA = retornoDesejado / oddA;
    let apostaB = retornoDesejado / oddB;
    let somaApostas = apostaA + apostaB;

    if (somaApostas > bancaDisponivel) {
      // Ajusta apostas para caber no valor disponível proporcionalmente
      const fator = bancaDisponivel / somaApostas;
      apostaA = apostaA * fator;
      apostaB = apostaB * fator;
      somaApostas = apostaA + apostaB;
    }

    // Valor para Empate mostrado como o que sobra da banca após A e B
    const valorEmpate = banca - (apostaA + apostaB);

    // Calcula odd mínima para lucro no empate
    const oddMinimaLucro = (banca + lucro) / valorEmpate;

    // Para prejuízo máximo, calcula odd mínima e valor para apostar no empate (mesma lógica)
    const retornoMinimo = banca - prejuizoMax;
    const oddMinimaPrejuizo = retornoMinimo / valorEmpate;
    const valorApostarComPrejuizo = retornoMinimo / oddMinimaPrejuizo;

    let resultadoTexto = `
🔴 Apostar R$ ${apostaA.toFixed(2)} no Time A (Odd ${oddA})
🔵 Apostar R$ ${apostaB.toFixed(2)} no Time B (Odd ${oddB})

⚪ Reserva para Empate: R$ ${valorEmpate.toFixed(2)} (apostar ao vivo)

🟢 Para lucrar R$ ${lucro.toFixed(2)}, odd mínima no empate: ${oddMinimaLucro.toFixed(2)}

🛡️ Para limitar prejuízo a R$ ${prejuizoMax.toFixed(2)}:
• Odd mínima aceitável no empate: ${oddMinimaPrejuizo.toFixed(2)}
• Valor a apostar nessa odd: R$ ${valorApostarComPrejuizo.toFixed(2)}
`;

    document.getElementById("resultado").innerText = resultadoTexto;
  }
