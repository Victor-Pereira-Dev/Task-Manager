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

// Guarda os tickets carregados para a edição poder achar o ticket clicado
let ticketsAtuais = [];

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
        ticketsAtuais = tickets;

        // limpa as colunas antes de repopular (mantendo o <h1> do título de cada uma)
        document.querySelectorAll('.kanban > div').forEach(coluna => {
            coluna.querySelectorAll('.card').forEach(card => card.remove());
        });

        tickets.forEach(ticket => {
                const card = document.createElement('div');
                card.className = `card prioridade-${ticket.prioridade}`;
                card.dataset.id = ticket.tic_Id;
                card.draggable = true;
                card.innerHTML = `
            <div class="card-header">
                <span class="card-tag tag-${ticket.tipo}">${ticket.tipo}</span>
                <span class="card-id">#${ticket.tic_Id}</span>
            </div>
            <div class="card-title">${ticket.titulo}</div>
            <div class="card-footer">
                <span class="card-priority priority-${ticket.prioridade}">
                    <span class="priority-dot"></span>${ticket.prioridade}
                </span>
            </div>
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

//PARTE DA EDIÇÃO DO BOARD
let idTicketEmEdicao = null;
const overlayEditar = document.getElementById('modalOverlayEditar');
const btnFecharEditar = document.getElementById('modalCloseEditar');
const formTicketEditar = document.getElementById('formTicketEditar');
const kanban = document.querySelector('.kanban');

btnFecharEditar.addEventListener('click', fecharModalEditar);

overlayEditar.addEventListener('click', (e) => {
    if (e.target === overlayEditar) fecharModalEditar();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlayEditar.classList.contains('ativo')) fecharModalEditar();
});

function abrirModalEditar(ticket) {
    idTicketEmEdicao = ticket.tic_Id;

    document.getElementById('tituloEditar').value = ticket.titulo;
    document.getElementById('tipoEditar').value = ticket.tipo;
    document.getElementById('descricaoEditar').value = ticket.descricao;
    document.getElementById('colunaEditar').value = ticket.coluna;
    document.getElementById('prioridadeEditar').value = ticket.prioridade;

    overlayEditar.classList.add('ativo');
}

function fecharModalEditar() {
    overlayEditar.classList.remove('ativo');
    formTicketEditar.reset();
}

// Clique em qualquer card (ou no botão de editar dentro dele) abre o modal de edição,
kanban.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;

    const idTicket = card.dataset.id;
    const ticket = ticketsAtuais.find(t => t.tic_Id == idTicket);

    if (ticket) {
        abrirModalEditar(ticket);
    }
});

formTicketEditar.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!idTicketEmEdicao) return;

    const titulo = document.getElementById('tituloEditar').value.trim();
    const tipo = document.getElementById('tipoEditar').value.trim();
    const descricao = document.getElementById('descricaoEditar').value;
    const coluna = document.getElementById('colunaEditar').value.trim();
    const prioridade = document.getElementById('prioridadeEditar').value;

    if (!titulo) return;

    const btnSubmit = formTicketEditar.querySelector('.btn-primary');
    btnSubmit.disabled = true;
    btnSubmit.style.opacity = '0.6';

    try {
        const ticketEditado = await EditarTicket({ titulo, tipo, descricao, coluna, prioridade, idTicketEmEdicao });
        if (ticketEditado) {
            fecharModalEditar();
            carregarBoard(proIdAtual);
        }
    } catch (erro) {
        console.error(erro);
        alert('Não foi possível editar o ticket. Tente novamente.');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.style.opacity = '1';
    }
});

async function EditarTicket(dadosTicket) {
    AtivarOuDesativarCarregamento("ativar");

    try {
        const token = localStorage.getItem('token');

        const response = await fetch('/Ticket', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                Tic_Id: dadosTicket.idTicketEmEdicao,
                Pro_Id: proIdAtual,
                Titulo: dadosTicket.titulo,
                Descricao: dadosTicket.descricao,
                Tipo: dadosTicket.tipo,
                Coluna: dadosTicket.coluna,
                Prioridade: dadosTicket.prioridade
            })
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = "/login/login.html";
            return;
        } else if (!response.ok) {
            throw new Error(`Erro ao editar ticket: ${response.status}`);
        }

        return true;
    }
    catch (erro) {
        console.error(erro);
    } finally {
        AtivarOuDesativarCarregamento("desativar");
    }
}

document.getElementById("btnDeletarTicket").addEventListener("click", async (e) => {
    e.preventDefault();

    if (!idTicketEmEdicao) return;

    const titulo = document.getElementById('tituloEditar').value.trim();
    const tipo = document.getElementById('tipoEditar').value.trim();
    const descricao = document.getElementById('descricaoEditar').value;
    const coluna = document.getElementById('colunaEditar').value.trim();
    const prioridade = document.getElementById('prioridadeEditar').value;

    if (!titulo) return;

    const btnSubmit = formTicketEditar.querySelector('.btn-primary');
    btnSubmit.disabled = true;
    btnSubmit.style.opacity = '0.6';

    try {
        const ticketDeletado = await DeletarTicket();
        if (ticketDeletado) {
            fecharModalEditar();
            carregarBoard(proIdAtual);
        }
    } catch (erro) {
        console.error(erro);
        alert('Não foi possível editar o ticket. Tente novamente.');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.style.opacity = '1';
    }
});

async function DeletarTicket() {
    AtivarOuDesativarCarregamento("ativar");

    try {
        const token = localStorage.getItem('token');

        const response = await fetch('/Ticket', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                Tic_Id: idTicketEmEdicao,
                Pro_Id: proIdAtual
            })
        });

        if (response.status === 401) {
            // token inválido ou expirado
            localStorage.removeItem('token');
            window.location.href = "/login/login.html";
            return;
        } else if (!response.ok) {
            throw new Error(`Erro ao criar ticket: ${response.status}`);
        }

        return true;
    }
    catch (erro) {
        console.log(erro);
    }
    finally {
        AtivarOuDesativarCarregamento("desativar");
    }

}

let cardArrastado = null;

// Quando começa a arrastar
document.addEventListener('dragstart', (e) => {

    const card = e.target.closest('.card');

    if (!card) return;

    cardArrastado = card;

    card.classList.add('arrastando');

    e.dataTransfer.effectAllowed = 'move';
});


// Quando termina de arrastar
document.addEventListener('dragend', (e) => {

    const card = e.target.closest('.card');

    if (!card) return;

    card.classList.remove('arrastando');

    cardArrastado = null;

    document.querySelectorAll('.kanban > div').forEach(coluna => {
        coluna.classList.remove('drag-over');
    });
});


// Permite soltar dentro das colunas
document.querySelectorAll('.kanban > div').forEach(coluna => {

    coluna.addEventListener('dragover', (e) => {
        e.preventDefault();

        coluna.classList.add('drag-over');

        e.dataTransfer.dropEffect = 'move';
    });


    coluna.addEventListener('dragleave', () => {
        coluna.classList.remove('drag-over');
    });


    coluna.addEventListener('drop', async (e) => {

        e.preventDefault();

        coluna.classList.remove('drag-over');

        if (!cardArrastado) return;

        const novaColuna = coluna.dataset.coluna;
        const idTicket = cardArrastado.dataset.id;

        // Procura o ticket no array
        const ticket = ticketsAtuais.find(t => t.tic_Id == idTicket);

        if (!ticket) return;

        // Se já está nessa coluna, não faz nada
        if (ticket.coluna === novaColuna) return;

        // Move visualmente o card
        coluna.appendChild(cardArrastado);

        // Atualiza o objeto local
        ticket.coluna = novaColuna;

        // Atualiza no banco
        const atualizado = await EditarTicket({
            idTicketEmEdicao: idTicket,
            titulo: ticket.titulo,
            descricao: ticket.descricao,
            tipo: ticket.tipo,
            coluna: novaColuna,
            prioridade: ticket.prioridade
        });

        if (!atualizado) {
            // Se der erro, recarrega o board
            carregarBoard(proIdAtual);
        }
    });

});

