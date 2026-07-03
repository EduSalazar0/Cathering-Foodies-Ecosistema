using UsersApi.Data.Repositories.Interfaces;
using UsersApi.Dtos.Response;
using UsersApi.Models;
using UsersApi.Services.Interfaces;

namespace UsersApi.Services
{
    public class RolService : IRolService
    {
        private readonly IRolRepository _rolRepository;

        public RolService(IRolRepository rolRepository)
        {
            _rolRepository = rolRepository;
        }

        public async Task<List<RolResponseDto>> GetAllAsync()
        {
            var roles = await _rolRepository.GetAllAsync();
            return roles.Select(MapToResponseDto).ToList();
        }

        public async Task<RolResponseDto?> GetByIdAsync(int id)
        {
            var rol = await _rolRepository.GetByIdAsync(id);
            if (rol == null)
                return null;

            return MapToResponseDto(rol);
        }

        public async Task<RolResponseDto> CreateAsync(string nombre, string? descripcion)
        {
            var nuevoRol = new Rol
            {
                Nombre = nombre,
                Descripcion = descripcion,
                Activo = true
            };

            var rol = await _rolRepository.CreateAsync(nuevoRol);
            return MapToResponseDto(rol);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _rolRepository.DeleteAsync(id);
        }

        private static RolResponseDto MapToResponseDto(Rol rol)
        {
            return new RolResponseDto
            {
                Id = rol.Id,
                Nombre = rol.Nombre,
                Descripcion = rol.Descripcion,
                Activo = rol.Activo
            };
        }
    }
}
