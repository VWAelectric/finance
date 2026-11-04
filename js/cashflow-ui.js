/**
 * cashflow-ui.js - Motor JavaScript Modular para o Fluxo de Caixa
 * Com suporte a calendário nativo (type="date"), datas editáveis e histórico em tempo real.
 */

document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'finance_fluxo_caixa_data';

    // Recupera os dados ou inicia listas limpas
    let dadosCaixa = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        entradas: [],
        saidas: []
    };

    // Preenche com a data de hoje por defeito, mas permitindo alteração total no calendário
    const hojeIso = new Date().toISOString().split('T')[0];
    const inputDataEntrada = document.getElementById('data-entrada');
    const inputDataSaida = document.getElementById('data-saida');

    if (inputDataEntrada && !inputDataEntrada.value) inputDataEntrada.value = hojeIso;
    if (inputDataSaida && !inputDataSaida.value) inputDataSaida.value = hojeIso;

    function formatarMoeda(valor) {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // Converte de AAAA-MM-DD (calendário) para DD/MM/AAAA (exibição no histórico)
    function formatarDataBR(dataIso) {
        if (!dataIso) return '';
        const partes = dataIso.split('-');
        if (partes.length !== 3) return dataIso;
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    function atualizarTela() {
        const listaEl = document.getElementById('historico-lista');
        if (!listaEl) return;

        listaEl.innerHTML = '';

        let totalEntradas = 0;
        let totalSaidas = 0;

        // Renderiza Entradas
        dadosCaixa.entradas.forEach((item, index) => {
            totalEntradas += item.valor;
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="history-info">
                    <strong>${item.descricao}</strong>
                    <span>${item.data}</span>
                </div>
                <div class="history-value positive">
                    + ${formatarMoeda(item.valor)}
                    <button class="btn-delete" onclick="removerItemCaixa('entrada', ${index})" title="Excluir">✕</button>
                </div>
            `;
            listaEl.appendChild(div);
        });

        // Renderiza Saídas
        dadosCaixa.saidas.forEach((item, index) => {
            totalSaidas += item.valor;
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="history-info">
                    <strong>${item.descricao}</strong>
                    <span>${item.data}</span>
                </div>
                <div class="history-value negative">
                    - ${formatarMoeda(item.valor)}
                    <button class="btn-delete" onclick="removerItemCaixa('saida', ${index})" title="Excluir">✕</button>
                </div>
            `;
            listaEl.appendChild(div);
        });

        if (dadosCaixa.entradas.length === 0 && dadosCaixa.saidas.length === 0) {
            listaEl.innerHTML = '<p style="color: #71717a; text-align: center; font-size: 0.9rem; margin-top: 40px;">Nenhum lançamento registado.</p>';
        }

        // Atualiza Visores
        const lcdEntrada = document.getElementById('lcd-total-entrada');
        const lcdSaida = document.getElementById('lcd-total-saida');
        if (lcdEntrada) lcdEntrada.textContent = formatarMoeda(totalEntradas);
        if (lcdSaida) lcdSaida.textContent = formatarMoeda(totalSaidas);

        const saldoReal = totalEntradas - totalSaidas;
        const saldoEl = document.getElementById('lcd-saldo-geral');
        if (saldoEl) {
            saldoEl.textContent = formatarMoeda(saldoReal);
            if (saldoReal < 0) {
                saldoEl.classList.add('negative');
            } else {
                saldoEl.classList.remove('negative');
            }
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dadosCaixa));
    }

    window.removerItemCaixa = function(tipo, index) {
        if (tipo === 'entrada') {
            dadosCaixa.entradas.splice(index, 1);
        } else if (tipo === 'saida') {
            dadosCaixa.saidas.splice(index, 1);
        }
        atualizarTela();
    };

    // Botão Adicionar Entrada
    const btnAddEntrada = document.getElementById('btn-add-entrada');
    if (btnAddEntrada) {
        btnAddEntrada.addEventListener('click', () => {
            const desc = document.getElementById('desc-entrada').value.trim();
            const valor = parseFloat(document.getElementById('valor-entrada').value);
            const dataInput = document.getElementById('data-entrada').value;

            if (!desc || isNaN(valor) || valor <= 0 || !dataInput) {
                alert('Por favor, preencha a descrição, um valor válido e a data.');
                return;
            }

            const dataFormatada = formatarDataBR(dataInput);
            dadosCaixa.entradas.push({ descricao: desc, valor: valor, data: dataFormatada });

            document.getElementById('desc-entrada').value = '';
            document.getElementById('valor-entrada').value = '';
            atualizarTela();
        });
    }

    // Botão Adicionar Saída
    const btnAddSaida = document.getElementById('btn-add-saida');
    if (btnAddSaida) {
        btnAddSaida.addEventListener('click', () => {
            const desc = document.getElementById('desc-saida').value.trim();
            const valor = parseFloat(document.getElementById('valor-saida').value);
            const dataInput = document.getElementById('data-saida').value;

            if (!desc || isNaN(valor) || valor <= 0 || !dataInput) {
                alert('Por favor, preencha a descrição, um valor válido e a data.');
                return;
            }

            const dataFormatada = formatarDataBR(dataInput);
            dadosCaixa.saidas.push({ descricao: desc, valor: valor, data: dataFormatada });

            document.getElementById('desc-saida').value = '';
            document.getElementById('valor-saida').value = '';
            atualizarTela();
        });
    }

    // Impressão / PDF
    const btnGerarPdf = document.getElementById('btn-gerar-pdf');
    if (btnGerarPdf) {
        btnGerarPdf.addEventListener('click', () => {
            window.print();
        });
    }

    atualizarTela();
});