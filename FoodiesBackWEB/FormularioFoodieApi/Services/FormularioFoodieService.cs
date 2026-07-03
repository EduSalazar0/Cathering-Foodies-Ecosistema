using FormularioFoodieApi.Data.Repositories.Interfaces;
using FormularioFoodieApi.Dtos.Request;
using FormularioFoodieApi.Dtos.Response;
using FormularioFoodieApi.Models;
using FormularioFoodieApi.Services.Interfaces;
using System.Security.Claims;

namespace FormularioFoodieApi.Services
{
    public class FormularioFoodieService : IFormularioFoodieService
    {
        private readonly IFormularioFoodieRepository _formularioRepository;
        private readonly IUsersApiService _usersApiService;
        private readonly ILogger<FormularioFoodieService> _logger;

        public FormularioFoodieService(
            IFormularioFoodieRepository formularioRepository,
            IUsersApiService usersApiService,
            ILogger<FormularioFoodieService> logger)
        {
            _formularioRepository = formularioRepository;
            _usersApiService = usersApiService;
            _logger = logger;
        }

        public async Task<FormularioFoodieResponseDto> CreateAsync(ClaimsPrincipal user, FormularioFoodieCreateRequestDto requestDto)
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int usuarioId))
            {
                throw new UnauthorizedAccessException("No se pudo identificar al usuario");
            }

            return await CreateAsync(usuarioId, requestDto);
        }

        public async Task<FormularioFoodieSubmissionResponseDto> CreateWithMessageAsync(ClaimsPrincipal user, FormularioFoodieCreateRequestDto requestDto)
        {
            try
            {
                var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int usuarioId))
                {
                    return new FormularioFoodieSubmissionResponseDto
                    {
                        Success = false,
                        Message = "Error de autenticación. Por favor, inicia sesión nuevamente."
                    };
                }

                var formularioData = await CreateAsync(usuarioId, requestDto);
                
                // Verificar si cumple los requisitos para ser Foodie
                bool cumpleRequisitos = requestDto.SeguidoresInstagram >= 1000 || requestDto.SeguidoresTikTok >= 1000;
                
                string mensaje = "¡Aplicación enviada exitosamente! ";
                string rolMessage = "";
                
                if (cumpleRequisitos)
                {
                    mensaje += "Felicidades, cumples los requisitos para ser Foodie y se ha asignado tu rol automáticamente.";
                    rolMessage = "Has sido promovido a Foodie por tener más de 1,000 seguidores. ¡Ya puedes hacer reservas!";
                }
                else
                {
                    mensaje += "Tu aplicación está en revisión. Te notificaremos cuando sea aprobada.";
                    rolMessage = $"Necesitas al menos 1,000 seguidores en Instagram o TikTok para obtener el rol de Foodie automáticamente. Actualmente tienes {requestDto.SeguidoresInstagram} en Instagram y {requestDto.SeguidoresTikTok} en TikTok.";
                }

                return new FormularioFoodieSubmissionResponseDto
                {
                    Success = true,
                    Message = mensaje,
                    FormularioData = formularioData,
                    RolFoodieAsignado = cumpleRequisitos,
                    RolMessage = rolMessage
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear formulario de foodie");
                
                return new FormularioFoodieSubmissionResponseDto
                {
                    Success = false,
                    Message = ex.Message
                };
            }
        }

        private async Task<FormularioFoodieResponseDto> CreateAsync(int usuarioId, FormularioFoodieCreateRequestDto requestDto)
        {
            // Validar que el usuario no tenga ya un formulario
            if (await _formularioRepository.ExistsForUserAsync(usuarioId))
            {
                throw new InvalidOperationException("Ya tienes una aplicación de Foodie registrada. Solo puedes enviar una aplicación por cuenta.");
            }

            // ⚠️ VALIDACIONES DE DATOS SENSIBLES EN BACKEND ⚠️
            
            // 1. Validación de edad mínima (dato sensible - debe ser mayor de 18 años)
            var edad = DateTime.Today.Year - requestDto.FechaNacimiento.Year;
            if (requestDto.FechaNacimiento.Date > DateTime.Today.AddYears(-edad)) edad--;
            
            if (edad < 18)
            {
                throw new InvalidOperationException($"Debes ser mayor de 18 años para aplicar como Foodie. Edad actual: {edad} años.");
            }

            // 2. Validación de formato de número de teléfono (dato sensible)
            if (!System.Text.RegularExpressions.Regex.IsMatch(requestDto.NumeroPersonal, @"^\+?[\d\s\-\(\)]{7,20}$"))
            {
                throw new InvalidOperationException("El número de teléfono tiene un formato inválido. Debe contener entre 7 y 20 dígitos.");
            }

            // 3. Validación de formato de email (dato sensible)
            if (!System.Text.RegularExpressions.Regex.IsMatch(requestDto.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            {
                throw new InvalidOperationException("El correo electrónico tiene un formato inválido.");
            }

            // 4. Validación de seguidores mínimos
            if (requestDto.SeguidoresInstagram < 0 || requestDto.SeguidoresTikTok < 0)
            {
                throw new InvalidOperationException("El número de seguidores no puede ser negativo.");
            }

            // 5. Validación de términos y condiciones (obligatorio)
            if (!requestDto.AceptaTerminos)
            {
                throw new InvalidOperationException("Debes aceptar los términos y condiciones para continuar.");
            }

            // Validar unicidad de datos
            await ValidateUniqueDataAsync(requestDto);

            // Crear la entidad
            var formulario = new FormularioFoodie
            {
                UsuarioId = usuarioId,
                NombreCompleto = requestDto.NombreCompleto.Trim(),
                Email = requestDto.Email.Trim().ToLower(),
                NumeroPersonal = requestDto.NumeroPersonal.Trim(),
                FechaNacimiento = requestDto.FechaNacimiento,
                Genero = requestDto.Genero.Trim(),
                Pais = requestDto.Pais.Trim(),
                Ciudad = requestDto.Ciudad.Trim(),
                FrecuenciaContenido = requestDto.FrecuenciaContenido.Trim(),
                UsuarioInstagram = requestDto.UsuarioInstagram.Trim(),
                SeguidoresInstagram = requestDto.SeguidoresInstagram,
                CuentaPublica = requestDto.CuentaPublica,
                UsuarioTikTok = requestDto.UsuarioTikTok.Trim(),
                SeguidoresTikTok = requestDto.SeguidoresTikTok,
                SobreTi = requestDto.SobreTi.Trim(),
                AceptaBeneficios = requestDto.AceptaBeneficios.Trim(),
                AceptaTerminos = requestDto.AceptaTerminos,
                FechaAplicacion = DateTime.UtcNow
            };

            // Guardar en base de datos
            var formularioCreado = await _formularioRepository.CreateAsync(formulario);

            // Verificar si cumple los requisitos para ser Foodie y agregar rol
            await ProcessFoodieRoleAsync(usuarioId, formularioCreado);

            return MapToResponseDto(formularioCreado);
        }

        public async Task<FormularioFoodieResponseDto> UpdateAsync(int id, FormularioFoodieUpdateRequestDto requestDto)
        {
            var formulario = await _formularioRepository.GetByIdAsync(id);
            if (formulario == null)
            {
                throw new KeyNotFoundException("Formulario no encontrado");
            }

            // Actualizar solo los campos que no son null
            if (requestDto.NombreCompleto != null)
                formulario.NombreCompleto = requestDto.NombreCompleto.Trim();

            if (requestDto.Email != null)
                formulario.Email = requestDto.Email.Trim().ToLower();

            if (requestDto.NumeroPersonal != null)
                formulario.NumeroPersonal = requestDto.NumeroPersonal.Trim();

            if (requestDto.FechaNacimiento.HasValue)
                formulario.FechaNacimiento = requestDto.FechaNacimiento.Value;

            if (requestDto.Genero != null)
                formulario.Genero = requestDto.Genero.Trim();

            if (requestDto.Pais != null)
                formulario.Pais = requestDto.Pais.Trim();

            if (requestDto.Ciudad != null)
                formulario.Ciudad = requestDto.Ciudad.Trim();

            if (requestDto.FrecuenciaContenido != null)
                formulario.FrecuenciaContenido = requestDto.FrecuenciaContenido.Trim();

            if (requestDto.UsuarioInstagram != null)
                formulario.UsuarioInstagram = requestDto.UsuarioInstagram.Trim();

            if (requestDto.SeguidoresInstagram.HasValue)
                formulario.SeguidoresInstagram = requestDto.SeguidoresInstagram.Value;

            if (requestDto.CuentaPublica.HasValue)
                formulario.CuentaPublica = requestDto.CuentaPublica.Value;

            if (requestDto.UsuarioTikTok != null)
                formulario.UsuarioTikTok = requestDto.UsuarioTikTok.Trim();

            if (requestDto.SeguidoresTikTok.HasValue)
                formulario.SeguidoresTikTok = requestDto.SeguidoresTikTok.Value;

            if (requestDto.SobreTi != null)
                formulario.SobreTi = requestDto.SobreTi.Trim();

            if (requestDto.AceptaBeneficios != null)
                formulario.AceptaBeneficios = requestDto.AceptaBeneficios.Trim();

            if (requestDto.AceptaTerminos.HasValue)
                formulario.AceptaTerminos = requestDto.AceptaTerminos.Value;

            if (requestDto.Estado != null)
                formulario.Estado = requestDto.Estado.Trim();

            if (requestDto.Comentarios != null)
                formulario.Comentarios = requestDto.Comentarios.Trim();

            var formularioActualizado = await _formularioRepository.UpdateAsync(formulario);

            // Si se actualizaron los seguidores, verificar si ahora cumple requisitos para Foodie
            if (requestDto.SeguidoresInstagram.HasValue || requestDto.SeguidoresTikTok.HasValue)
            {
                await ProcessFoodieRoleAsync(formulario.UsuarioId, formularioActualizado);
            }

            return MapToResponseDto(formularioActualizado);
        }

        public async Task<FormularioFoodieResponseDto?> GetMyFormularioAsync(ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int usuarioId))
            {
                throw new UnauthorizedAccessException("No se pudo identificar al usuario");
            }

            return await GetByUsuarioIdAsync(usuarioId);
        }

        public async Task<FormularioFoodieResponseDto> UpdateMyFormularioAsync(ClaimsPrincipal user, FormularioFoodieUpdateRequestDto requestDto)
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int usuarioId))
            {
                throw new UnauthorizedAccessException("No se pudo identificar al usuario");
            }

            return await UpdateMyFormularioAsync(usuarioId, requestDto);
        }

        private async Task<FormularioFoodieResponseDto> UpdateMyFormularioAsync(int usuarioId, FormularioFoodieUpdateRequestDto requestDto)
        {
            var formularioExistente = await _formularioRepository.GetByUsuarioIdAsync(usuarioId);
            if (formularioExistente == null)
            {
                throw new KeyNotFoundException("No tienes un formulario registrado");
            }

            return await UpdateAsync(formularioExistente.Id, requestDto);
        }

        public async Task<FormularioFoodieResponseDto?> GetByIdAsync(int id)
        {
            var formulario = await _formularioRepository.GetByIdAsync(id);
            return formulario != null ? MapToResponseDto(formulario) : null;
        }

        public async Task<FormularioFoodieResponseDto?> GetByUsuarioIdAsync(int usuarioId)
        {
            var formulario = await _formularioRepository.GetByUsuarioIdAsync(usuarioId);
            return formulario != null ? MapToResponseDto(formulario) : null;
        }

        public async Task<List<FormularioFoodieResponseDto>> GetAllAsync()
        {
            var formularios = await _formularioRepository.GetAllAsync();
            return formularios.Select(MapToResponseDto).ToList();
        }

        public async Task<List<FormularioFoodieResponseDto>> GetByEstadoAsync(string estado)
        {
            var formularios = await _formularioRepository.GetByEstadoAsync(estado);
            return formularios.Select(MapToResponseDto).ToList();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var formulario = await _formularioRepository.GetByIdAsync(id);
            if (formulario == null)
                return false;

            await _formularioRepository.DeleteAsync(formulario);
            return true;
        }

        public async Task<object?> GetCurrentUserAsync(ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int usuarioId))
            {
                throw new UnauthorizedAccessException("No se pudo identificar al usuario");
            }

            // TODO: Temporalmente comentado hasta arreglar conexión con UsersApi
            /*
            // Obtener información del usuario desde UsersApi
            var userInfo = await _usersApiService.GetCurrentUserAsync();
            if (userInfo != null)
            {
                return userInfo;
            }
            */

            // Si no se puede obtener del UsersApi, crear respuesta básica
            return new
            {
                id = usuarioId,
                nombre = "Usuario",
                apellido = "Actual",
                correo = "usuario@foodiesbnb.com",
                fechaCreacion = DateTime.UtcNow,
                estaActivo = true
            };
        }

        private async Task ValidateUniqueDataAsync(FormularioFoodieCreateRequestDto requestDto)
        {
            if (await _formularioRepository.ExistsByEmailAsync(requestDto.Email))
            {
                throw new InvalidOperationException("Este correo electrónico ya está registrado. Si ya tienes una cuenta, inicia sesión o usa otro correo.");
            }

            if (await _formularioRepository.ExistsByInstagramAsync(requestDto.UsuarioInstagram))
            {
                throw new InvalidOperationException("Este usuario de Instagram ya está en uso. Ya hay una cuenta registrada con @" + requestDto.UsuarioInstagram + ". Verifica tu usuario o contacta soporte si necesitas ayuda.");
            }

            if (await _formularioRepository.ExistsByTikTokAsync(requestDto.UsuarioTikTok))
            {
                throw new InvalidOperationException("Este usuario de TikTok ya está en uso. Ya hay una cuenta registrada con @" + requestDto.UsuarioTikTok + ". Verifica tu usuario o contacta soporte si necesitas ayuda.");
            }
        }

        private async Task ProcessFoodieRoleAsync(int usuarioId, FormularioFoodie formulario)
        {
            try
            {
                // Verificar si cumple los requisitos para ser Foodie
                bool cumpleRequisitos = formulario.SeguidoresInstagram >= 1000 || formulario.SeguidoresTikTok >= 1000;

                if (cumpleRequisitos)
                {
                    try
                    {
                        bool rolAgregado = await _usersApiService.AddRoleToUserAsync(usuarioId, "foodie");
                        if (rolAgregado)
                        {
                            _logger.LogInformation($"Usuario {usuarioId} cumple requisitos para ser Foodie - Rol asignado exitosamente");
                        }
                        else
                        {
                            _logger.LogWarning($"Usuario {usuarioId} cumple requisitos para ser Foodie pero no se pudo asignar el rol");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Error al asignar rol foodie al usuario {usuarioId}: {ex.Message}");
                        // Continuar sin lanzar excepción para no afectar la creación del formulario
                    }
                }
                else
                {
                    _logger.LogInformation($"Usuario {usuarioId} NO cumple requisitos para ser Foodie (Instagram: {formulario.SeguidoresInstagram}, TikTok: {formulario.SeguidoresTikTok})");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al procesar rol de Foodie para usuario {usuarioId}");
                // No lanzamos la excepción para no afectar la creación del formulario
            }
        }

        private static FormularioFoodieResponseDto MapToResponseDto(FormularioFoodie formulario)
        {
            return new FormularioFoodieResponseDto
            {
                Id = formulario.Id,
                UsuarioId = formulario.UsuarioId,
                NombreCompleto = formulario.NombreCompleto,
                Email = formulario.Email,
                NumeroPersonal = formulario.NumeroPersonal,
                FechaNacimiento = formulario.FechaNacimiento,
                Genero = formulario.Genero,
                Pais = formulario.Pais,
                Ciudad = formulario.Ciudad,
                FrecuenciaContenido = formulario.FrecuenciaContenido,
                UsuarioInstagram = formulario.UsuarioInstagram,
                SeguidoresInstagram = formulario.SeguidoresInstagram,
                CuentaPublica = formulario.CuentaPublica,
                UsuarioTikTok = formulario.UsuarioTikTok,
                SeguidoresTikTok = formulario.SeguidoresTikTok,
                SobreTi = formulario.SobreTi,
                AceptaBeneficios = formulario.AceptaBeneficios,
                AceptaTerminos = formulario.AceptaTerminos,
                FechaAplicacion = formulario.FechaAplicacion,
                FechaActualizacion = formulario.FechaActualizacion,
                Estado = formulario.Estado,
                Comentarios = formulario.Comentarios,
                Activo = formulario.Activo
            };
        }
    }
}