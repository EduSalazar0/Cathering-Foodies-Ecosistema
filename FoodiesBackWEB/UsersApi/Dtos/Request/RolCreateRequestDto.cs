namespace UsersApi.Dtos.Request
{
    public class RolCreateRequestDto
    {
        public required string Nombre { get; set; }
        public string? Descripcion { get; set; }
    }
}
