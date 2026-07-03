namespace AdminCoreApi.Dtos.Response
{
    public class FormularioFoodieResponseDto
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public string? NombreLocal { get; set; }
        public string? Provincia { get; set; }
        public string? Ciudad { get; set; }
        public string? Direccion { get; set; }
        public string? Telefono { get; set; }
        public string? TipoComida { get; set; }
        public string? Descripcion { get; set; }
        public required string Estado { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime FechaActualizacion { get; set; }
    }
}
