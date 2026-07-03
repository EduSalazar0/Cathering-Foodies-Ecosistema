using System.ComponentModel.DataAnnotations;

namespace ReservasApi.Dtos.Request
{
    public class CrearReservaRequest
    {
        [Required(ErrorMessage = "El nombre del local es obligatorio")]
        [StringLength(200, ErrorMessage = "El nombre del local no puede exceder 200 caracteres")]
        public string NombreLocal { get; set; } = string.Empty;

        [Required(ErrorMessage = "La fecha es obligatoria")]
        public DateTime Fecha { get; set; }

        [Required(ErrorMessage = "La hora es obligatoria")]
        [StringLength(10, ErrorMessage = "La hora no puede exceder 10 caracteres")]
        public string Hora { get; set; } = string.Empty;

        [Required(ErrorMessage = "El número de personas es obligatorio")]
        [Range(1, 20, ErrorMessage = "El número de personas debe estar entre 1 y 20")]
        public int NumeroPersonas { get; set; }
    }
}