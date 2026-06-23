class ColegioController {
    constructor(ColegioModel) {
        this.Colegio = ColegioModel;
    }

    // Obtener detalles del colegio del usuario logueado
    async getDetails(req, res) {
        try {
            // Asumimos que el colegioId viene en el token (req.user.colegioId)
            // O si es admin general, manejamos la lógica.
            // Para este ejemplo, si el token no trae colegioId, buscamos el primero (temporal) o fallamos.
            
            let colegioId = req.user.colegioId;

            // FIX: Si el token antiguo no traía colegioId, por ahora retornamos error o buscamos uno por defecto
            if (!colegioId) {
                // Intento de fallback: buscar si viene como parámetro o retornar el primero
                // return res.status(400).json({ error: 'Token no contiene ID de colegio' });
                const first = await this.Colegio.findOne();
                if(first) colegioId = first.id;
            }

            const colegio = await this.Colegio.findByPk(colegioId);
            
            if (!colegio) {
                return res.status(404).json({ error: 'Institución no encontrada' });
            }

            res.json(colegio);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener detalles del colegio' });
        }
    }

    // Actualizar detalles o Crear si no existe
    async updateDetails(req, res) {
        try {
            let colegioId = req.user.colegioId;
            
            // Si no hay colegioId, intentamos buscar el primero
            if (!colegioId) {
                 const first = await this.Colegio.findOne();
                 if(first) colegioId = first.id;
            }

            const { nombre, direccion, telefono, ciudad, provincia } = req.body;

            let colegio;
            if (colegioId) {
                colegio = await this.Colegio.findByPk(colegioId);
            }

            if (!colegio) {
                // Si la tabla está vacía o el colegio no existe, autocreamos la institución inicial
                colegio = await this.Colegio.create({
                    nombre, direccion, telefono, ciudad, provincia
                });
                return res.status(201).json({ message: 'Institución inicial creada correctamente', colegio });
            } else {
                // Actualizamos campos
                await colegio.update({
                    nombre, direccion, telefono, ciudad, provincia
                });
                return res.json({ message: 'Detalles actualizados correctamente', colegio });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar o crear colegio' });
        }
    }
}

module.exports = ColegioController;