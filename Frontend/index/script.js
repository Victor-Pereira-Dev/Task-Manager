const botao = document.getElementById('grid-btn');
const grid = document.getElementById('meu-grid');

botao.addEventListener('click', () => {
    grid.classList.toggle('ativo');
});