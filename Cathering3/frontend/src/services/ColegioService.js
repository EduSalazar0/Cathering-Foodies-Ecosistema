const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ColegioService {
    constructor(token) {
        this.token = token;
        this.headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
        };
    }

    async _handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Request failed.');
        }
        return response.json();
    }

    /**
     * Obtiene los detalles del colegio del admin logueado
     */
    async getMyColegioDetails() {
        const response = await fetch(`${API_BASE_URL}/auth/colegio`, {
            method: 'GET',
            headers: this.headers,
        });
        return this._handleResponse(response);
    }

    /**
     * Actualiza los detalles del colegio del admin logueado
     */
    async updateMyColegioDetails(data) {
        const response = await fetch(`${API_BASE_URL}/auth/colegio`, {
            method: 'PUT',
            headers: this.headers,
            body: JSON.stringify(data),
        });
        return this._handleResponse(response);
    }
}

export default ColegioService;