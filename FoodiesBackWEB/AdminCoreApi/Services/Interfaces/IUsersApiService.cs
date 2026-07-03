using AdminCoreApi.Dtos.Response;

namespace AdminCoreApi.Services.Interfaces
{
    public interface IUsersApiService
    {
        Task<List<UsuarioResponseDto>> GetAllUsersAsync();
        Task<UsuarioResponseDto?> GetUserByIdAsync(int id);
        Task<bool> DeleteUserAsync(int id);
        Task<List<RolResponseDto>> GetAllRolesAsync();
    }
}
