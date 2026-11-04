// 1. Funcionalidade de Mostrar / Ocultar Senha com ícone profissional
const passInput = document.getElementById('login-senha');
const btnTogglePass = document.getElementById('btn-toggle-pass');
const eyeIcon = document.getElementById('eye-icon');

btnTogglePass.addEventListener('click', function() {
    if (passInput.type === 'password') {
        passInput.type = 'text';
        btnTogglePass.setAttribute('title', 'Ocultar senha');
        
        // Desenha o ícone de olho cortado (fechado) de forma profissional
        eyeIcon.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        `;
    } else {
        passInput.type = 'password';
        btnTogglePass.setAttribute('title', 'Mostrar senha');
        
        // Retorna para o ícone de olho aberto limpo
        eyeIcon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        `;
    }
});

// 2. Captura o formulário de login na tela através do ID
const loginForm = document.getElementById('form-login');

// 3. Escuta o evento de envio (quando o usuário clica no botão "Entrar")
loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const emailInput = document.getElementById('login-email').value;
    const passwordValue = passInput.value;

    const users = JSON.parse(localStorage.getItem('finance_users')) || [];
    const foundUser = users.find(user => user.email === emailInput && user.pass === passwordValue);

    if (!foundUser) {
        alert('E-mail ou senha incorretos! Verifique seus dados.');
        return;
    }

    localStorage.setItem('finance_logged_user', JSON.stringify(foundUser));
    window.location.href = 'panel.html';
});