using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FormularioFoodieApi.Dtos.Request;
using FormularioFoodieApi.Services.Interfaces;
using System.Security.Claims;

namespace FormularioFoodieApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FormularioFoodieController(IFormularioFoodieService formularioService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var formularios = await formularioService.GetAllAsync();
            return Ok(formularios);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var formulario = await formularioService.GetByIdAsync(id);
            return Ok(formulario);
        }

        [HttpGet("usuario/{usuarioId:int}")]
        public async Task<IActionResult> GetByUsuarioId(int usuarioId)
        {
            var formulario = await formularioService.GetByUsuarioIdAsync(usuarioId);
            return Ok(formulario);
        }

        [HttpGet("mi-usuario")]
        public async Task<IActionResult> GetMyUser()
        {
            var usuario = await formularioService.GetCurrentUserAsync(User);
            return Ok(usuario);
        }

        [HttpGet("mi-formulario")]
        public async Task<IActionResult> GetMyFormulario()
        {
            var formulario = await formularioService.GetMyFormularioAsync(User);
            return Ok(formulario);
        }

        [HttpGet("estado/{estado}")]
        public async Task<IActionResult> GetByEstado(string estado)
        {
            var formularios = await formularioService.GetByEstadoAsync(estado);
            return Ok(formularios);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] FormularioFoodieCreateRequestDto requestDto)
        {
            var resultado = await formularioService.CreateWithMessageAsync(User, requestDto);
            
            if (resultado.Success)
            {
                return CreatedAtAction(nameof(GetById), new { id = resultado.FormularioData?.Id }, resultado);
            }
            else
            {
                return BadRequest(resultado);
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] FormularioFoodieUpdateRequestDto requestDto)
        {
            var formularioActualizado = await formularioService.UpdateAsync(id, requestDto);
            return Ok(formularioActualizado);
        }

        [HttpPut("mi-formulario")]
        public async Task<IActionResult> UpdateMyFormulario([FromBody] FormularioFoodieUpdateRequestDto requestDto)
        {
            var formularioActualizado = await formularioService.UpdateMyFormularioAsync(User, requestDto);
            return Ok(formularioActualizado);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            var resultado = await formularioService.DeleteAsync(id);
            return Ok(resultado);
        }
    }
}