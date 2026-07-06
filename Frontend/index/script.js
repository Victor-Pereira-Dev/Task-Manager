const botao = document.getElementById('grid-btn');
const botaoFechar = document.getElementById('grid-btn-fechar');
const grid = document.getElementById('meu-grid');

botao.addEventListener('click', () => {
    grid.classList.toggle('ativo');
});

botaoFechar.addEventListener('click', () => {
    grid.classList.remove('ativo');
});