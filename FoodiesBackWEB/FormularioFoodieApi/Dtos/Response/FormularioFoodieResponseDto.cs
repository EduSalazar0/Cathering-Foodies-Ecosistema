namespace FormularioFoodieApi.Dtos.Response
{
    public class FormularioFoodieResponseDto
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public required string NombreCompleto { get; set; }
        public required string Email { get; set; }
        public required string NumeroPersonal { get; set; }
        public DateTime FechaNacimiento { get; set; }
        public required string Genero { get; set; }
        public required string Pais { get; set; }
        public required string Ciudad { get; set; }
        public required string FrecuenciaContenido { get; set; }
        public required string UsuarioInstagram { get; set; }
        public int SeguidoresInstagram { get; set; }
        public bool CuentaPublica { get; set; }
        public required string UsuarioTikTok { get; set; }
        public int SeguidoresTikTok { get; set; }
        public required string SobreTi { get; set; }
        public required string AceptaBeneficios { get; set; }
        public bool AceptaTerminos { get; set; }
        public DateTime FechaAplicacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }
        public required string Estado { get; set; }
        public string? Comentarios { get; set; }
        public bool Activo { get; set; }
    }
}