using System.ComponentModel.DataAnnotations;

namespace UsersApi.Dtos.Request
{
    public class UsuarioUpdateRequestDto
    {
        [Required]
        [StringLength(100)]
        public required string Nombre { get; set; }

        [Required]
        [StringLength(100)]
        public required string Apellido { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(255)]
        public required string Correo { get; set; }

        [StringLength(100, MinimumLength = 6)]
        public string? Password { get; set; }
    }
}