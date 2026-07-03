using UsersApi.Data.Repositories.Interfaces;
using UsersApi.Dtos.Request;
using UsersApi.Dtos.Response;
using UsersApi.Models;
using UsersApi.Services.Interfaces;
using UsersApi.Helpers;

namespace UsersApi.Services
{
    public class UsuarioService : IUsuarioService
    {
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IRolRepository _rolRepository;
        private readonly IUsuarioRolRepository _usuarioRolRepository;

        public UsuarioService(
            IUsuarioRepository usuarioRepository,
            IRolRepository rolRepository,
            IUsuarioRolRepository usuarioRolRepository)
        {
            _usuarioRepository = usuarioRepository;
            _rolRepository = rolRepository;
            _usuarioRolRepository = usuarioRolRepository;
        }

        public async Task<List<UsuarioResponseDto>> GetAllAsync()
        {
            var usuarios = await _usuarioRepository.GetAllAsync();
            return usuarios.Select(MapToResponseDto).ToList();
        }

        public async Task<UsuarioResponseDto> GetByIdAsync(int id)
        {
            var usuario = await _usuarioRepository.GetByIdAsync(id);
            if (usuario == null)
                throw new KeyNotFoundException($"Usuario con ID {id} no encontrado");

            return MapToResponseDto(usuario);
        }

        public async Task<UsuarioResponseDto> CreateAsync(UsuarioCreateRequestDto requestDto)
        {
            // Verificar si el correo ya existe
            if (await _usuarioRepository.ExisteCorreoAsync(requestDto.Correo))
                throw new InvalidOperationException("Ya existe un usuario con este correo electrónico");

            // Crear usuario
            var usuario = new Usuario
            {
                Nombre = requestDto.Nombre,
                Apellido = requestDto.Apellido,
                Correo = requestDto.Correo.ToLower(),
                PasswordHash = PasswordHelper.HashPassword(requestDto.Password),
                FechaCreacion = DateTime.UtcNow,
                FechaActualizacion = DateTime.UtcNow,
                Activo = true
            };

            var usuarioCreado = await _usuarioRepository.CreateAsync(usuario);

            // Asignar rol de usuario por defecto
            var rolUsuario = await _rolRepository.GetByNombreAsync("usuario");
            if (rolUsuario != null)
            {
                await _usuarioRolRepository.AsignarRolAsync(usuarioCreado.Id, rolUsuario.Id);
            }

            // Recargar usuario con roles
            var usuarioCompleto = await _usuarioRepository.GetByIdAsync(usuarioCreado.Id);
            return MapToResponseDto(usuarioCompleto!);
        }

        public async Task<UsuarioResponseDto> UpdateAsync(int id, UsuarioUpdateRequestDto requestDto)
        {
            var usuario = await _usuarioRepository.GetByIdAsync(id);
            if (usuario == null)
                throw new KeyNotFoundException($"Usuario con ID {id} no encontrado");

            // Verificar si el correo ya existe (excluyendo el usuario actual)
            if (await _usuarioRepository.ExisteCorreoAsync(requestDto.Correo, id))
                throw new InvalidOperationException("Ya existe un usuario con este correo electrónico");

            // Actualizar datos
            usuario.Nombre = requestDto.Nombre;
            usuario.Apellido = requestDto.Apellido;
            usuario.Correo = requestDto.Correo.ToLower();

            // Solo actualizar contraseña si se proporciona
            if (!string.IsNullOrEmpty(requestDto.Password))
            {
                usuario.PasswordHash = PasswordHelper.HashPassword(requestDto.Password);
            }

            var usuarioActualizado = await _usuarioRepository.UpdateAsync(usuario);
            return MapToResponseDto(usuarioActualizado);
        }

        private static UsuarioResponseDto MapToResponseDto(Usuario usuario)
        {
            return new UsuarioResponseDto
            {
                Id = usuario.Id,
                Nombre = usuario.Nombre,
                Apellido = usuario.Apellido,
                Correo = usuario.Correo,
                FechaCreacion = usuario.FechaCreacion,
                FechaActualizacion = usuario.FechaActualizacion,
                Activo = usuario.Activo,
                Roles = usuario.UsuarioRoles
                    .Where(ur => ur.Activo && ur.Rol.Activo)
                    .Select(ur => new RolResponseDto
                    {
                        Id = ur.Rol.Id,
                        Nombre = ur.Rol.Nombre,
                        Descripcion = ur.Rol.Descripcion,
                        Activo = ur.Rol.Activo
                    }).ToList()
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _usuarioRepository.DeleteAsync(id);
        }

        public async Task<bool> AddRoleToUserAsync(int usuarioId, string roleName)
        {
            try
            {
                // Verificar que el usuario existe
                var usuario = await _usuarioRepository.GetByIdAsync(usuarioId);
                if (usuario == null)
                {
                    return false;
                }

                // Buscar el rol por nombre
                var rol = await _rolRepository.GetByNameAsync(roleName);
                if (rol == null)
                {
                    return false;
                }

                // Verificar si el usuario ya tiene este rol
                var usuarioRolExistente = await _usuarioRolRepository.GetByUserAndRoleAsync(usuarioId, rol.Id);
                if (usuarioRolExistente != null)
                {
                    // Si existe pero está inactivo, lo activamos
                    if (!usuarioRolExistente.Activo)
                    {
                        usuarioRolExistente.Activo = true;
                        usuarioRolExistente.FechaAsignacion = DateTime.UtcNow;
                        await _usuarioRolRepository.UpdateAsync(usuarioRolExistente);
                        return true;
                    }
                    // Si ya está activo, no hacemos nada pero retornamos true
                    return true;
                }

                // Crear nueva relación usuario-rol
                var nuevoUsuarioRol = new UsuarioRol
                {
                    UsuarioId = usuarioId,
                    RolId = rol.Id,
                    Activo = true,
                    FechaAsignacion = DateTime.UtcNow
                };

                await _usuarioRolRepository.CreateAsync(nuevoUsuarioRol);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> RemoveRoleFromUserAsync(int usuarioId, string roleName)
        {
            try
            {
                var rol = await _rolRepository.GetByNameAsync(roleName);
                if (rol == null)
                    return false;

                var usuarioRol = await _usuarioRolRepository.GetByUserAndRoleAsync(usuarioId, rol.Id);
                if (usuarioRol == null)
                    return false;

                await _usuarioRolRepository.DeleteAsync(usuarioRol.Id);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

    }
}