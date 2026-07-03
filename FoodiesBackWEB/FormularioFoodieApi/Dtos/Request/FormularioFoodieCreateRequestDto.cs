using System.ComponentModel.DataAnnotations;

namespace FormularioFoodieApi.Dtos.Request
{
    public class FormularioFoodieCreateRequestDto
    {
        [Required]
        [StringLength(100, MinimumLength = 3)]
        public required string NombreCompleto { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public required string Email { get; set; }

        [Required]
        [RegularExpression(@"^\d{10}$")]
        public required string NumeroPersonal { get; set; }

        [Required]
        public DateTime FechaNacimiento { get; set; }

        [Required]
        [StringLength(20)]
        public required string Genero { get; set; }

        [Required]
        [StringLength(50)]
        public required string Pais { get; set; }

        [Required]
        [StringLength(50)]
        public required string Ciudad { get; set; }

        [Required]
        [StringLength(50)]
        public required string FrecuenciaContenido { get; set; }

        [Required]
        [RegularExpression(@"^@[a-zA-Z0-9._]+$")]
        [StringLength(50)]
        public required string UsuarioInstagram { get; set; }

        [Required]
        [Range(1000, int.MaxValue)]
        public int SeguidoresInstagram { get; set; }

        [Required]
        public bool CuentaPublica { get; set; }

        [Required]
        [RegularExpression(@"^@[a-zA-Z0-9._]+$")]
        [StringLength(50)]
        public required string UsuarioTikTok { get; set; }

        [Required]
        [Range(1000, int.MaxValue)]
        public int SeguidoresTikTok { get; set; }

        [Required]
        [StringLength(1000, MinimumLength = 20)]
        public required string SobreTi { get; set; }

        [Required]
        [StringLength(50)]
        public required string AceptaBeneficios { get; set; }

        [Required]
        public bool AceptaTerminos { get; set; }
    }
}