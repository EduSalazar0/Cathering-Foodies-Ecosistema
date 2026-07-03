namespace FormularioFoodieApi.Services.Interfaces
{
    public interface IUsersApiService
    {
        Task<bool> AddRoleToUserAsync(int usuarioId, string roleName);
        Task<bool> ValidateUserExistsAsync(int usuarioId);
        Task<string> GetUserTokenAsync();
        Task<object?> GetCurrentUserAsync();
    }
}