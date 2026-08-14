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

//PARTE DA EDIÇÃO DE MODALS
let projetos = []; //Deixo esse cara para depois que carregar, a função de editar utilizar
let idProjetoEmEdicao = null;
const overlayEditar = document.getElementById('modalOverlayEditarProjeto');
const btnFecharEditarProjeto = document.getElementById('modalCloseEditarProjeto');
const formEditarProjeto = document.getElementById('formEditarProjeto');

btnFecharEditarProjeto.addEventListener('click', fecharModalEditar);

overlayEditar.addEventListener('click', (e) => {
    if (e.target === overlayEditar) fecharModalEditar();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlayEditar.classList.contains('ativo')) fecharModalEditar();
});
function abrirModalEditar(projeto) {
    idProjetoEmEdicao = projeto.pro_Id;

    document.getElementById('nomeProjetoEditar').value = projeto.nome;
    document.getElementById('descricaoProjetoEditar').value = projeto.descricao;
    document.getElementById('statusProjetoEditar').value = projeto.status;

    overlayEditar.classList.add('ativo');
}

function fecharModalEditar() {
    overlayEditar.classList.remove('ativo');
    formEditarProjeto.reset();
}

function AtivarOuDesativarCarregamento (escolha) {
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


//Carregar os projetos
async function carregarProjeto() {
    AtivarOuDesativarCarregamento("ativar");
    try {
        const token = localStorage.getItem('token');

        const response = await fetch('/Projeto', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401) {
            // token inválido ou expirado
            localStorage.removeItem('token');
            window.location.href = "/login/login.html";
            return;
        } else if (!response.ok) {
            throw new Error(`Erro ao buscar projetos: ${response.status}`);
        }

        projetos = await response.json();

        const container = document.getElementById('projetos-grid');
        container.innerHTML = '';

        projetos.forEach(projeto => {
            const card = document.createElement('div');
            card.className = 'projeto-card';
            card.dataset.id = projeto.pro_Id;

            const qtdBacklog = projeto.qtd_Backlog ?? 0;
            const qtdDevelopment = projeto.qtd_Development ?? 0;
            const qtdProgress = projeto.qtd_Progress ?? 0;
            const qtdDone = projeto.qtd_Done ?? 0;

            card.innerHTML = `
                <div class="projeto-card-topo">
                    <div>
                        <p class="projeto-nome">${projeto.nome}</p>
                        <p class="projeto-descricao">${projeto.descricao || ''}</p>
                    </div>
                    <span class="projeto-status ${projeto.status}">${projeto.status}</span>
                    <button class="projeto-editar-btn" title="Editar projeto">
                        <span class="material-icons-outlined">edit</span>
                    </button>
                </div>

                <div class="projeto-barra-fundo">
                    <div class="projeto-barra-preenchida" style="width: ${projeto.percentualConcluido}%;"></div>
                </div>

                <div class="projeto-colunas">
                    <span class="projeto-coluna-pill backlog">${qtdBacklog}</span>
                    <span class="projeto-coluna-pill development">${qtdDevelopment}</span>
                    <span class="projeto-coluna-pill progress">${qtdProgress}</span>
                    <span class="projeto-coluna-pill done">${qtdDone}</span>
                </div>

                <div class="projeto-rodape">
                    <span>Criado em ${new Date(projeto.criado_em).toLocaleDateString()}</span>
                </div>
            `;

            container.appendChild(card);
        })
    } catch (erro) {
        console.error(erro);
    } finally {      
        AtivarOuDesativarCarregamento("desativar");
    }    
}

carregarProjeto();

gridProjetos.addEventListener('click', async (e) => {
    const card = e.target.closest('.projeto-card');
    if (!card) return;

    const idProjeto = card.dataset.id;
    const projeto = projetos.find(p => p.pro_Id == idProjeto);

    const botaoEditar = e.target.closest('.projeto-editar-btn');
    if (botaoEditar) {
        abrirModalEditar(projeto);
        return;
    }

    window.location.href = `/index/index.html?projeto=${idProjeto}&board=${encodeURIComponent(projeto.nome)}`;
});

async function criarProjeto(dadosProjeto) {
    AtivarOuDesativarCarregamento("ativar");

    try {
        const token = localStorage.getItem('token');

        const response = await fetch('/Projeto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                Nome: dadosProjeto.nome,
                Descricao: dadosProjeto.descricao,
                Status: dadosProjeto.status
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
        console.log(erro);
    }
    finally {
        AtivarOuDesativarCarregamento("desativar");
    }
    
}

async function EditarProjeto(dadosProjeto) {
    AtivarOuDesativarCarregamento("ativar");

    try {
        const token = localStorage.getItem('token');

        const response = await fetch('/Projeto', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                Nome: dadosProjeto.nome,
                Descricao: dadosProjeto.descricao,
                Status: dadosProjeto.status,
                Pro_id: dadosProjeto.idProjetoEmEdicao
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
        console.log(erro);
    }
    finally {
        AtivarOuDesativarCarregamento("desativar");
    }

}

async function DeletarProjeto() {
    AtivarOuDesativarCarregamento("ativar");

    try {
        const token = localStorage.getItem('token');

        const response = await fetch('/Projeto', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                Pro_id: idProjetoEmEdicao
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
        console.log(erro);
    }
    finally {
        AtivarOuDesativarCarregamento("desativar");
    }

}

formProjeto.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nomeProjeto').value.trim();
    const descricao = document.getElementById('descricaoProjeto').value.trim();
    const status = document.getElementById('statusProjeto').value;

    if (!nome) return;

    const btnSubmit = formProjeto.querySelector('.btn-primary');
    btnSubmit.disabled = true;
    btnSubmit.style.opacity = '0.6';

    try {
        const projetoCriado = await criarProjeto({ nome, descricao, status });
        if (projetoCriado) {
            carregarProjeto();
        }      
        fecharModalProjeto();
    } catch (erro) {
        console.error(erro);
        alert('Não foi possível criar o projeto. Tente novamente.');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.style.opacity = '1';
    }
});

formEditarProjeto.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!idProjetoEmEdicao) return;

    const nome = document.getElementById('nomeProjetoEditar').value.trim();
    const descricao = document.getElementById('descricaoProjetoEditar').value.trim();
    const status = document.getElementById('statusProjetoEditar').value;

    if (!nome) return;

    const btnSubmit = formEditarProjeto.querySelector('.btn-primary');
    btnSubmit.disabled = true;
    btnSubmit.style.opacity = '0.6';

    try {
        const projetoEditado = await EditarProjeto({ nome, descricao, status, idProjetoEmEdicao });
        if (projetoEditado) {
            fecharModalEditar();
            carregarProjeto();
        }
    } catch (erro) {
        console.error(erro);
        alert('Não foi possível editar o projeto. Tente novamente.');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.style.opacity = '1';
    }
});

document.getElementById("btnDeletarProjeto").addEventListener("click", async (e) => {
    e.preventDefault();

    if (!idProjetoEmEdicao) return;

    const nome = document.getElementById('nomeProjetoEditar').value.trim();
    const descricao = document.getElementById('descricaoProjetoEditar').value.trim();
    const status = document.getElementById('statusProjetoEditar').value;

    if (!nome) return;

    const btnSubmit = formEditarProjeto.querySelector('.btn-primary');
    btnSubmit.disabled = true;
    btnSubmit.style.opacity = '0.6';

    try {
        const projetoDeletado = await DeletarProjeto();
        if (projetoDeletado) {
            fecharModalEditar();
            carregarProjeto();
        }
    } catch (erro) {
        console.error(erro);
        alert('Não foi possível editar o projeto. Tente novamente.');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.style.opacity = '1';
    }
});