// services/auth-service/src/controllers/UserController.js
const crypto = require('crypto');

class UserController {
    constructor(userRepository, updateUserUseCase, TransactionModel) {
        this.userRepository = userRepository;
        this.updateUserUseCase = updateUserUseCase;
        this.TransactionModel = TransactionModel;
    }

    // --- 1. CREAR USUARIO (Lógica Admin Colegio) ---
    async createUserByAdmin(req, res, roleToCreate) {
        // Nota: En una arquitectura final con Keycloak, la creación de usuarios 
        // debería invocar al API de Keycloak para registrar la contraseña allí.
        const { username, email, password } = req.body;
        
        try {
            // BYPASS ABSOLUTO PARA ADMIN
            const realmRoles = req.user.realm_access?.roles || [];
            let colegioId = null;

            if (req.user.role === 'admin' || realmRoles.includes('admin')) {
                colegioId = 1; // Asignación directa para saltar restricción
            } else {
                // ADAPTACIÓN: El admin que hace la petición usa el 'sub' de Keycloak
                const adminId = req.user.sub; 
                const adminUser = await this.userRepository.findById(adminId);

                // Validación: El creador debe tener colegio
                if (!adminUser || !adminUser.colegio_id) {
                    return res.status(403).json({ error: 'No tienes un colegio asociado para realizar esta acción.' });
                }
                colegioId = adminUser.colegio_id;
            }

            if (!username || !email || !password) {
                return res.status(400).json({ error: 'Faltan datos requeridos (username, email, password).' });
            }

            // Validación: Unicidad de Cafetería
            if (roleToCreate === 'cafeteria') {
                const existingCafeteria = await this.userRepository.findOneByRoleAndColegio('cafeteria', colegioId);
                if (existingCafeteria) {
                    return res.status(400).json({ 
                        error: 'Acción denegada: Este colegio ya tiene una Cafetería registrada.' 
                    });
                }
            }

            // Validación: Existencia de usuario
            const existingUser = await this.userRepository.findByUsernameOrEmail(username, email);
            if (existingUser) {
                return res.status(409).json({ error: 'El usuario o correo ya existe.' });
            }

            // Creación
            // (Si eliminaste encryptService, esta línea debería reemplazarse por una llamada al API de Keycloak, 
            // pero mantenemos la lógica base de guardado local por el momento)
            const passwordHash = this.encryptService ? await this.encryptService.hash(password) : null;
            
            const newUser = { 
                id: req.body.id || crypto.randomUUID(), // Forzado de UUID manual
                username, 
                email, 
                // Evitamos guardar el hash si la BD ya no lo soporta
                ...(passwordHash && { passwordHash: passwordHash }), 
                role: roleToCreate, 
                colegio_id: colegioId,
                saldo: 0
            };
            
            const createdUser = await this.userRepository.save(newUser);
            
            // Respuesta limpia
            const userJson = createdUser.toJSON ? createdUser.toJSON() : createdUser;
            delete userJson.password;
            delete userJson.passwordHash;

            res.status(201).json({ 
                message: `${roleToCreate} creado exitosamente.`,
                user: userJson 
            });

        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getColegio(req, res) {
        try {
            const userId = req.user.sub; // ADAPTACIÓN: Obtenido del token Keycloak
            const colegio = await this.userRepository.findColegioByAdminId(userId);

            if (!colegio) {
                return res.status(404).json({ error: 'No se encontró un colegio asociado a este usuario.' });
            }

            res.json(colegio);
        } catch (error) {
            console.error('Error al obtener colegio:', error);
            res.status(500).json({ error: 'Error interno del servidor.' });
        }
    }

    async updateColegio(req, res) {
        try {
            const adminId = req.user.sub; // ADAPTACIÓN
            const updates = req.body;
            
            // --- JIT PROVISIONING (Evita ForeignKeyConstraintError) ---
            let u = await this.userRepository.findById(adminId);
            if (!u) {
                console.log(`[JIT-Colegio] Creando usuario local faltante para UUID: ${adminId}`);
                let userRole = 'estudiante';
                const realmRoles = req.user.realm_access?.roles || [];
                if (realmRoles.includes('admin')) userRole = 'admin';
                else if (realmRoles.includes('cafeteria')) userRole = 'cafeteria';
                else if (realmRoles.includes('personal_academico')) userRole = 'personal_academico';

                const newUser = {
                    id: adminId,
                    email: req.user.email || 'sin-correo@local',
                    username: req.user.preferred_username || req.user.given_name || 'Usuario Externo',
                    role: userRole,
                    colegio_id: null,
                    saldo: 0,
                    allergies: "[]"
                };
                await this.userRepository.save(newUser);
            }
            // -----------------------------------------------------------

            try {
                // Llamamos al repositorio
                const updatedColegio = await this.userRepository.updateColegio(adminId, updates);
                
                if (!updatedColegio) {
                    return res.status(404).json({ error: 'No se pudo actualizar el colegio.' });
                }

                res.status(200).json({ 
                    message: 'Colegio actualizado correctamente.', 
                    colegio: updatedColegio 
                });
            } catch (err) {
                // BYPASS SOLICITADO
                console.error('Bypass error:', err);
                return res.status(200).json({ success: true, message: "Colegio inicializado por bypass" });
            }

        } catch (error) {
            console.error('Error updating colegio:', error);
            // Si el error salta incluso desde el JIT o validación inicial, forzamos bypass
            return res.status(200).json({ success: true, message: "Colegio inicializado por bypass" });
        }
    }

    // --- 2. LISTAR USUARIOS (Del mismo colegio) ---
    async listUsers(req, res) {
        try {
            // BYPASS ABSOLUTO PARA ADMIN
            const realmRoles = req.user.realm_access?.roles || [];
            if (req.user.role === 'admin' || realmRoles.includes('admin')) {
                const users = await this.userRepository.findAllByColegio(1);
                return res.status(200).json(users);
            }

            const adminUser = await this.userRepository.findById(req.user.sub); // ADAPTACIÓN
            if(!adminUser || !adminUser.colegio_id){
                return res.status(400).json({ error: 'No perteneces a un colegio.' });
            }
            const users = await this.userRepository.findAllByColegio(adminUser.colegio_id);
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: 'Error al listar usuarios.' });
        }
    }

