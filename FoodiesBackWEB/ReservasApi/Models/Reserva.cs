using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ReservasApi.Models
{
    public class Reserva
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UsuarioId { get; set; }

        [Required]
        [StringLength(200)]
        public string NombreLocal { get; set; } = string.Empty;

        [Required]
        public DateTime Fecha { get; set; }

        [Required]
        [StringLength(10)]
        public string Hora { get; set; } = string.Empty;

        [Required]
        public int NumeroPersonas { get; set; }

        [Required]
        [StringLength(50)]
        public string EstadoReserva { get; set; } = "Por Ir"; // "Por Ir", "Visita Completada", "Falta Grave"

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public DateTime? FechaActualizacion { get; set; }

        // Propiedad calculada para determinar si se puede cancelar
        public bool PuedeCancelar => 
            EstadoReserva == "Por Ir" && 
            DateTime.Now < Fecha.Add(TimeSpan.Parse(Hora));

        // Propiedad calculada para determinar si está en período de entrega
        public bool EnPeriodoEntrega =>
            EstadoReserva == "Por Ir" &&
            DateTime.Now > Fecha.Add(TimeSpan.Parse(Hora)) &&
            DateTime.Now <= Fecha.Add(TimeSpan.Parse(Hora)).AddHours(48);

        // Propiedad calculada para determinar si debe marcarse como falta grave
        public bool DebeMarcarFaltaGrave =>
            EstadoReserva == "Por Ir" &&
            DateTime.Now > Fecha.Add(TimeSpan.Parse(Hora)).AddHours(48);

        // Navegación a entregables
        public virtual ICollection<Entregable> Entregables { get; set; } = new List<Entregable>();
    }
}