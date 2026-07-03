namespace FormularioFoodieApi.Dtos.Response
{
    public class FormularioFoodieSubmissionResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public FormularioFoodieResponseDto? FormularioData { get; set; }
        public bool RolFoodieAsignado { get; set; }
        public string? RolMessage { get; set; }
    }
}