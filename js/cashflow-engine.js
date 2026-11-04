// ==========================================
// CASHFLOW-ENGINE.JS - Módulo de Fluxo de Caixa (Isolado)
// ==========================================

class CashFlowManager {
    constructor(userEmail) {
        this.userEmail = userEmail;
        this.storageKey = `finance_cashflow_${userEmail}`;
        this.init();
    }

    // Inicializa a estrutura caso não exista
    init() {
        if (!localStorage.getItem(this.storageKey)) {
            const initialData = {
                entries: [], // Entradas (Apps e avulsas)
                exits: [],   // Saídas (Contas pagas)
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(initialData));
        }
    }

    // Retorna todos os dados do fluxo de caixa
    getData() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || { entries: [], exits: [] };
    }

    // Adiciona uma nova entrada (Ganhos de app ou avulsa)
    addEntry(description, value, date) {
        const data = this.getData();
        const newEntry = {
            id: 'entry_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            description: description.trim(),
            value: parseFloat(value) || 0,
            date: date || new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };

        data.entries.push(newEntry);
        data.updatedAt = new Date().toISOString();
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        return newEntry;
    }

    // Remove uma entrada pelo ID
    removeEntry(entryId) {
        const data = this.getData();
        data.entries = data.entries.filter(item => item.id !== entryId);
        data.updatedAt = new Date().toISOString();
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    // Calcula o Total de Entradas
    getTotalEntries() {
        const data = this.getData();
        return data.entries.reduce((acc, item) => acc + item.value, 0);
    }

    // Calcula o Total de Saídas (Contas pagas)
    getTotalExits() {
        const data = this.getData();
        return data.exits.reduce((acc, item) => acc + item.value, 0);
    }

    // Calcula o Saldo Atual em Caixa (Entradas - Saídas)
    getBalance() {
        return this.getTotalEntries() - this.getTotalExits();
    }
}