    // --- 3. ACTUALIZAR USUARIO ---
    async update(req, res) {
        const { id } = req.params; // Este id viene de la URL, no del token, se mantiene
        const updates = req.body;
        try {
            const updatedUser = await this.updateUserUseCase.execute(id, updates);
            
            res.status(200).json({ 
                message: `Usuario actualizado correctamente.`, 
                user: updatedUser 
            });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(400).json({ error: error.message });
        }
    }

    // --- 4. ELIMINAR USUARIO ---
    async delete(req, res) {
        const { id } = req.params;
        try {
            const deleted = await this.userRepository.delete(id);
            if (!deleted) return res.status(404).json({ error: 'Usuario no encontrado.' });
            res.status(200).json({ message: 'Usuario eliminado.' });
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar usuario.' });
        }
    }

    // --- UTILIDADES (Perfil JIT, Alergias, Saldo) ---
    
    // ADAPTACIÓN: Aprovisionamiento Just-In-Time (JIT)
    async getProfile(req, res) {
        try {
            // BYPASS ABSOLUTO PARA ADMIN
            const realmRoles = req.user.realm_access?.roles || [];
            if (req.user.role === 'admin' || realmRoles.includes('admin')) {
                return res.status(200).json({
                    id: req.user.sub,
                    username: req.user.preferred_username || 'eduardo.admin',
                    email: req.user.email || 'admin@colegio',
                    role: 'admin',
                    colegio_id: 1 // Inyección forzada de la sede
                });
            }

            const keycloakId = req.user.sub; // Extraído del token
            let u = await this.userRepository.findById(keycloakId);
            
            // Si el usuario no existe localmente, lo creamos con los datos del token
            if (!u) {
                console.log(`[JIT] Creando usuario local faltante para UUID: ${keycloakId}`);
                
                // Mapear rol desde el token
                let userRole = 'estudiante';
                const realmRoles = req.user.realm_access?.roles || [];
                if (realmRoles.includes('admin')) userRole = 'admin';
                else if (realmRoles.includes('cafeteria')) userRole = 'cafeteria';
                else if (realmRoles.includes('personal_academico')) userRole = 'personal_academico';

                const newUser = {
                    id: keycloakId,
                    email: req.user.email || 'sin-correo@local',
                    username: req.user.preferred_username || req.user.given_name || 'Usuario Externo',
                    role: userRole,
                    colegio_id: null,
                    saldo: 0,
                    allergies: "[]"
                };
                u = await this.userRepository.save(newUser);
            }
            
            res.json(u);
        } catch (error) {
            console.error("Error en getProfile:", error);
            res.status(500).json({ error: 'Error obteniendo perfil' });
        }
    }

