using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AdminCoreApi.Services.Interfaces;

namespace AdminCoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "AdminOnly")]
    public class FormulariosController(IFormularioFoodieApiService formularioService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var formularios = await formularioService.GetAllFormulariosAsync();
            return Ok(formularios);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var formulario = await formularioService.GetFormularioByIdAsync(id);
            return Ok(formulario);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var resultado = await formularioService.DeleteFormularioAsync(id);
            return Ok(resultado);
        }
    }
}
