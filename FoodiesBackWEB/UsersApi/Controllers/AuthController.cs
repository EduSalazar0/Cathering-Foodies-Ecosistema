using Microsoft.AspNetCore.Mvc;
using UsersApi.Dtos.Request;
using UsersApi.Services.Interfaces;

namespace UsersApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController(IAuthService authService) : ControllerBase
    {
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var result = await authService.LoginAsync(request);
            return Ok(result);
        }

        [HttpGet("userinfo")]
        public async Task<IActionResult> GetUserInfo()
        {
            var authorizationHeader = Request.Headers["Authorization"].FirstOrDefault();
            var result = await authService.GetUserInfoAsync(authorizationHeader!);
            return Ok(result);
        }
    }
}