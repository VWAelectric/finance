// ==========================================
// 1. VERIFICAÇÃO DE SEGURANÇA E SESSÃO
// ==========================================
const loggedUser = JSON.parse(localStorage.getItem('finance_logged_user'));

if (!loggedUser) {
    alert('Acesso negado! Faça login para continuar.');
    window.location.href = 'login.html';
} else {
    const welcomeEl = document.getElementById('user-welcome');
    if (welcomeEl) {
        welcomeEl.textContent = `Olá, ${loggedUser.name}`;
    }
}

const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
    btnLogout.addEventListener('click', function () {
        localStorage.removeItem('finance_logged_user');
        alert('Você saiu do sistema.');
        window.location.href = 'login.html';
    });
}


// ==========================================
// 2. ELEMENTOS E CONTROLE DINÂMICO
// ==========================================
const dynamicContainer = document.getElementById('dynamic-items-container');
const btnAddItem = document.getElementById('btn-add-item');
const formFinance = document.getElementById('form-finance');

const storageKey = `finance_data_${loggedUser.email}`;

// Função para criar linha variável no formulário
function createDynamicRow(id = '', name = '', value = '', dueDate = '', totalInstallments = '1', currentInstallment = '1') {
    if (!dynamicContainer) return;

    const row = document.createElement('div');
    row.className = 'dynamic-row';
    row.dataset.id = id || ('var_' + Date.now() + '_' + Math.floor(Math.random() * 1000));

    row.innerHTML = `
        <input type="text" class="var-name" placeholder="Descrição" value="${name}" required style="flex: 2;" title="Nome da Conta">
        <input type="number" step="0.01" class="var-value" placeholder="R$" value="${value}" required style="flex: 1;" title="Valor">
        <input type="date" class="var-date" value="${dueDate}" required style="background-color: #121214; border: 1px solid #29292e; border-radius: 4px; color: #e1e1e6; padding: 8px; flex: 1.5;" title="Vencimento">
        <input type="number" min="1" class="var-installments" placeholder="Parcelas" value="${totalInstallments}" style="flex: 0.8;" title="Total de Parcelas">
        <input type="hidden" class="var-current" value="${currentInstallment}">
        <button type="button" class="btn-remove" title="Excluir linha" style="background-color: #e53935; color: white; border: none; border-radius: 4px; padding: 8px 12px; cursor: pointer; font-weight: bold;">X</button>
    `;

    row.querySelector('.btn-remove').addEventListener('click', function () {
        row.remove();
    });

    dynamicContainer.appendChild(row);
}

if (btnAddItem) {
    btnAddItem.addEventListener('click', function () {
        createDynamicRow();
    });
}


