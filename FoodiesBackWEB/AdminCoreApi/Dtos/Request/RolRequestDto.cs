namespace AdminCoreApi.Dtos.Request
{
    public class CreateRolRequestDto
    {
        public required string Nombre { get; set; }
        public string? Descripcion { get; set; }
    }

    public class AsignarRolRequestDto
    {
        public int UsuarioId { get; set; }
        public required string NombreRol { get; set; }
    }

    public class RemoverRolRequestDto
    {
        public int UsuarioId { get; set; }
        public required string NombreRol { get; set; }
    }
}
