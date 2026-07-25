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

//Parte do Modal
const overlayProjeto = document.getElementById('modalOverlayProjeto');
const btnAbrirProjeto = document.getElementById('criarProjeto');
const btnFecharProjeto = document.getElementById('modalCloseProjeto');
const btnCancelProjeto = document.getElementById('btnCancelarProjeto');
const formProjeto = document.getElementById('formProjeto');
const gridProjetos = document.querySelector('.projetos-grid');

function abrirModalProjeto() {
    overlayProjeto.classList.add('ativo');
    document.getElementById('nomeProjeto').focus();
}

function fecharModalProjeto() {
    overlayProjeto.classList.remove('ativo');
    formProjeto.reset();
}

btnAbrirProjeto.addEventListener('click', abrirModalProjeto);
btnFecharProjeto.addEventListener('click', fecharModalProjeto);
btnCancelProjeto.addEventListener('click', fecharModalProjeto);

overlayProjeto.addEventListener('click', (e) => {
    if (e.target === overlayProjeto) fecharModalProjeto();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlayProjeto.classList.contains('ativo')) fecharModalProjeto();
});

async function criarProjeto(dadosProjeto) {
    const token = localStorage.getItem('token');

    const response = await fetch('/Projeto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            teste: dadosProjeto.nome
        })
    });

    if (!response.ok) {
        throw new Error(`Erro ao criar projeto: ${response.status}`);
    }

    return response.json(); 
}


function gerarAvatares(membrosTexto) {
    if (!membrosTexto) return '';

    return membrosTexto
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean)
        .map((m) => `<div class="projeto-avatar">${m.slice(0, 2).toUpperCase()}</div>`)
        .join('');
}

function criarCardProjeto(projeto) {
    const card = document.createElement('div');
    card.className = 'projeto-card';
    card.dataset.id = projeto.id;


    //TODO: Semelhante ao do Ticket, mudar isso daqui quando acabar de implementar o back-end e chamar um get de volta, se for interessante.
    card.innerHTML = `
        <div class="projeto-card-topo">
            <div>
                <p class="projeto-nome">${projeto.nome}</p>
                <p class="projeto-descricao">${projeto.descricao || ''}</p>
            </div>
            <span class="projeto-status ${projeto.status}">${projeto.status}</span>
        </div>
 
        <div class="projeto-barra-fundo">
            <div class="projeto-barra-preenchida" style="width: 0%;"></div>
        </div>
 
        <div class="projeto-colunas">
            <span class="projeto-coluna-pill backlog">0</span>
            <span class="projeto-coluna-pill development">0</span>
            <span class="projeto-coluna-pill progress">0</span>
            <span class="projeto-coluna-pill done">0</span>
        </div>
 
        <div class="projeto-rodape">
            <span>Criado agora</span>
            <div class="projeto-membros">
                ${gerarAvatares(projeto.membros)}
            </div>
        </div>
    `;

    // Clique no card leva pro board daquele projeto
    card.addEventListener('click', () => {
        window.location.href = `board.html?projeto=${projeto.id}`;
    });

    gridProjetos.appendChild(card);
}

formProjeto.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nomeProjeto').value.trim();
    const descricao = document.getElementById('descricaoProjeto').value.trim();
    const status = document.getElementById('statusProjeto').value;
    const membros = document.getElementById('membrosProjeto').value.trim();

    if (!nome) return;

    const btnSubmit = formProjeto.querySelector('.btn-primary');
    btnSubmit.disabled = true;
    btnSubmit.style.opacity = '0.6';

    try {
        const projetoCriado = await criarProjeto({ nome, descricao, status, membros });
        criarCardProjeto({ nome, descricao, status, membros }); //TODO: APOS TERMINAR DE IMPLEMENTAR O BACK, MUDAR O QUE É PASSADO PARA projetoCriado.
        fecharModalProjeto();
    } catch (erro) {
        console.error(erro);
        alert('Não foi possível criar o projeto. Tente novamente.');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.style.opacity = '1';
    }
});
