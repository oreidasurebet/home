// 🔊 Função para bip quando detecta surebet
function tocarBip() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.3);
}

// 🔄 Configuração dos arquivos JSON via Zrok
const arquivos = [
    { nome: 'BETANO', caminho: 'https://va9orj9nzjtf.share.zrok.io/betano.json' },
    { nome: 'STAKE', caminho: 'https://va9orj9nzjtf.share.zrok.io/stake.json' },
    { nome: 'BET365', caminho: 'https://va9orj9nzjtf.share.zrok.io/bet365.json' },
    { nome: 'NOVIBET', caminho: 'https://va9orj9nzjtf.share.zrok.io/novibet.json' },
    { nome: 'BETFAIR', caminho: 'https://va9orj9nzjtf.share.zrok.io/betfair.json' },
    { nome: 'BETMGM', caminho: 'https://va9orj9nzjtf.share.zrok.io/betmgm.json' }
];

// 🔄 Atualiza os dados dos arquivos JSON
function atualizarDados() {
    const promises = arquivos.map(arq =>
        fetch(`${arq.caminho}?t=${Date.now()}`, {
            headers: {
                'skip_zrok_interstitial': 'true'
            }
        })
        .then(res => {
            if (!res.ok) throw new Error(`Erro ao carregar ${arq.caminho}`);
            return res.json();
        })
        .then(json => (json.dados || json).map(item => {
            const jogoNormalizado = normalizarNomeJogo(item.jogo);
            return {
                ...item,
                casaNome: arq.nome,
                jogoOriginal: item.jogo,
                jogo: jogoNormalizado,
                jogoExibicao: jogoNormalizado.toUpperCase()
            };
        }))
        .catch(err => {
            console.error(err);
            return [];
        })
    );

    Promise.all(promises).then(resultados => {
        const dados = [].concat(...resultados);
        gerarTabela(dados);
        ordenarTabelasPorMargem();
        console.log("✅ Tabela atualizada em:", new Date().toLocaleTimeString());
    });
}

// 🔁 Atualização automática a cada 20 segundos
function iniciarAutoAtualizacao() {
    atualizarDados();
    setInterval(atualizarDados, 20 * 1000);
}

window.onload = iniciarAutoAtualizacao;

// ============================
// 🔧 Funções auxiliares abaixo
// ============================

function padronizarNomeTime(nome) {
    const nomeNormalizado = nome.trim().toLowerCase();
    return mapaNomes?.[nomeNormalizado] || nomeNormalizado;
}

function normalizarNomeJogo(jogo) {
    return jogo
        .toLowerCase()
        .split(' x ')
        .map(time => padronizarNomeTime(time))
        .join(' x ')
        .trim();
}

function gerarTabela(dados) {
    const output = document.getElementById('output');
    output.innerHTML = '';

    const agrupado = {};
    dados.forEach(item => {
        const mercado = item.mercado || '1X2';
        const chave = `${item.jogo}||${mercado}`;
        if (!agrupado[chave]) agrupado[chave] = [];
        agrupado[chave].push(item);
    });

    const lista = Object.keys(agrupado).map(chave => {
        const linhas = agrupado[chave];

        const maiorCasa = linhas.reduce((max, curr) => {
            return parseFloat(curr.casa) > (parseFloat(max.casa) || 0) ? curr : max;
        }, { casa: 0 });

        const maiorEmpate = linhas.reduce((max, curr) => {
            return parseFloat(curr.empate) > (parseFloat(max.empate) || 0) ? curr : max;
        }, { empate: 0 });

        const maiorVisitante = linhas.reduce((max, curr) => {
            return parseFloat(curr.visitante) > (parseFloat(max.visitante) || 0) ? curr : max;
        }, { visitante: 0 });

        const somaInversos =
            (1 / maiorCasa.casa) +
            (1 / maiorEmpate.empate) +
            (1 / maiorVisitante.visitante);

        const margem = (somaInversos * 100).toFixed(2);

        return {
            chave,
            jogo: chave.split('||')[0],
            mercado: chave.split('||')[1],
            margem: parseFloat(margem),
            odds: {
                casa: maiorCasa.casa,
                empate: maiorEmpate.empate,
                visitante: maiorVisitante.visitante
            },
            casas: {
                casa: maiorCasa.casaNome,
                empate: maiorEmpate.casaNome,
                visitante: maiorVisitante.casaNome
            }
        };
    });

    lista.sort((a, b) => {
        if (a.margem < 100 && b.margem >= 100) return -1;
        if (a.margem >= 100 && b.margem < 100) return 1;
        return a.margem - b.margem;
    });

    let teveSurebet = false;

    lista.forEach(item => {
        const { jogo, mercado, margem, odds, casas } = item;

        const tabela = document.createElement('table');

        const corTexto = margem < 100 ? 'lime' : 'red';
        if (margem < 100) teveSurebet = true;

        const thead = `
          <tr>
            <th colspan="3" style="text-align:center; background:#222; color:#d4af37;">
                ${jogo.toUpperCase()} - ${mercado}<br> 
                <span style="color:${corTexto};">
                  Margem: ${margem}% ${margem < 100 ? '✅ SUREBET' : '❌'}
                </span>
            </th>
          </tr>
          <tr>
            <th>Tipo</th>
            <th>Odd</th>
            <th>Casa</th>
          </tr>
        `;
        tabela.innerHTML = thead;

        const linhasTabela = [
            { tipo: 'Casa', odd: odds.casa || '-', casa: casas.casa || '-' },
            { tipo: 'Empate', odd: odds.empate || '-', casa: casas.empate || '-' },
            { tipo: 'Visitante', odd: odds.visitante || '-', casa: casas.visitante || '-' }
        ];

        linhasTabela.forEach(linha => {
            const tr = document.createElement('tr');

            const tdTipo = document.createElement('td');
            tdTipo.textContent = linha.tipo;

            const tdOdd = document.createElement('td');
            tdOdd.textContent = linha.odd;
            tdOdd.classList.add('highlight');

            const tdCasa = document.createElement('td');
            tdCasa.textContent = linha.casa;

            tr.appendChild(tdTipo);
            tr.appendChild(tdOdd);
            tr.appendChild(tdCasa);

            tabela.appendChild(tr);
        });

        output.appendChild(tabela);
    });

    if (teveSurebet) {
        tocarBip();
    }
}

function ordenarTabelasPorMargem() {
    const output = document.getElementById('output');
    const tabelas = Array.from(output.querySelectorAll('table'));
    const dados = [];

    tabelas.forEach((tabela) => {
        const th = tabela.querySelector('th[colspan="3"]');
        if (th) {
            const texto = th.innerText;
            const regex = /Margem:\s([\d.,]+)%/i;
            const match = texto.match(regex);
            if (match) {
                const margem = parseFloat(match[1].replace(',', '.'));
                dados.push({ margem, tabela });
            }
        }
    });

    if (dados.length === 0) {
        console.log('❌ Nenhuma tabela com margem encontrada.');
        return;
    }

    dados.sort((a, b) => a.margem - b.margem);

    output.innerHTML = '';

    dados.forEach(item => {
        output.appendChild(item.tabela);
    });

    console.log('✅ Tabelas ordenadas pela margem do menor para o maior.');
}
