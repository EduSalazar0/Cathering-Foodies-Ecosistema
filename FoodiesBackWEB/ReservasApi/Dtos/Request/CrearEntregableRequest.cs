using System.ComponentModel.DataAnnotations;

namespace ReservasApi.Dtos.Request
{
    public class CrearEntregableRequest
    {
        [Required(ErrorMessage = "El ID de la reserva es obligatorio")]
        public int ReservaId { get; set; }

        [StringLength(500, ErrorMessage = "El enlace de TikTok no puede exceder 500 caracteres")]
        public string? EnlaceTikTok { get; set; }

        [StringLength(500, ErrorMessage = "El enlace de Instagram no puede exceder 500 caracteres")]
        public string? EnlaceInstagram { get; set; }

        [Range(0, 999999.99, ErrorMessage = "La cantidad gastada debe ser mayor o igual a 0")]
        public decimal CantidadGastada { get; set; }
    }
}