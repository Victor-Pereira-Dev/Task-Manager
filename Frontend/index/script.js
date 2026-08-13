const botaoGrid = document.getElementById('grid-btn');
const botaoFechar = document.getElementById('grid-btn-fechar');
const grid = document.getElementById('meu-grid');
const botaoSair = document.getElementById('sair');
const botaoProjetos = document.getElementById('projects');
const overlay = document.getElementById('overlay-carregando');

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

function AtivarOuDesativarCarregamento(escolha) {
    if (escolha == "ativar") {
        overlay.style.display = 'flex';
        botaoGrid.disabled = true;
        botaoFechar.disabled = true;
        botaoSair.disabled = true;
        botaoProjetos.disabled = true;
    } else if (escolha == "desativar") {
        overlay.style.display = 'none';
        botaoGrid.disabled = false;
        botaoFechar.disabled = false;
        botaoSair.disabled = false;
        botaoProjetos.disabled = false;
    }
}

//Parte da requisição para criar o card (Será utilizada pelo criar do modal).
async function criarCard(proId, titulo, descricao, tipo, coluna, prioridade, usuario) {
    AtivarOuDesativarCarregamento("ativar");
    try {
        const token = localStorage.getItem('token');

        const response = await fetch("/Ticket", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                Pro_Id: proId,
                Titulo: titulo,
                Descricao: descricao,
                Tipo: tipo,
                Coluna: coluna,
                Prioridade: prioridade,
                Usu_Id: usuario
            })
        });

        if (response.status === 401) {
            // token inválido ou expirado
            localStorage.removeItem('token');
            window.location.href = "/login/login.html";
            return;
        } else if (!response.ok) {
            throw new Error(`Erro ao criar projeto: ${response.status}`);
        }

        return true;
    }
    catch (erro) {
        console.error(erro);
    } finally {
        AtivarOuDesativarCarregamento("desativar");
    }
}

//Carregar o board
async function carregarBoard(proId) {
    AtivarOuDesativarCarregamento("ativar");
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
                <div class="card-meta">${ticket.prioridade}</div>
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
    } finally {
        AtivarOuDesativarCarregamento("desativar");
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
const modalOverlay = document.getElementById('modalOverlay');
const btnAbrir = document.getElementById('criarCard');
const btnFechar = document.getElementById('modalClose');
const btnCancel = document.getElementById('btnCancelar');
const form = document.getElementById('formTicket');

function abrirModal() {
    modalOverlay.classList.add('ativo');
    document.getElementById('titulo').focus();
}

function fecharModal() {
    modalOverlay.classList.remove('ativo');
    form.reset();
}

btnAbrir.addEventListener('click', abrirModal);
btnFechar.addEventListener('click', fecharModal);
btnCancel.addEventListener('click', fecharModal);

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) fecharModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('ativo')) fecharModal();
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titulo = document.getElementById('titulo').value.trim();
    const desc = document.getElementById('descricao').value.trim();
    const tipo = document.getElementById('tipo').value;
    const coluna = document.getElementById('coluna').value;
    const prioridade = document.getElementById('prioridade').value;

    if (!titulo || !desc) return;

    const cardCriado = await criarCard(proIdAtual, titulo, desc, tipo, coluna, prioridade, 0);

    if (cardCriado) {
        carregarBoard(proIdAtual)
    }
  
    fecharModal();
});
