using Microsoft.AspNetCore.Mvc;
using Task_Manager.Application.Interfaces;

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

        [HttpGet]
        public IEnumerable<ProjetoDTO> Get()
        {
            _projetoServico.Teste();
            return Enumerable.Range(1, 5).Select(index => new ProjetoDTO
            {
                Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            })
            .ToArray();
        }
    }
}
