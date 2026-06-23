class IngredientController {
    constructor(IngredientModel) {
        this.Ingredient = IngredientModel;
    }

    // Obtener todos los ingredientes (Útil para el menú de creación de platos)
    async getAll(req, res) {
        try {
            const ingredients = await this.Ingredient.findAll();
            res.json(ingredients);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener ingredientes' });
        }
    }

    // Crear un nuevo ingrediente
    async create(req, res) {
        try {
            const { nombre, is_common } = req.body;

            // Validación simple
            if (!nombre) {
                return res.status(400).json({ error: 'El nombre es obligatorio' });
            }

            const newIngredient = await this.Ingredient.create({
                nombre,
                is_common: is_common || false
            });

            res.status(201).json(newIngredient);
        } catch (error) {
            // Manejo de error por duplicados (nombre unique)
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ error: 'El ingrediente ya existe' });
            }
            console.error(error);
            res.status(500).json({ error: 'Error al crear ingrediente' });
        }
    }

    // Eliminar ingrediente (Opcional)
    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await this.Ingredient.destroy({ where: { id } });
            
            if (deleted) {
                res.json({ message: 'Ingrediente eliminado' });
            } else {
                res.status(404).json({ error: 'Ingrediente no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar ingrediente' });
        }
    }
}

module.exports = IngredientController;