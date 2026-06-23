// services/auth-service/src/repositories/SQLiteUserRepository.js
const { Op } = require('sequelize');

class SQLiteUserRepository {
    constructor(userModel, colegioModel, sequelize) {
        this.userModel = userModel;
        this.colegioModel = colegioModel;
        this.sequelize = sequelize;
    }

    // --- BÚSQUEDAS ---
    async findById(id) {
        return await this.userModel.findByPk(id);
    }

    async findByUsernameOrEmail(username, email) {
        return await this.userModel.findOne({
            where: { [Op.or]: [{ username }, { email }] }
        });
    }

    async findOneByRoleAndColegio(role, colegioId) {
        return await this.userModel.findOne({
            where: { role: role, colegio_id: colegioId }
        });
    }

    async findAllByColegio(colegioId) {
        return await this.userModel.findAll({
            where: { colegio_id: colegioId }
            // Ya no es necesario ocultar el passwordHash porque ya no existe en la BD
        });
    }

    async findColegioByAdminId(adminId) {
        return await this.colegioModel.findOne({
            where: { admin_user_id: adminId }
        });
    }
    
    async updateColegio(adminId, updates) {
        let colegio = await this.colegioModel.findOne({
            where: { admin_user_id: adminId }
        });
        
        if (!colegio) {
            // Autocrear registro inicial si la DB está vacía
            colegio = await this.colegioModel.create({
                ...updates,
                admin_user_id: adminId
            });
            return colegio;
        }

        return await colegio.update(updates);
    }

    // --- ESCRITURA ---
    async save(userEntity) {
        // ADAPTACIÓN: userEntity ahora DEBE incluir el 'id' (UUID) que viene de Keycloak
        return await this.userModel.create(userEntity);
    }

    async update(id, updates) {
        const user = await this.userModel.findByPk(id);
        if (!user) throw new Error('Usuario no encontrado');
        return await user.update(updates);
    }

    async delete(id) {
        return await this.userModel.destroy({ where: { id } });
    }

    // --- UTILS (ALERGIAS) ---
    async getUserAllergies(userId) {
        const user = await this.userModel.findByPk(userId);
        if (!user || !user.allergies) return [];
        try {
            // Convertimos el string "['Lechuga']" en un array real
            return JSON.parse(user.allergies);
        } catch (e) {
            return [];
        }
    }

    async updateAllergies(userId, namesArray) {
        const user = await this.userModel.findByPk(userId);
        if (!user) throw new Error('Usuario no encontrado');
        // Guardamos el array de nombres como texto
        return await user.update({ 
            allergies: JSON.stringify(namesArray) 
        });
    }

    // --- TRANSACCIONES COMPLEJAS ---
    async createColegioWithAdmin(userData, colegioData) {
        const t = await this.sequelize.transaction();

        try {
            // 1. Crear Usuario Admin
            // ADAPTACIÓN: userData ya NO trae passwordHash. 
            // Si el admin ya se registró en Keycloak, userData debe traer el 'id' (UUID)
            const user = await this.userModel.create(userData, { transaction: t });

            // 2. Crear Colegio vinculado
            const colegio = await this.colegioModel.create({
                ...colegioData,
                admin_user_id: user.id
            }, { transaction: t });

            // 3. Actualizar usuario con el colegio_id
            user.colegio_id = colegio.id;
            await user.save({ transaction: t });

            await t.commit();
            return user;

        } catch (error) {
            await t.rollback();
            throw error; // Re-lanzar error para que lo vea el controlador
        }
    }
}

module.exports = SQLiteUserRepository;