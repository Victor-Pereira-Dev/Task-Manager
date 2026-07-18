const botao = document.getElementById('enter-btn');
const overlay = document.getElementById('overlay-carregando');

async function Logar(login, senha) {
    const response = await fetch('/Login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            Login: login,
            Senha: senha
        })
    });

    if (!response.ok) {
        throw new Error(`Erro ao efetuar login: ${response.status}`);
    }

    return response.json();
}

botao.addEventListener("click", async () => {
    const login = document.getElementById('usuario').value; 
    const senha = document.getElementById('senha').value; 

    overlay.style.display = 'flex';
    botao.disabled = true;

    try {
        const usuario = await Logar(login, senha);
        console.log('Login efetuado:', usuario);
        window.location.href = "/index/index.html";
    } catch (erro) {
        console.error(erro);
        alert("Usuário ou senha inválidos.");
    } finally {
        overlay.style.display = 'none';
        botao.disabled = false;
    }
});