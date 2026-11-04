// ==========================================
// CARDS.JS - Gestão e Visualização de Cartões
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const loggedUser = JSON.parse(localStorage.getItem('finance_logged_user'));
    if (!loggedUser || !loggedUser.email) {
        window.location.href = 'login.html';
        return;
    }

    const storageKey = `finance_data_${loggedUser.email}`;

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function renderSummaryCards() {
        const container = document.getElementById('summary-cards-container') || document.getElementById('cards-summary-container');
        if (!container) return;

        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '15px';
        container.style.width = '100%';
        container.innerHTML = '';

        let savedData = JSON.parse(localStorage.getItem(storageKey));
        if (!savedData) {
            savedData = JSON.parse(localStorage.getItem('finance_data')) || JSON.parse(localStorage.getItem('finance_budget'));
        }

        if (!savedData) {
            container.innerHTML = '<p style="color: #a1a1aa; text-align: center; width: 100%;">Nenhum orçamento cadastrado ainda.</p>';
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let billsList = [];

        const customTitlesMap = {
            'casa': 'APARTAMENTO',
            'apartamento': 'APARTAMENTO',
            'apto': 'APARTAMENTO',
            'carro': 'CARRO',
            'condominio': 'CONDOMÍNIO',
            'net': 'INTERNET/NET',
            'internet': 'INTERNET/NET',
            'luz': 'LUZ'
        };

        // 1. Processa Contas Fixas
        if (savedData.fixed) {
            for (let key in savedData.fixed) {
                let item = savedData.fixed[key];
                if (item && item.value && item.date) {
                    let displayTitle = customTitlesMap[key.toLowerCase()] || key.toUpperCase();
                    if (item.titleName) displayTitle = item.titleName.toUpperCase();

                    billsList.push({
                        id: `fixed_${key}`,
                        type: 'fixed',
                        keyName: key,
                        title: displayTitle,
                        value: parseFloat(item.value) || 0,
                        dueDate: item.date,
                        startDate: item.startDate || null,
                        isPaid: item.isPaid || false,
                        installmentText: ''
                    });
                }
            }
        }

        // 2. Processa Contas Variáveis / Parceladas
        if (savedData.variables && Array.isArray(savedData.variables)) {
            savedData.variables.forEach(v => {
                if (v.name && v.value && v.dueDate) {
                    let cur = v.currentInstallment || 1;
                    let tot = v.totalInstallments || 1;
                    billsList.push({
                        id: v.id,
                        type: 'variable',
                        title: v.name,
                        value: parseFloat(v.value) || 0,
                        dueDate: v.dueDate,
                        startDate: v.startDate || null,
                        isPaid: v.isPaid || false,
                        installmentText: `Parcela ${cur}/${tot}`,
                        currentInstallment: cur,
                        totalInstallments: tot
                    });
                }
            });
        }

        if (billsList.length === 0) {
            container.innerHTML = '<p style="color: #a1a1aa; text-align: center; width: 100%;">Nenhuma conta registada para o painel.</p>';
            return;
        }

        billsList.forEach(bill => {
            let daysLeft = 0;
            let dailyDeposit = 0;
            let isOverdue = false;

            if (bill.dueDate) {
                const due = new Date(bill.dueDate + 'T00:00:00');
                let baselineDate = today;

                if (bill.startDate && bill.startDate !== bill.dueDate) {
                    const recordedStart = new Date(bill.startDate + 'T00:00:00');
                    if (recordedStart > today) {
                        baselineDate = recordedStart;
                    }
                }

                daysLeft = Math.ceil((due - baselineDate) / (1000 * 60 * 60 * 24));

                if (due < today) {
                    isOverdue = true;
                    daysLeft = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
                    dailyDeposit = 0;
                } else if (due.getTime() === today.getTime()) {
                    daysLeft = 0;
                    dailyDeposit = bill.value;
                } else if (!bill.isPaid) {
                    let divisor = daysLeft > 0 ? daysLeft : 1;
                    dailyDeposit = bill.value / divisor;
                } else {
                    dailyDeposit = 0;
                }
            }

            const card = document.createElement('div');
            card.className = `bill-card ${bill.isPaid ? 'paid' : ''} ${isOverdue ? 'overdue' : ''}`;

            card.style.background = '#202024';
            card.style.padding = '25px';
            card.style.borderRadius = '8px';
            card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
            card.style.width = '100%';
            card.style.maxWidth = '800px';
            card.style.boxSizing = 'border-box';
            card.style.border = bill.isPaid ? '1px solid #00b37e' : '1px solid #29292e';

            const subtitleDisplay = bill.installmentText ? ` (${bill.installmentText})` : '';
            const formattedValue = bill.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const formattedDaily = dailyDeposit ? dailyDeposit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';

            const editButtonHtml = bill.isPaid
                ? `<button disabled class="btn-edit" style="flex: 1; background-color: #555; color: #aaa; border: none; padding: 10px 12px; border-radius: 6px; font-weight: 600; cursor: not-allowed; text-align: center; white-space: nowrap; opacity: 0.6;">Editar</button>`
                : `<button class="btn-edit" data-id="${bill.id}" style="flex: 1; background-color: #fba94c; color: #fff; border: none; padding: 10px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; text-align: center; white-space: nowrap;">Editar</button>`;

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h3 style="margin: 0; color: #e1e1e6; font-size: 1.2rem;">${bill.title}${subtitleDisplay}</h3>
                    <span style="font-weight: bold; color: ${bill.isPaid ? '#00b37e' : '#a1a1aa'};">
                        ${bill.isPaid ? '✓ Pago' : ''}
                    </span>
                </div>
                <div style="font-size: 1.6rem; font-weight: bold; color: #00b37e; margin-bottom: 10px;">
                    ${formattedValue}
                </div>
                <div style="color: #a1a1aa; font-size: 0.9rem; margin-bottom: 5px;">
                    Vencimento: ${formatDate(bill.dueDate)} - ${daysLeft >= 0 ? `${daysLeft} dia(s) restante(s)` : `Atrasado ${Math.abs(daysLeft)} dia(s)`}
                </div>
                <div style="color: #a1a1aa; font-size: 0.9rem; margin-bottom: 20px;">
                    Depósito Diário: ${formattedDaily} / dia
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn-action btn-pay" data-id="${bill.id}" style="flex: 1; background-color: ${bill.isPaid ? '#29292e' : '#00b37e'}; color: white; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer;">
                        ${bill.isPaid ? '✓ Pago' : 'Pagar'}
                    </button>
                    ${editButtonHtml}
                    <button class="btn-action btn-delete" data-id="${bill.id}" style="flex: 1; background: #e53935; color: white; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer;">
                        Excluir
                    </button>
                </div>
            `;
            container.appendChild(card);
        });

        attachCardEvents(savedData, storageKey);
    }

    function attachCardEvents(savedData, storageKey) {
        const container = document.getElementById('summary-cards-container') || document.getElementById('cards-summary-container');
        if (!container) return;

        // Botão Pagar (Usa a mesma lógica exata e segura do dashboard.js com integração ao Fluxo de Caixa)
        container.querySelectorAll('.btn-pay').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const billId = e.target.getAttribute('data-id');
                let data = JSON.parse(localStorage.getItem(storageKey));
                if (!data) return;

                let isFixed = billId.startsWith('fixed_');
                let descricaoConta = '';
                let valorConta = 0;
                let dataConta = new Date().toLocaleDateString('pt-BR');

                if (isFixed) {
                    let keyName = billId.replace('fixed_', '');
                    if (data.fixed && data.fixed[keyName]) {
                        let item = data.fixed[keyName];

                        // 1. Alterna o estado do pagamento (garante que o botão funciona)
                        item.isPaid = !item.isPaid;

                        // 2. Descobre o título de forma segura (sem quebrar se o mapa não estiver no escopo)
                        let displayTitle = keyName.toUpperCase();

                        // Verifica se o dicionário de títulos existe e tem a chave
                        if (typeof customTitlesMap !== 'undefined' && customTitlesMap[keyName.toLowerCase()]) {
                            displayTitle = customTitlesMap[keyName.toLowerCase()];
                        }
                        // Se houver um título próprio gravado no item, usa-o
                        if (item.titleName) {
                            displayTitle = item.titleName.toUpperCase();
                        }

                        descricaoConta = `Conta Fixa: ${displayTitle}`;

                        valorConta = parseFloat(item.valor || item.value || 0);
                        dataConta = item.dueDate || item.data || dataConta;
                    }
                }

                // Salva o estado atualizado das contas
                localStorage.setItem(storageKey, JSON.stringify(data));

                // --- INTEGRAÇÃO COM O FLUXO DE CAIXA ---
                const STORAGE_KEY_FLUXO = 'finance_fluxo_caixa_data';
                let dadosCaixa = JSON.parse(localStorage.getItem(STORAGE_KEY_FLUXO)) || {
                    entradas: [],
                    saidas: []
                };

                if (!Array.isArray(dadosCaixa.saidas)) {
                    dadosCaixa.saidas = [];
                }

                // Adiciona a saída correspondente ao pagamento efetuado
                dadosCaixa.saidas.push({
                    descricao: descricaoConta,
                    valor: valorConta,
                    data: dataConta
                });

                // Salva de volta no localStorage do Fluxo de Caixa
                localStorage.setItem(STORAGE_KEY_FLUXO, JSON.stringify(dadosCaixa));
                // ----------------------------------------

                renderSummaryCards();
            });
        });

        // Botão Editar
        container.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const billId = e.target.getAttribute('data-id');
                let data = JSON.parse(localStorage.getItem(storageKey));
                if (!data) return;

                let isFixed = billId.startsWith('fixed_');
                if (!isFixed) {
                    let targetIndex = data.variables.findIndex(v => v.id === billId);
                    if (targetIndex !== -1) {
                        let targetBill = data.variables[targetIndex];
                        if (targetBill.isPaid) {
                            alert('Não é possível editar uma conta que já foi paga.');
                            return;
                        }
                        // Armazena alvo de edição e redireciona para o form
                        localStorage.setItem(`finance_edit_target_${loggedUser.email}`, `variables_${targetIndex}`);
                        window.location.href = 'form.html';
                    }
                } else {
                    let keyName = billId.replace('fixed_', '');
                    localStorage.setItem(`finance_edit_target_${loggedUser.email}`, `fixed_${keyName}`);
                    window.location.href = 'form.html';
                }
            });
        });

        // Botão Excluir
        container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const billId = e.target.getAttribute('data-id');
                if (!confirm('Tem certeza de que deseja excluir esta conta?')) return;

                let data = JSON.parse(localStorage.getItem(storageKey));
                if (!data) return;

                let isFixed = billId.startsWith('fixed_');

                if (isFixed) {
                    let keyName = billId.replace('fixed_', '');
                    if (data.fixed && data.fixed[keyName]) {
                        data.fixed[keyName] = { value: '', date: '', isPaid: false };
                    }
                } else {
                    if (data.variables && Array.isArray(data.variables)) {
                        data.variables = data.variables.filter(v => v.id !== billId);
                    }
                }

                localStorage.setItem(storageKey, JSON.stringify(data));
                renderSummaryCards();
                alert('Conta excluída com sucesso!');
            });
        });
    }

    renderSummaryCards();
});



/**
 * Função executada ao clicar no botão "Pagar" de qualquer card.
 * Lê os dados do card, abate no saldo real e envia para o Fluxo de Caixa.
 */
window.pagarCardEAtualizarFluxo = function (index) {
    const conta = contas[index];
    if (!conta) {
        alert("Conta não encontrada.");
        return;
    }

    if (!confirm(`Deseja efetuar o pagamento de "${conta.descricao || 'Conta'}" no valor de R$ ${(conta.valor || 0).toFixed(2)}? O valor será debitado do Fluxo de Caixa.`)) {
        return;
    }

    const STORAGE_KEY_FLUXO = 'finance_fluxo_caixa_data';
    const STORAGE_KEY_CONTAS = 'finance_contas_cadastradas_data';

    // 1. Recupera os dados atuais do Fluxo de Caixa do localStorage
    let dadosBrutos = localStorage.getItem(STORAGE_KEY_FLUXO);
    let dadosCaixa = dadosBrutos ? JSON.parse(dadosBrutos) : { entradas: [], saidas: [] };

    if (!Array.isArray(dadosCaixa.saidas)) {
        dadosCaixa.saidas = [];
    }

    // 2. Adiciona automaticamente a conta paga na lista de SAÍDAS
    dadosCaixa.saidas.push({
        descricao: `Conta Paga: ${conta.descricao || 'Conta'}`,
        valor: parseFloat(conta.valor || 0),
        data: conta.data || new Date().toLocaleDateString('pt-BR')
    });

    // 3. Salva de volta no localStorage do Fluxo de Caixa
    localStorage.setItem(STORAGE_KEY_FLUXO, JSON.stringify(dadosCaixa));

    // 4. Remove a conta paga da lista de cards e atualiza o ecrã
    contas.splice(index, 1);
    localStorage.setItem(STORAGE_KEY_CONTAS, JSON.stringify(contas));

    if (typeof atualizarTelaCards === 'function') {
        atualizarTelaCards();
    }

    alert('Pagamento efetuado com sucesso! O valor foi debitado do saldo real e registado no histórico do Fluxo de Caixa.');
};