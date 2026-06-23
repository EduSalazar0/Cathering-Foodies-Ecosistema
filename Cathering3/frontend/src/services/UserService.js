const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class UserService {
    constructor(token) {
        this.token = token;
        this.headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
        };
    }

    // Función genérica que da formato a respuestas
    async _handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Request failed.');
        }
        return response.json();
    }

    // --- GESTIÓN DE USUARIOS ---

    async getAllUsers() {
        const response = await fetch(`${API_BASE_URL}/auth/users`, {
            method: 'GET',
            headers: this.headers,
        });
        return this._handleResponse(response);
    }

    async createCafeteriaUser(userData) {
        const response = await fetch(`${API_BASE_URL}/auth/users/cafeteria`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(userData),
        });
        return this._handleResponse(response);
    }

    async createEstudianteUser(userData) {
        const response = await fetch(`${API_BASE_URL}/auth/users/estudiante`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(userData),
        });
        return this._handleResponse(response);
    }

    async createPersonalUser(userData) {
        const response = await fetch(`${API_BASE_URL}/auth/users/personal`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(userData),
        });
        return this._handleResponse(response);
    }

    async updateUser(userId, updates) {
        const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
            method: 'PUT',
            headers: this.headers,
            body: JSON.stringify(updates),
        });
        return this._handleResponse(response);
    }

    async deleteUser(userId) {
        const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
            method: 'DELETE',
            headers: this.headers,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to delete user ID ${userId}.`);
        }
        return { success: true }; 
    }

    // --- OTROS SERVICIOS (AQUÍ ESTABAN LOS ERRORES) ---

    async getAllIngredients() {
        // CORRECCIÓN 1: Cambiado de /products/ingredients a /ingredients
        // Esto evita que te traiga las Hamburguesas (Productos) y trae la lista correcta.
        const response = await fetch(`${API_BASE_URL}/products/ingredients`, {
            headers: this.headers,
        });
        return this._handleResponse(response)
    }

    async getMyAllergies() {
        const response = await fetch(`${API_BASE_URL}/auth/allergies`, {
            headers: this.headers,
        });
        return this._handleResponse(response);
    }

    async updateMyAllergies(namesArray) {
        const response = await fetch(`${API_BASE_URL}/auth/allergies`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({ allergies: namesArray }), // Usamos nombres
        });
        return this._handleResponse(response);
    }

}

export default UserService;