const botaoGrid = document.getElementById('grid-btn');
const botaoFechar = document.getElementById('grid-btn-fechar');
const grid = document.getElementById('meu-grid');
const botaoSair = document.getElementById('sair');
const botaoProjetos = document.getElementById('projects');

//Parte do Grid
botaoGrid.addEventListener('click', () => {
    grid.classList.toggle('ativo');
});

botaoFechar.addEventListener('click', () => {
    grid.classList.remove('ativo');
});

botaoSair.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = "/login/login.html";
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

//Carregar o board
async function carregarBoard(proId) {
    try {
        const token = localStorage.getItem('token');

        const response = await fetch(`/Ticket?pro_id=${proId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = "/login/login.html";
            return;
        } else if (!response.ok) {
            throw new Error(`Erro ao buscar board: ${response.status}`);
        }

        const tickets = await response.json();

        // limpa as colunas antes de repopular (mantendo o <h1> do título de cada uma)
        document.querySelectorAll('.kanban > div').forEach(coluna => {
            coluna.querySelectorAll('.card').forEach(card => card.remove());
        });

        tickets.forEach(ticket => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.id = ticket.tic_Id; 
            card.innerHTML = `
                <div class="card-title">${ticket.titulo}</div>
                <span class="card-tag">${ticket.tipo}</span>
                <div class="card-meta">${ticket.prioridade}${ticket.responsavel ? ' • ' + ticket.responsavel : ''}</div>
            `;

            const colunaEl = document.querySelector(`.${ticket.coluna}`);
            if (colunaEl) {
                colunaEl.appendChild(card);
            } else {
                console.warn(`Coluna "${ticket.coluna}" não encontrada no DOM para o ticket ${ticket.tic_Id}`);
            }
        });

    } catch (erro) {
        console.error(erro);
    }
}

let proIdAtual = null; 

function pegarBoardUrl() {
    const boardTitulo = document.getElementById('boardTitle');
    const params = new URLSearchParams(window.location.search);

    const boardName = params.get('board');
    const proId = params.get('projeto');

    if (boardName) {
        boardTitulo.textContent = decodeURIComponent(boardName);
    } else {
        boardTitulo.textContent = 'Kanban Board';
    }

    if (!proId) {
        console.error('pro_id não encontrado na URL.');
        return;
    }

    proIdAtual = proId;
    carregarBoard(proIdAtual);
}

pegarBoardUrl();

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
