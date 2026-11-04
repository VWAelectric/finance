// ==========================================
// PAINEL DE CONTROLE - NAVEGAÇÃO E SESSÃO (Isolado)
// ==========================================
(function() {
    // Lê o utilizador logado de forma segura e privada para este script
    const loggedUser = JSON.parse(localStorage.getItem('finance_logged_user'));

    // Redireciona imediatamente se não estiver logado
    if (!loggedUser) {
        window.location.href = 'login.html';
        return;
    }

    // Exibe o nome de boas-vindas se o elemento existir
    const welcomeEl = document.getElementById('user-welcome');
    if (welcomeEl) {
        welcomeEl.textContent = `Olá, ${loggedUser.name}`;
    }

    // Evento de Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function () {
            localStorage.removeItem('finance_logged_user');
            window.location.href = 'login.html';
        });
    }
})();