using System.ComponentModel.DataAnnotations;

namespace ReservasApi.Dtos.Request
{
    public class ActualizarReservaRequest
    {
        [StringLength(200, ErrorMessage = "El nombre del local no puede exceder 200 caracteres")]
        public string? NombreLocal { get; set; }

        public DateTime? Fecha { get; set; }

        [StringLength(10, ErrorMessage = "La hora no puede exceder 10 caracteres")]
        public string? Hora { get; set; }

        [Range(1, 20, ErrorMessage = "El número de personas debe estar entre 1 y 20")]
        public int? NumeroPersonas { get; set; }

        [StringLength(50, ErrorMessage = "El estado no puede exceder 50 caracteres")]
        public string? EstadoReserva { get; set; }
    }
}