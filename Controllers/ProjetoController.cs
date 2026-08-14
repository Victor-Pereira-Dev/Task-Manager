using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Task_Manager.Application.Interfaces.Projeto;

namespace Task_Manager.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ProjetoController : ControllerBase
    {
        private readonly IProjetoServico _projetoServico;

        public ProjetoController(IProjetoServico projetoServico)
        {
            _projetoServico = projetoServico;
        }

        [Authorize]
        [HttpGet]
        public async Task<IEnumerable<CarregarProjetoDTO>> CarregarPagina()
        {
            var projeto = await _projetoServico.SelecionarProjeto();
            return projeto;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CriarProjeto(ProjetoDTO dto)
        {
            _projetoServico.SalvarProjeto(dto);
            return Ok();
        }

        [Authorize]
        [HttpPatch]
        public async Task<IActionResult> AtualizarProjeto(ProjetoDTO dto)
        {
            _projetoServico.AtualizarProjeto(dto);
            return Ok();
        }

        [Authorize]
        [HttpDelete]
        public async Task<IActionResult> DeletarProjeto(DeletarProjetoDTO dto)
        {
            _projetoServico.DeletarProjeto(dto);
            return Ok();
        }
    }
}
