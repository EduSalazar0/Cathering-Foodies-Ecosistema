// services/catalog-service/src/controllers/ProductController.js
const { Op } = require('sequelize');

class ProductController {
    constructor(ProductModel, ColegioModel, IngredientModel) {
        this.ProductModel = ProductModel;
        this.ColegioModel = ColegioModel;
        this.IngredientModel = IngredientModel;
    }

    // 1. Obtener Menú (Estudiantes y Personal ven lo mismo)
    async getAll(req, res) {
        try {
            const user = req.user;
            let whereClause = {};

            if (user && user.colegio_id) {
                whereClause.colegioId = user.colegio_id;
            }

            // Filtro para Estudiantes Y Personal
            if (user && (user.role === 'estudiante' || user.role === 'personal_academico')) {
                const today = new Date().toISOString().split('T')[0];
                
                whereClause[Op.and] = [
                    { 
                        [Op.or]: [
                            { availableFrom: null },    // Fecha no establecida (Siempre visible)
                            { availableFrom: '' },      // String vacío (Siempre visible)
                            { availableFrom: { [Op.lte]: today } } // Fecha pasada o de hoy
                        ]
                    }
                ];
            }

            const products = await this.ProductModel.findAll({ where: whereClause });
            
            // Arreglar URL de imagen
            const productsWithImages = products.map(p => {
                const json = p.toJSON();
                if (json.image) json.imageUrl = `http://localhost:3000/uploads/${json.image}`;
                return json;
            });

            res.json(productsWithImages);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching products' });
        }
    }

    // 2. CREAR PRODUCTO (La corrección clave para los ingredientes)
    async create(req, res) {
        try {
            const { 
                name, description, price, stock, 
                preparationTime, category, ingredients, availableFrom 
            } = req.body;
            
            const file = req.file; 
            const user = req.user;

            if (!user.colegio_id) return res.status(403).json({ error: 'Sin colegio asignado.' });

            // Sincronizar Colegio
            let colegio = await this.ColegioModel.findByPk(user.colegio_id);
            if (!colegio) {
                colegio = await this.ColegioModel.create({
                    id: user.colegio_id,
                    name: 'Colegio Sincronizado',
                    address: 'N/A', phone: 'N/A'
                });
            }
            if (ingredients) {
                const names = ingredients.split(',').map(n => n.trim());
                
                for (const ingName of names) {
                    if (ingName.length > 0) {
                        // "Si no existe 'Maní' en la tabla maestra, créalo"
                        await this.IngredientModel.findOrCreate({
                            where: { name: ingName }, 
                            defaults: { name: ingName }
                        });
                    }
                }
            }

            // Convertir fecha vacía a null
            const dateToSave = availableFrom === '' ? null : availableFrom;

            const newProduct = await this.ProductModel.create({
                name, description, price, stock, preparationTime, category,
                availableFrom: dateToSave,
                ingredients: ingredients || '', 
                image: file ? file.filename : null,
                colegioId: user.colegio_id 
            });

            res.status(201).json(newProduct);

        } catch (error) {
            console.error("Error creating product:", error);
            res.status(500).json({ error: error.message });
        }
    }

    // 3. Endpoint que usa el Dropdown de Alergias
    async getIngredients(req, res) {
        try {
            // Esto lee la Tabla Maestra. Si create() no la llenó, esto devuelve []
            const allIngredients = await this.IngredientModel.findAll();
            res.json(allIngredients);
        } catch (error) {
            console.error("Error fetching ingredients:", error);
            res.status(500).json({ error: "Error getting ingredients" });
        }
    }

    // ... (delete y getSafeMenu)
    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await this.ProductModel.destroy({ where: { id, colegioId: req.user.colegio_id } });
            deleted ? res.json({msg: "Deleted"}) : res.status(404).json({error: "Not found"});
        } catch(e) { res.status(500).json({error: e.message}); }
    }

    async getSafeMenu(req, res) {
        try {
            const user = req.user;
            // 1. Recibimos las alergias desde el cuerpo de la petición (Vienen del Frontend)
            // Ejemplo: ['Tomate', 'Maní']
            const userAllergies = req.body.allergies || []; 
            
            // Normalizamos a minúsculas para comparar bien: ['tomate', 'mani']
            const allergyNames = userAllergies.map(a => a.toLowerCase().trim());

            // 2. Consultar Productos del Colegio (Igual que en tu legacy)
            let whereClause = {};
            if (user && user.colegio_id) {
                whereClause.colegioId = user.colegio_id;
            }

            // Filtro de fecha para estudiantes (Lógica legacy que ya tenías)
            const today = new Date().toISOString().split('T')[0];
            whereClause[Op.and] = [
                { 
                    [Op.or]: [
                        { availableFrom: null },
                        { availableFrom: { [Op.lte]: today } }
                    ]
                }
            ];

            // 3. Traemos productos CON sus ingredientes
            const products = await this.ProductModel.findAll({
                where: whereClause,
                include: [{
                    model: this.IngredientModel,
                    as: 'ingredients', // Asegúrate que en tu modelo la relación se llame así
                    through: { attributes: [] } // Omitir tabla pivote
                }]
            });

            // 4. LÓGICA DE NEGOCIO: Consulta Cruzada Manual (Tu código original adaptado)
            const safeMenu = products.map(product => {
                // Convertimos a JSON plano
                const productData = product.toJSON();
                
                // Arreglo de URL de imagen (Tu fix anterior)
                if (productData.image) {
                    productData.imageUrl = `http://localhost:3000/uploads/${productData.image}`;
                }

                let conflict = null;

                // Sub-ciclo: Verificamos ingredientes
                // Nota: Ahora comparamos NOMBRES (strings), no IDs, porque es más seguro entre servicios
                if (productData.ingredients && productData.ingredients.length > 0) {
                    for (const ingrediente of productData.ingredients) {
                        const ingName = ingrediente.name.toLowerCase().trim();
                        
                        if (allergyNames.includes(ingName)) {
                            conflict = ingrediente.name; // Guardamos el nombre real
                            break; // Encontramos riesgo, paramos
                        }
                    }
                } else if (productData.ingredientsStr) {
                    // Fallback: Si usaste el campo de texto plano 'ingredientsStr'
                    const names = productData.ingredientsStr.split(',');
                    for (const rawName of names) {
                        if (allergyNames.includes(rawName.trim().toLowerCase())) {
                            conflict = rawName.trim();
                            break;
                        }
                    }
                }

                // Inyectamos la info cruzada (Igual que tu legacy)
                productData.has_risk = !!conflict;
                productData.risk_ingredient = conflict;

                return productData;
            });

            res.json(safeMenu);

        } catch (error) {
            console.error("Error en SafeMenu:", error);
            res.status(500).json({ error: 'Error calculando menú seguro' });
        }
    }
}

module.exports = ProductController;