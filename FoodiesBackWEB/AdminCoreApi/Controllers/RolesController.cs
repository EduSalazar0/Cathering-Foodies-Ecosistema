using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AdminCoreApi.Dtos.Request;
using AdminCoreApi.Services.Interfaces;

namespace AdminCoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "AdminOnly")]
    public class RolesController(IRolesService rolesService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var roles = await rolesService.GetAllRolesAsync();
            return Ok(roles);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateRolRequestDto request)
        {
            var rol = await rolesService.CreateRolAsync(request);
            return CreatedAtAction(nameof(GetAll), new { id = rol.Id }, rol);
        }

        [HttpPost("asignar")]
        public async Task<IActionResult> AsignarRol([FromBody] AsignarRolRequestDto request)
        {
            var resultado = await rolesService.AsignarRolToUsuarioAsync(request);
            return Ok(resultado);
        }

        [HttpPost("remover")]
        public async Task<IActionResult> RemoverRol([FromBody] RemoverRolRequestDto request)
        {
            var resultado = await rolesService.RemoverRolDeUsuarioAsync(request);
            return Ok(resultado);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var resultado = await rolesService.DeleteRolAsync(id);
            return Ok(resultado);
        }
    }
}
