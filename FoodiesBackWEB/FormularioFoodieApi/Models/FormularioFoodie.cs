using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FormularioFoodieApi.Models
{
    [Table("formularios_foodie")]
    public class FormularioFoodie
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("usuario_id")]
        public int UsuarioId { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("nombre_completo")]
        public required string NombreCompleto { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("email")]
        public required string Email { get; set; }

        [Required]
        [MaxLength(15)]
        [Column("numero_personal")]
        public required string NumeroPersonal { get; set; }

        [Required]
        [Column("fecha_nacimiento")]
        public DateTime FechaNacimiento { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("genero")]
        public required string Genero { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("pais")]
        public required string Pais { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("ciudad")]
        public required string Ciudad { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("frecuencia_contenido")]
        public required string FrecuenciaContenido { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("usuario_instagram")]
        public required string UsuarioInstagram { get; set; }

        [Required]
        [Column("seguidores_instagram")]
        public int SeguidoresInstagram { get; set; }

        [Required]
        [Column("cuenta_publica")]
        public bool CuentaPublica { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("usuario_tiktok")]
        public required string UsuarioTikTok { get; set; }

        [Required]
        [Column("seguidores_tiktok")]
        public int SeguidoresTikTok { get; set; }

        [Required]
        [Column("sobre_ti", TypeName = "text")]
        public required string SobreTi { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("acepta_beneficios")]
        public required string AceptaBeneficios { get; set; }

        [Required]
        [Column("acepta_terminos")]
        public bool AceptaTerminos { get; set; }

        [Column("fecha_aplicacion")]
        public DateTime FechaAplicacion { get; set; } = DateTime.UtcNow;

        [Column("fecha_actualizacion")]
        public DateTime? FechaActualizacion { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("estado")]
        public string Estado { get; set; } = "pendiente"; // pendiente, aprobado, rechazado

        [Column("comentarios", TypeName = "text")]
        public string? Comentarios { get; set; }

        [Column("activo")]
        public bool Activo { get; set; } = true;
    }
}