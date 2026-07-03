-- Script para insertar roles por defecto en usersdb
-- Ejecutar después de las migraciones

INSERT INTO public.roles (nombre, descripcion, activo) VALUES
('usuario', 'Usuario regular del sistema', true),
('foodie', 'Influencer gastronómico que crea contenido', true),
('restaurante', 'Dueño o representante de restaurante', true),
('admin', 'Administrador del sistema con accesos completos', true)
ON CONFLICT (nombre) DO NOTHING;
