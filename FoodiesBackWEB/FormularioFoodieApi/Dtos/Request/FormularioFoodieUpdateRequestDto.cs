using System.ComponentModel.DataAnnotations;

namespace FormularioFoodieApi.Dtos.Request
{
    public class FormularioFoodieUpdateRequestDto
    {
        [StringLength(100, MinimumLength = 3)]
        public string? NombreCompleto { get; set; }

        [EmailAddress]
        [StringLength(100)]
        public string? Email { get; set; }

        [RegularExpression(@"^\d{10}$")]
        public string? NumeroPersonal { get; set; }

        public DateTime? FechaNacimiento { get; set; }

        [StringLength(20)]
        public string? Genero { get; set; }

        [StringLength(50)]
        public string? Pais { get; set; }

        [StringLength(50)]
        public string? Ciudad { get; set; }

        [StringLength(50)]
        public string? FrecuenciaContenido { get; set; }

        [RegularExpression(@"^@[a-zA-Z0-9._]+$")]
        [StringLength(50)]
        public string? UsuarioInstagram { get; set; }

        [Range(1000, int.MaxValue)]
        public int? SeguidoresInstagram { get; set; }

        public bool? CuentaPublica { get; set; }

        [RegularExpression(@"^@[a-zA-Z0-9._]+$")]
        [StringLength(50)]
        public string? UsuarioTikTok { get; set; }

        [Range(1000, int.MaxValue)]
        public int? SeguidoresTikTok { get; set; }

        [StringLength(1000, MinimumLength = 20)]
        public string? SobreTi { get; set; }

        [StringLength(50)]
        public string? AceptaBeneficios { get; set; }

        public bool? AceptaTerminos { get; set; }

        [StringLength(20)]
        public string? Estado { get; set; }

        [StringLength(1000)]
        public string? Comentarios { get; set; }
    }
}