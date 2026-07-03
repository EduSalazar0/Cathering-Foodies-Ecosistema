namespace ReservasApi.Services.Interfaces
{
    public interface IUserApiService
    {
        Task<UserInfo?> GetUserByIdAsync(int userId);
    }

    public class UserInfo
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
    }
}