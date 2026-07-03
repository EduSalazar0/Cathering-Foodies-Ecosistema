using AdminCoreApi.Dtos.Request;
using AdminCoreApi.Dtos.Response;

namespace AdminCoreApi.Services.Interfaces
{
    public interface IRolesService
    {
        Task<List<RolResponseDto>> GetAllRolesAsync();
        Task<RolResponseDto?> CreateRolAsync(CreateRolRequestDto request);
        Task<bool> AsignarRolToUsuarioAsync(AsignarRolRequestDto request);
        Task<bool> RemoverRolDeUsuarioAsync(RemoverRolRequestDto request);
        Task<bool> DeleteRolAsync(int id);
    }
}
