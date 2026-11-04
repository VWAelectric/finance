// 1. Captura o formulário de cadastro na tela através do ID
const registerForm = document.getElementById('form-register');

// 2. Escuta o evento de envio (quando o usuário clica no botão "Cadastrar")
registerForm.addEventListener('submit', function(event) {
    // Evita que a página recarregue automaticamente ao enviar o formulário
    event.preventDefault();

    // 3. Pega os valores digitados nos inputs
    const nameInput = document.getElementById('reg-nome').value;
    const emailInput = document.getElementById('reg-email').value;
    const passInput = document.getElementById('reg-senha').value;

    // 4. Busca se já existem usuários salvos no localStorage (ou inicia uma lista vazia)
    const users = JSON.parse(localStorage.getItem('finance_users')) || [];

    // 5. Verifica se o e-mail informado já foi cadastrado anteriormente
    const userExists = users.some(user => user.email === emailInput);
    if (userExists) {
        alert('Este e-mail já está cadastrado! Tente fazer login ou use outro e-mail.');
        return; // Interrompe a execução
    }

    // 6. Cria um objeto com os dados do novo usuário
    const newUser = {
        name: nameInput,
        email: emailInput,
        pass: passInput
    };

    // 7. Adiciona o novo usuário na lista e salva novamente no localStorage
    users.push(newUser);
    localStorage.setItem('finance_users', JSON.stringify(users));

    // 8. Mensagem de sucesso e redirecionamento para a tela de login
    alert('Cadastro realizado com sucesso! Faça login para continuar.');
    window.location.href = 'login.html';
});
