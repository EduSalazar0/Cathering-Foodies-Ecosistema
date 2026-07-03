using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UsersApi.Models
{
    [Table("usuarios")]
    public class Usuario
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("nombre")]
        public required string Nombre { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("apellido")]
        public required string Apellido { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("correo")]
        public required string Correo { get; set; }

        [Required]
        [Column("password_hash")]
        public required string PasswordHash { get; set; }

        [Column("fecha_creacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        [Column("fecha_actualizacion")]
        public DateTime FechaActualizacion { get; set; } = DateTime.UtcNow;

        [Column("activo")]
        public bool Activo { get; set; } = true;

        // Relación con roles
        public virtual ICollection<UsuarioRol> UsuarioRoles { get; set; } = [];
        
        // Propiedad calculada para acceder a los roles directamente
        [NotMapped]
        public IEnumerable<Rol> Roles => UsuarioRoles.Select(ur => ur.Rol).Where(r => r != null)!;
    }
}