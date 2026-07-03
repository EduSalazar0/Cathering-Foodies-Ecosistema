using UsersApi.Dtos.Request;

namespace UsersApi.Services.Interfaces
{
    public interface IAuthService
    {
        Task<object> LoginAsync(LoginRequest request);
        Task<object> GetUserInfoAsync(string authorizationHeader);
    }
}