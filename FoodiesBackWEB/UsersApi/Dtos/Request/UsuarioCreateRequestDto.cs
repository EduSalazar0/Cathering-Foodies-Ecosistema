using System.ComponentModel.DataAnnotations;

namespace UsersApi.Dtos.Request
{
    public class UsuarioCreateRequestDto
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

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public required string Password { get; set; }
    }
}