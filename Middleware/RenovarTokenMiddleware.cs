using Task_Manager.Application.Interfaces.Login;

namespace Task_Manager.API.Middleware
{
    public class RenovarTokenMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;

        public RenovarTokenMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            _configuration = configuration; 
        }

        public async Task InvokeAsync(HttpContext context, ILoginServico loginServico)
        {
            var user = context.User;

            if (user?.Identity?.IsAuthenticated == true &&
                loginServico.TokenPertoDeExpirar(user, TimeSpan.FromMinutes(Convert.ToInt32(_configuration["Jwt:RenovarToken"]))))
            {
                var novoToken = loginServico.RenovarToken(user);
                context.Response.Headers.Append("X-New-Token", novoToken);
            }

            await _next(context);
        }
    }
}
