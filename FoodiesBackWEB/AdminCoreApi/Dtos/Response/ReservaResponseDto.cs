namespace AdminCoreApi.Dtos.Response
{
    public class ReservaResponseDto
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public required string NombreLocal { get; set; }
        public DateTime Fecha { get; set; }
        public required string Hora { get; set; }
        public int NumeroPersonas { get; set; }
        public required string EstadoReserva { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }
        public List<EntregableResponseDto> Entregables { get; set; } = new();
    }

    public class EntregableResponseDto
    {
        public int Id { get; set; }
        public int ReservaId { get; set; }
        public string? EnlaceTikTok { get; set; }
        public string? EnlaceInstagram { get; set; }
        public decimal CantidadGastada { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }
    }
}
