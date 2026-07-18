const botaoGrid = document.getElementById('grid-btn');
const botaoFechar = document.getElementById('grid-btn-fechar');
const grid = document.getElementById('meu-grid');
const botaoSair = document.getElementById('sair');
const botaoBoard = document.getElementById('board');
const botaoProjetos = document.getElementById('projects');

//Parte do Grid
botaoGrid.addEventListener('click', () => {
    grid.classList.toggle('ativo');
});

botaoFechar.addEventListener('click', () => {
    grid.classList.remove('ativo');
});

botaoSair.addEventListener('click', () => {
    window.location.href = "/login/login.html";
    //TODO: resetar a sessão antes de enviar pra essa tela.
});

botaoBoard.addEventListener('click', () => {
    window.location.href = "/index/index.html";
});

botaoProjetos.addEventListener('click', () => {
    window.location.href = "/projetos/projetos.html";
});

//Parte da requisição para criar o card (Será utilizada pelo criar do modal).
async function criarCard(proId, titulo, descricao, tipo, coluna, prioridade, responsavel, usuario) {
    try {
        const response = await fetch("/Ticket", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                proId: proId,
                titulo: titulo,
                descricao: descricao,
                tipo: tipo,
                coluna: coluna,
                prioridade: prioridade,
                responsavel: responsavel,
                usuario: usuario
            })
        });

        if (!response.ok) {
            const erro = await response.text();
            console.log(response.status);
            console.log(erro);
            throw new Error("Erro ao criar tarefa.");
        }

        const ticket = await response.json();

        console.log(ticket);
    }
    catch (erro) {
        console.error(erro);
    }
}

//Parte do Modal
const overlay = document.getElementById('modalOverlay');
const btnAbrir = document.getElementById('criarCard');
const btnFechar = document.getElementById('modalClose');
const btnCancel = document.getElementById('btnCancelar');
const form = document.getElementById('formTicket');

function abrirModal() {
    overlay.classList.add('ativo');
    document.getElementById('titulo').focus();
}

function fecharModal() {
    overlay.classList.remove('ativo');
    form.reset();
}

btnAbrir.addEventListener('click', abrirModal);
btnFechar.addEventListener('click', fecharModal);
btnCancel.addEventListener('click', fecharModal);

overlay.addEventListener('click', (e) => {
    if (e.target === overlay) fecharModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('ativo')) fecharModal();
});

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const titulo = document.getElementById('titulo').value.trim();
    const desc = document.getElementById('descricao').value.trim();
    const tipo = document.getElementById('tipo').value;
    const coluna = document.getElementById('coluna').value;
    const prioridade = document.getElementById('prioridade').value;
    const responsavel = document.getElementById('responsavel').value.trim();

    if (!titulo || !desc || !responsavel) return;

    //esse cara, irei substituir provavelmente com um session que pegara na sessão o id do projeto e do usuário que tá criando.
    criarCard("1B86B063-BC48-4D5E-A307-7AC273D40431", titulo, desc, tipo, coluna, prioridade, responsavel, "86F25DDF-9DF7-4795-A88B-D223283C55E4")

    //estrutura da Card criada apenas para teste por enquanto no front, depois irei implementar o metodo de chamada de volta que trará os dados e preencherá as colunas
    //com o que foi criado. (ou talvez deixe assim e so chame no Get da pagina, quem sabe)
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <div class="card-title">${titulo}</div>
        <span class="card-tag">${tipo}</span>
        <div class="card-meta">${prioridade}${responsavel ? ' • ' + responsavel : ''}</div>
    `;

    document.querySelector('.' + coluna).appendChild(card);
    fecharModal();
});
