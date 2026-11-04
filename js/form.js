// ==========================================
// GESTÃO DO FORMULÁRIO DE CADASTRO
// ==========================================
const loggedUser = JSON.parse(localStorage.getItem('finance_logged_user'));

if (!loggedUser) {
    window.location.href = 'login.html';
}

const storageKey = `finance_data_${loggedUser.email}`;
const dynamicContainer = document.getElementById('dynamic-items-container');
const btnAddItem = document.getElementById('btn-add-item');
const formFinance = document.getElementById('form-finance');

// Função para criar linha dinâmica no formulário
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

// Carrega os dados existentes nos campos do formulário ao abrir
function loadFormData() {
    const savedData = JSON.parse(localStorage.getItem(storageKey));
    if (!savedData) return;

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
}

loadFormData();

// Submissão do Formulário
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

        // Limpa os campos após salvar para um novo cadastro limpo
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