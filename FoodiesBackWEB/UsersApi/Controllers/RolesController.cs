using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UsersApi.Dtos.Request;
using UsersApi.Services.Interfaces;

namespace UsersApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RolesController(IRolService rolService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var roles = await rolService.GetAllAsync();
            return Ok(roles);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var rol = await rolService.GetByIdAsync(id);
            return Ok(rol);
        }

        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Create([FromBody] RolCreateRequestDto requestDto)
        {
            var rol = await rolService.CreateAsync(requestDto.Nombre, requestDto.Descripcion);
            return CreatedAtAction(nameof(GetById), new { id = rol.Id }, rol);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            var resultado = await rolService.DeleteAsync(id);
            return Ok(new { success = resultado, message = resultado ? "Rol eliminado correctamente" : "No se pudo eliminar el rol" });
        }
    }
}
