# AdminCoreApi

API de administración central para FoodiesBNB que gestiona el core completo del sistema.

## Puerto
**5005**

## Descripción
Esta API actúa como administrador del core, proporcionando:
- Gestión completa de usuarios (incluyendo DELETE)
- Gestión completa de reservas (incluyendo DELETE)  
- Gestión completa de formularios (incluyendo DELETE)
- Administración de roles y permisos
- Análisis y estadísticas avanzadas
- Predicciones con regresión lineal

## Endpoints Principales

### Usuarios
- `GET /api/Users` - Obtener todos los usuarios
- `GET /api/Users/{id}` - Obtener usuario por ID
- `DELETE /api/Users/{id}` - Eliminar usuario

### Reservas
- `GET /api/Reservas` - Obtener todas las reservas
- `GET /api/Reservas/{id}` - Obtener reserva por ID
- `DELETE /api/Reservas/{id}` - Eliminar reserva

### Formularios
- `GET /api/Formularios` - Obtener todos los formularios
- `GET /api/Formularios/{id}` - Obtener formulario por ID
- `DELETE /api/Formularios/{id}` - Eliminar formulario

### Roles
- `GET /api/Roles` - Obtener todos los roles
- `POST /api/Roles` - Crear nuevo rol
- `POST /api/Roles/asignar` - Asignar rol a usuario
- `POST /api/Roles/remover` - Remover rol de usuario

### Analytics
- `GET /api/Analytics/resumen-general` - Resumen general de la plataforma
- `GET /api/Analytics/restaurantes` - Analytics por restaurante
- `GET /api/Analytics/restaurantes/{nombre}` - Analytics de un restaurante específico
- `GET /api/Analytics/tendencias` - Tendencias y predicciones
- `GET /api/Analytics/tendencias/{nombre}` - Tendencia de un restaurante específico
- `GET /api/Analytics/comparativa` - Comparativa entre restaurantes

## Características
- ✅ Operaciones DELETE para todas las entidades
- ✅ Gestión avanzada de roles
- ✅ Análisis de datos con gráficos
- ✅ Predicciones con regresión lineal
- ✅ Identificación de horas pico
- ✅ Seguimiento de ingresos por restaurante
- ✅ Tendencias de visitas mensuales
- ✅ Solo accesible para usuarios con rol Admin
