using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Task_Manager.Application.DTO.Ticket;
using Task_Manager.Application.Interfaces.Projeto;
using Task_Manager.Application.Interfaces.Ticket;
using Task_Manager.Application.Services;

namespace Task_Manager.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TicketController : ControllerBase
    {
        private readonly ITicketServico _ticketServico;

        public TicketController(ITicketServico ticketServico)
        {
            _ticketServico = ticketServico;
        }

        [Authorize]
        [HttpGet]
        public async Task<IEnumerable<CarregarTicketDTO>> CarregarBoard(int pro_id)
        {
            var board = await _ticketServico.SelecionarBoard(pro_id);
            return board;
        }

        [Authorize]
        [HttpPost]
        public IActionResult InserirTicket([FromBody] CriarTicketDTO dto)
        {
            _ticketServico.InserirTicket(dto);

            return Ok();
        }
    }
}
