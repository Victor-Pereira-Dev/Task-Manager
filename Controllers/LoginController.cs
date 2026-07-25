using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Task_Manager.Application.DTO.Login;
using Task_Manager.Application.Interfaces.Login;
using Task_Manager.Application.Services;

namespace Task_Manager.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class LoginController : ControllerBase
    {
        private readonly ILoginServico _loginServico;

        public LoginController(ILoginServico loginServico)
        {
            _loginServico = loginServico;
        }

        [HttpPost]
        public async Task<IActionResult> Login(LoginRequestDTO dto)
        {
            var resposta = await _loginServico.ValidarLogin(dto);

            if (resposta == null)
                return Unauthorized("Usuário ou senha inválidos.");

            return Ok(resposta);
        }
    }
}
