function calcularSurebet() {
  const banca = parseFloat(document.getElementById("banca").value);
  const reservaPorcentagem = parseFloat(document.getElementById("reservaPorcentagem").value) || 0;
  const lucro = parseFloat(document.getElementById("lucro").value);
  const oddA = parseFloat(document.getElementById("oddA").value);
  const oddB = parseFloat(document.getElementById("oddB").value);
  const prejuizoMax = parseFloat(document.getElementById("prejuizoMax").value);

  if (!banca || !lucro || !oddA || !oddB || !prejuizoMax) {
    document.getElementById("resultado").innerText = "⚠️ Preencha todos os campos corretamente.";
    return;
  }

  if (reservaPorcentagem < 0 || reservaPorcentagem > 100) {
    document.getElementById("resultado").innerText = "⚠️ A reserva deve estar entre 0% e 100%.";
    return;
  }

  const reservaValor = (reservaPorcentagem / 100) * banca;
  const bancaDisponivel = banca - reservaValor;
  const retornoDesejado = banca + lucro;

  let apostaA = retornoDesejado / oddA;
  let apostaB = retornoDesejado / oddB;
  let somaApostas = apostaA + apostaB;

  if (somaApostas > bancaDisponivel) {
    const fator = bancaDisponivel / somaApostas;
    apostaA = apostaA * fator;
    apostaB = apostaB * fator;
    somaApostas = apostaA + apostaB;
  }

  const valorEmpate = banca - (apostaA + apostaB);
  const oddMinimaLucro = (banca + lucro) / valorEmpate;

  const valorApostarComPrejuizo = banca - prejuizoMax;
  const oddMinimaPrejuizo = valorApostarComPrejuizo / valorEmpate;
  const valorNaOddPrejuizo = valorEmpate;

  const resultadoTexto = 
`🔴 Apostar R$ ${apostaA.toFixed(2)} no Time A (Odd ${oddA})
🔵 Apostar R$ ${apostaB.toFixed(2)} no Time B (Odd ${oddB})
⚪ Reserva para Empate: R$ ${valorEmpate.toFixed(2)} (apostar ao vivo)
🟢 Para lucrar R$ ${lucro.toFixed(2)}, odd mínima no empate: ${oddMinimaLucro.toFixed(2)}
🛡️ Para limitar prejuízo a R$ ${prejuizoMax.toFixed(2)}:
• Odd mínima aceitável no empate: ${oddMinimaPrejuizo.toFixed(2)}
• Valor a apostar nessa odd: R$ ${valorNaOddPrejuizo.toFixed(2)}`;

  document.getElementById("resultado").innerText = resultadoTexto;
}
