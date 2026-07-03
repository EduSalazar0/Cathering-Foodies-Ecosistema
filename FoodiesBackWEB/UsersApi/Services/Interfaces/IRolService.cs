using UsersApi.Dtos.Response;

namespace UsersApi.Services.Interfaces
{
    public interface IRolService
    {
        Task<List<RolResponseDto>> GetAllAsync();
        Task<RolResponseDto?> GetByIdAsync(int id);
        Task<RolResponseDto> CreateAsync(string nombre, string? descripcion);
        Task<bool> DeleteAsync(int id);
    }
}
