-- Script inicial para crear los roles básicos del sistema
-- Se ejecuta automáticamente al iniciar la aplicación si los roles no existen

DO $$
BEGIN
    -- Insertar roles si no existen
    IF NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'usuario') THEN
        INSERT INTO roles (nombre, descripcion, activo) 
        VALUES ('usuario', 'Usuario regular del sistema', true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'foodie') THEN
        INSERT INTO roles (nombre, descripcion, activo) 
        VALUES ('foodie', 'Usuario foodie con características especiales', true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'restaurante') THEN
        INSERT INTO roles (nombre, descripcion, activo) 
        VALUES ('restaurante', 'Usuario representante de restaurante', true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'admin') THEN
        INSERT INTO roles (nombre, descripcion, activo) 
        VALUES ('admin', 'Administrador del sistema', true);
    END IF;

    RAISE NOTICE 'Roles iniciales verificados/creados correctamente';
END $$;