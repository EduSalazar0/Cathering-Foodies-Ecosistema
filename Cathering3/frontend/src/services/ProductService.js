const API_BASE_URL = 'http://localhost:3000/api';

class ProductService {
    constructor(token) {
        this.token = token;
        // No definimos 'Content-Type' aquí porque al enviar FormData,
        // el navegador lo establece automáticamente con el "boundary" correcto.
        this.authHeader = { 'Authorization': `Bearer ${this.token}` };
    }

    async getMenu() {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                ...this.authHeader 
            },
        });
        return response.json();
    }

    async createProduct(productData) {
        // productData debe ser un objeto FormData
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: this.authHeader, // Solo enviamos Authorization
            body: productData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al crear producto');
        }
        return response.json();
    }

    async deleteProduct(id) {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'DELETE',
            headers: this.authHeader,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al eliminar producto');
        }
        return true;
    }
}

export default ProductService;