// ==========================================
// 3. RENDERIZAR OS CARDS (COM BOTÃO EDITAR DESATIVADO SE PAGO)
// ==========================================
function renderSummaryCards(dataParam = null) {
    const container = document.getElementById('summary-cards-container') || document.getElementById('cards-summary-container');
    if (!container) return;

    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '15px';
    container.style.width = '100%';

    container.innerHTML = '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data = dataParam || JSON.parse(localStorage.getItem(storageKey));
    if (!data) return;

    let billsList = [];

    const customTitlesMap = {
        casa: 'APARTAMENTO',
        carro: 'CARRO',
        condominio: 'CONDOMÍNIO',
        net: 'INTERNET/NET',
        luz: 'LUZ'
    };

    // Processa Contas Fixas
    if (data.fixed) {
        for (let key in data.fixed) {
            let item = data.fixed[key];
            if (item && item.value && item.date) {
                let labelEl = document.querySelector(`label[for="val-${key}"]`) || document.querySelector(`label[for="date-${key}"]`);
                let displayTitle = '';

                if (labelEl && labelEl.textContent.trim()) {
                    displayTitle = labelEl.textContent.replace(':', '').trim().toUpperCase();
                } else if (item.titleName) {
                    displayTitle = item.titleName.toUpperCase();
                } else {
                    displayTitle = customTitlesMap[key] || key.toUpperCase();
                }

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

    // Processa Contas Variáveis / Parceladas
    if (data.variables && Array.isArray(data.variables)) {
        data.variables.forEach(v => {
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

        // Define se o botão de editar deve estar desativado e com aspeto visual inativo caso esteja pago
        const editButtonHtml = bill.isPaid
            ? `<button disabled class="btn-edit" style="flex: 1; background-color: #555; color: #aaa; border: none; padding: 10px 12px; border-radius: 6px; font-weight: 600; cursor: not-allowed; text-align: center; white-space: nowrap; opacity: 0.6;">Editar</button>`
            : `<button onclick="editBill('${bill.id}')" class="btn-edit" style="flex: 1; background-color: #f39c12; color: #fff; border: none; padding: 10px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; text-align: center; white-space: nowrap;">Editar</button>`;

        card.innerHTML = `
            <div class="bill-info">
                <h3>${bill.title}${subtitleDisplay} ${bill.isPaid ? '<span style="color: #2ecc71; margin-left: 8px;">✓ Pago</span>' : ''}</h3>
                <p class="bill-value">R$ ${bill.value.toFixed(2)}</p>
                <p>Vencimento: ${formatDate(bill.dueDate)} - ${daysLeft >= 0 ? `${daysLeft} dia(s) restante(s)` : `Atrasado ${Math.abs(daysLeft)} dia(s)`}</p>
                <p class="daily-deposit">Depósito Diário: R$ ${dailyDeposit.toFixed(2)} / dia</p>
            </div>
            <div class="bill-actions" style="display: flex; gap: 10px; margin-top: 14px; width: 100%;">
                <button onclick="advanceInstallment('${bill.id}')" class="btn-pay" style="flex: 1; background-color: ${bill.isPaid ? '#27ae60' : '#2ecc71'}; color: #fff; border: none; padding: 10px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; text-align: center; white-space: nowrap;">
                    ${bill.isPaid ? '✓ Pago' : 'Pagar'}
                </button>
                ${editButtonHtml}
                <button onclick="deleteBill('${bill.id}')" class="btn-delete" style="flex: 1; background-color: #e74c3c; color: #fff; border: none; padding: 10px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; text-align: center; white-space: nowrap;">Excluir</button>
            </div>
        `;
        container.appendChild(card);
    });
}


// ==========================================
// 4. FUNÇÕES DE GESTÃO DO CARD
// ==========================================
function advanceInstallment(billId) {
    let data = JSON.parse(localStorage.getItem(storageKey));
    if (!data) return;

    let isFixed = billId.startsWith('fixed_');

    if (isFixed) {
        let keyName = billId.replace('fixed_', '');
        if (data.fixed && data.fixed[keyName]) {
            data.fixed[keyName].isPaid = !data.fixed[keyName].isPaid;
        }
    } else {
        if (data.variables && Array.isArray(data.variables)) {
            let targetBill = data.variables.find(v => v.id === billId);
            if (targetBill) {
                let current = targetBill.currentInstallment || 1;
                let total = targetBill.totalInstallments || 1;

                if (current < total) {
                    targetBill.startDate = targetBill.dueDate;

                    let parts = targetBill.dueDate.split('-');
                    let year = parseInt(parts[0], 10);
                    let month = parseInt(parts[1], 10) - 1;
                    let day = parseInt(parts[2], 10);

                    let nextDueDate = new Date(year, month + 1, day);
                    targetBill.dueDate = `${nextDueDate.getFullYear()}-${String(nextDueDate.getMonth() + 1).padStart(2, '0')}-${String(nextDueDate.getDate()).padStart(2, '0')}`;

                    targetBill.currentInstallment++;
                    targetBill.isPaid = false;
                } else {
                    targetBill.isPaid = true;
                    targetBill.isCompleted = true;
                }
            }
        }
    }

    localStorage.setItem(storageKey, JSON.stringify(data));
    renderSummaryCards(data);
}

function editBill(billId) {
    let data = JSON.parse(localStorage.getItem(storageKey));
    if (!data) return;

    let isFixed = billId.startsWith('fixed_');

    if (isFixed) {
        let keyName = billId.replace('fixed_', '');
        let item = data.fixed[keyName];
        if (item) {
            // Se estiver pago, bloqueia a edição por segurança
            if (item.isPaid) {
                alert('Não é possível editar uma conta que já foi paga.');
                return;
            }

            let valInput = document.getElementById(`val-${keyName}`);
            let dateInput = document.getElementById(`date-${keyName}`);

            if (valInput) valInput.value = item.value;
            if (dateInput) dateInput.value = item.date;

            item.value = '';
            item.date = '';
            localStorage.setItem(storageKey, JSON.stringify(data));

            renderSummaryCards(data);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            alert(`A conta foi movida para o formulário para edição.`);
        }
    } else {
        if (data.variables && Array.isArray(data.variables)) {
            let targetIndex = data.variables.findIndex(v => v.id === billId);
            if (targetIndex !== -1) {
                let targetBill = data.variables[targetIndex];

                if (targetBill.isPaid) {
                    alert('Não é possível editar uma conta que já foi paga.');
                    return;
                }

                createDynamicRow(
                    targetBill.id,
                    targetBill.name,
                    targetBill.value,
                    targetBill.dueDate,
                    targetBill.totalInstallments || 1,
                    targetBill.currentInstallment || 1
                );

                data.variables.splice(targetIndex, 1);
                localStorage.setItem(storageKey, JSON.stringify(data));

                renderSummaryCards(data);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                alert('A conta variável foi movida para o formulário para edição.');
            }
        }
    }
}

function deleteBill(billId) {
    if (!confirm('Tem certeza de que deseja excluir esta conta?')) return;

    let data = JSON.parse(localStorage.getItem(storageKey));
    if (!data) return;

    let isFixed = billId.startsWith('fixed_');

    if (isFixed) {
        let keyName = billId.replace('fixed_', '');
        if (data.fixed && data.fixed[keyName]) {
            data.fixed[keyName] = { value: '', date: '', isPaid: false };
            let valInput = document.getElementById(`val-${keyName}`);
            let dateInput = document.getElementById(`date-${keyName}`);
            if (valInput) valInput.value = '';
            if (dateInput) dateInput.value = '';
        }
    } else {
        if (data.variables && Array.isArray(data.variables)) {
            data.variables = data.variables.filter(v => v.id !== billId);
        }
    }

    localStorage.setItem(storageKey, JSON.stringify(data));
    renderSummaryCards(data);
    alert('Conta excluída com sucesso!');
}


// ==========================================
// 5. CARREGAR DADOS NO LOAD E SALVAR
// ==========================================
function loadSavedData() {
    const savedData = JSON.parse(localStorage.getItem(storageKey));

    if (savedData) {
        if (savedData.fixed) {
            for (let key in savedData.fixed) {
                let valInput = document.getElementById(`val-${key}`);
                let dateInput = document.getElementById(`date-${key}`);
                if (valInput) valInput.value = savedData.fixed[key].value || '';
                if (dateInput) dateInput.value = savedData.fixed[key].date || '';
            }
        }

        if (dynamicContainer) dynamicContainer.innerHTML = '';
        if (savedData.variables && Array.isArray(savedData.variables)) {
            savedData.variables.forEach(item => {
                createDynamicRow(
                    item.id,
                    item.name,
                    item.value,
                    item.dueDate,
                    item.totalInstallments || 1,
                    item.currentInstallment || 1
                );
            });
        }

        renderSummaryCards(savedData);
    }
}

loadSavedData();

if (formFinance) {
    formFinance.addEventListener('submit', function (event) {
        event.preventDefault();

        const savedData = JSON.parse(localStorage.getItem(storageKey)) || { fixed: {}, variables: [] };

        const fixedData = {
            casa: {
                value: document.getElementById('val-casa')?.value || '',
                date: document.getElementById('date-casa')?.value || '',
                isPaid: savedData.fixed?.casa?.isPaid || false,
                startDate: savedData.fixed?.casa?.startDate || null,
                titleName: 'APARTAMENTO'
            },
            carro: {
                value: document.getElementById('val-carro')?.value || '',
                date: document.getElementById('date-carro')?.value || '',
                isPaid: savedData.fixed?.carro?.isPaid || false,
                startDate: savedData.fixed?.carro?.startDate || null
            },
            condominio: {
                value: document.getElementById('val-condominio')?.value || '',
                date: document.getElementById('date-condominio')?.value || '',
                isPaid: savedData.fixed?.condominio?.isPaid || false,
                startDate: savedData.fixed?.condominio?.startDate || null
            },
            net: {
                value: document.getElementById('val-net')?.value || '',
                date: document.getElementById('date-net')?.value || '',
                isPaid: savedData.fixed?.net?.isPaid || false,
                startDate: savedData.fixed?.net?.startDate || null
            },
            luz: {
                value: document.getElementById('val-luz')?.value || '',
                date: document.getElementById('date-luz')?.value || '',
                isPaid: savedData.fixed?.luz?.isPaid || false,
                startDate: savedData.fixed?.luz?.startDate || null
            }
        };

        let variablesData = [];

        if (dynamicContainer) {
            const variableRows = dynamicContainer.querySelectorAll('.dynamic-row');
            variableRows.forEach(row => {
                const rId = row.dataset.id;
                const name = row.querySelector('.var-name').value;
                const value = row.querySelector('.var-value').value;
                const date = row.querySelector('.var-date').value;

                const totalInstallments = parseInt(row.querySelector('.var-installments').value, 10) || 1;
                const currentInput = row.querySelector('.var-current');
                const currentInstallment = currentInput ? parseInt(currentInput.value, 10) || 1 : 1;

                if (name && value && date) {
                    const existingVar = savedData.variables ? savedData.variables.find(v => v.id === rId) : null;

                    variablesData.push({
                        id: rId,
                        name,
                        value,
                        dueDate: date,
                        totalInstallments,
                        currentInstallment: existingVar ? existingVar.currentInstallment : currentInstallment,
                        startDate: existingVar ? existingVar.startDate : null,
                        isPaid: existingVar ? existingVar.isPaid : false
                    });
                }
            });
        }

        const budgetData = {
            fixed: fixedData,
            variables: variablesData,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem(storageKey, JSON.stringify(budgetData));
        renderSummaryCards(budgetData);

        for (let key in fixedData) {
            const valInput = document.getElementById(`val-${key}`);
            const dateInput = document.getElementById(`date-${key}`);
            if (valInput) valInput.value = '';
            if (dateInput) dateInput.value = '';
        }

        if (dynamicContainer) dynamicContainer.innerHTML = '';

        alert('Orçamento salvo com sucesso!');
    });
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}