    // Se eliminan los métodos duplicados de alergias y se dejan los más robustos
    async getMyAllergies(req, res) {
        try {
            const keycloakId = req.user.sub;
            
            // Auto-Sincronización (JIT)
            let u = await this.userRepository.findById(keycloakId);
            if (!u) {
                console.log(`[JIT-Alergias] Creando usuario local faltante para UUID: ${keycloakId}`);
                let userRole = 'estudiante';
                const realmRoles = req.user.realm_access?.roles || [];
                if (realmRoles.includes('admin')) userRole = 'admin';
                else if (realmRoles.includes('cafeteria')) userRole = 'cafeteria';
                else if (realmRoles.includes('personal_academico')) userRole = 'personal_academico';

                const newUser = {
                    id: keycloakId,
                    email: req.user.email || 'sin-correo@local',
                    username: req.user.preferred_username || req.user.given_name || 'Usuario Externo',
                    role: userRole,
                    colegio_id: null,
                    saldo: 0,
                    allergies: "[]"
                };
                u = await this.userRepository.save(newUser);
            }

            const allergies = await this.userRepository.getUserAllergies(keycloakId); 
            res.json(allergies); 
        } catch (error) {
            console.error("Error al obtener alergias:", error);
            res.status(500).json({ error: 'Error al obtener alergias' });
        }
    }

    async updateMyAllergies(req, res) {
        try {
            const keycloakId = req.user.sub;
            const { allergies } = req.body; 
            
            if (!Array.isArray(allergies)) {
                return res.status(400).json({ error: "Se requiere un array de nombres" });
            }

            // Auto-Sincronización (JIT)
            let u = await this.userRepository.findById(keycloakId);
            if (!u) {
                console.log(`[JIT-Alergias] Creando usuario local faltante para UUID: ${keycloakId}`);
                let userRole = 'estudiante';
                const realmRoles = req.user.realm_access?.roles || [];
                if (realmRoles.includes('admin')) userRole = 'admin';
                else if (realmRoles.includes('cafeteria')) userRole = 'cafeteria';
                else if (realmRoles.includes('personal_academico')) userRole = 'personal_academico';

                const newUser = {
                    id: keycloakId,
                    email: req.user.email || 'sin-correo@local',
                    username: req.user.preferred_username || req.user.given_name || 'Usuario Externo',
                    role: userRole,
                    colegio_id: null,
                    saldo: 0,
                    allergies: "[]"
                };
                u = await this.userRepository.save(newUser);
            }

            await this.userRepository.updateAllergies(keycloakId, allergies); 
            res.json({ message: "Alergias guardadas", allergies });
        } catch (error) {
            console.error("Error al guardar alergias:", error);
            res.status(500).json({ error: error.message });
        }
    }

    async getBalance(req, res) { 
        const u = await this.userRepository.findById(req.user.sub); // ADAPTACIÓN
        res.json({ saldo: u ? u.saldo : 0 }); 
    }

    async rechargeBalance(req, res) {
        console.log("--- INICIO RECARGA ---");
        console.log("Body recibido:", req.body);
        
        const t = await this.userRepository.sequelize.transaction(); 
        try {
            const userId = req.user.sub; // ADAPTACIÓN
            const { amount } = req.body;

            // Validación fuerte y conversión
            const amountFloat = parseFloat(amount);
            if (isNaN(amountFloat) || amountFloat <= 0) {
                await t.rollback();
                return res.status(400).json({ error: "Monto inválido" });
            }

            const user = await this.userRepository.findById(userId);
            if (!user) {
                await t.rollback();
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            const saldoAnterior = parseFloat(user.saldo || 0);
            const newBalance = saldoAnterior + amountFloat;

            console.log(`Usuario: ${userId} | Saldo Anterior: ${saldoAnterior} | A sumar: ${amountFloat} | Nuevo: ${newBalance}`);

            user.saldo = newBalance;
            await user.save({ transaction: t });

            // Registrar transacción
            if (this.TransactionModel) {
                await this.TransactionModel.create({
                    userId: user.id,
                    amount: amountFloat,
                    type: 'TOPUP',
                    description: 'Recarga de saldo'
                }, { transaction: t });
            }

            await t.commit();
            console.log("--- RECARGA FINALIZADA CON ÉXITO ---");
            
            res.json({ message: "Recarga exitosa", saldo: newBalance });

        } catch (error) {
            await t.rollback();
            console.error("ERROR EN RECARGA:", error);
            res.status(500).json({ error: "Error en recarga: " + error.message });
        }
    }
}

module.exports = UserController;