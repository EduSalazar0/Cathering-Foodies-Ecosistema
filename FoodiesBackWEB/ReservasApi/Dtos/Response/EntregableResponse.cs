namespace ReservasApi.Dtos.Response
{
    public class EntregableResponse
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