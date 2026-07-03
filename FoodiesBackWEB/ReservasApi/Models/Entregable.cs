using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ReservasApi.Models
{
    public class Entregable
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ReservaId { get; set; }

        [StringLength(500)]
        public string? EnlaceTikTok { get; set; }

        [StringLength(500)]
        public string? EnlaceInstagram { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal CantidadGastada { get; set; }

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public DateTime? FechaActualizacion { get; set; }

        // Navegación
        [ForeignKey("ReservaId")]
        public virtual Reserva Reserva { get; set; } = null!;
    }
}