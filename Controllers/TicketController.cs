using Microsoft.AspNetCore.Mvc;
using Task_Manager.Application.Services;
using Task_Manager.Application.DTO.Ticket;
using Task_Manager.Application.Interfaces.Ticket;

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

        [HttpPost]
        public IActionResult InserirTicket([FromBody] CriarTicketDTO dto)
        {
            _ticketServico.InserirTicket(dto);

            return Ok();
        }
    }
}
