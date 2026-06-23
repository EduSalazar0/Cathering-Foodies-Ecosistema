// services/auth-service/src/use-cases/UpdateUser.js

class UpdateUser {
    constructor(userRepository, encryptService) {
        this.userRepository = userRepository;
        this.encryptService = encryptService;
    }

    async execute(userId, updates) {
        const existingUser = await this.userRepository.findById(userId);
        if (!existingUser) {
            throw new Error(`Usuario con ID ${userId} no encontrado.`);
        }

        let { username, email, password } = updates;
        
        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;

        if (password) {
            updateData.password = await this.encryptService.hash(password);
        }

        const updatedUser = await this.userRepository.update(userId, updateData);

        const userJson = updatedUser.toJSON();
        delete userJson.password;
        
        return userJson;
    }
}

module.exports = UpdateUser;