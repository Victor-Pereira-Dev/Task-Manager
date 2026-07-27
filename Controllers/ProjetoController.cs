using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Task_Manager.Application.Interfaces.Projeto;

namespace Task_Manager.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ProjetoController : ControllerBase
    {
        private static readonly string[] Summaries =
        [
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        ];

        private readonly IProjetoServico _projetoServico;

        public ProjetoController(IProjetoServico projetoServico)
        {
            _projetoServico = projetoServico;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CriarProjeto(ProjetoDTO dto)
        {
            _projetoServico.SalvarProjeto(dto);
            return Ok();
        }
    }
}
