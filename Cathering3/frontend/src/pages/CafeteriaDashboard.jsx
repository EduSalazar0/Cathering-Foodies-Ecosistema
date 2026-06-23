// frontend/src/pages/CafeteriaDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const CafeteriaDashboard = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // STATE IN ENGLISH
    const [newProduct, setNewProduct] = useState({
        name: '', 
        description: '', 
        price: '', 
        stock: '', 
        preparationTime: '', 
        ingredients: '', 
        availableFrom: ''
    });
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const response = await api.get('/products');
            const menu = response.data;
            if (Array.isArray(menu)) {
                setProducts(menu);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error(error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleChange = (e) => {
        setNewProduct({...newProduct, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageFile) return alert("You must upload an image");

        const formData = new FormData();
        // SENDING IN ENGLISH
        formData.append('name', newProduct.name); 
        formData.append('description', newProduct.description);
        formData.append('price', newProduct.price);
        formData.append('stock', newProduct.stock);
        formData.append('preparationTime', newProduct.preparationTime); // Matches Model
        formData.append('ingredients', newProduct.ingredients); 
        formData.append('availableFrom', newProduct.availableFrom); // Matches Model
        formData.append('category', 'Main'); 
        formData.append('image', imageFile);
        
        try {
            await api.post('/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Product created successfully!");
            // Reset form
            setNewProduct({ 
                name: '', description: '', price: '', stock: '', 
                preparationTime: '', ingredients: '', availableFrom:'' 
            });
            setImageFile(null);
            fetchMenu(); 
        } catch (error) {
            console.error(error);
            alert("Error creating product: " + (error.response?.data?.error || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await api.delete(`/products/${id}`);
            alert("Product deleted");
            fetchMenu(); 
        } catch (error) {
            alert(error.response?.data?.error || error.message);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Cafeteria Dashboard - {user?.username}</h1>
            
            {/* Create Form */}
            <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '30px', borderRadius: '8px' }}>
                <h3>Add New Product</h3>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {/* INPUT NAMES MUST MATCH STATE KEYS (ENGLISH) */}
                        <Input label="Product Name" name="name" value={newProduct.name} onChange={handleChange} required />
                        <Input label="Price ($)" name="price" type="number" step="0.01" value={newProduct.price} onChange={handleChange} required />
                        <Input label="Stock" name="stock" type="number" value={newProduct.stock} onChange={handleChange} />
                        <Input label="Prep Time (min)" name="preparationTime" type="number" value={newProduct.preparationTime} onChange={handleChange} />
                        <Input label="Available From" name="availableFrom" type="date" value={newProduct.availableFrom} onChange={handleChange}/>                  
                    </div>
                    <Input label="Description" name="description" value={newProduct.description} onChange={handleChange} />
                    <Input label="Ingredients (comma separated)" name="ingredients" placeholder="e.g. Peanuts, Milk" value={newProduct.ingredients} onChange={handleChange} />
                    
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Product Image</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} required />
                    </div>

                    <Button type="submit">Publish Product</Button>
                </form>
            </div>

            {/* Product List */}
            <h3>Current Menu</h3>
            {loading ? <p>Loading...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                    {Array.isArray(products) && products.length > 0 ? (
                        products.map(p => (
                            <div key={p.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                                {p.imageUrl && (
                                    <img 
                                        src={p.imageUrl} 
                                        alt={p.name} 
                                        style={{ width: '100%', height: '150px', objectFit: 'contain', borderRadius: '4px' }} 
                                        onError={(e) => {e.target.style.display = 'none'}}
                                    />
                                )}
                                <h4>{p.name}</h4>
                                <p style={{ color: '#888', fontSize: '0.9em' }}>{p.description}</p>
                                <p><strong>${p.price}</strong></p>
                                <div style={{ fontSize: '0.85em', color: '#555' }}>
                                    <strong>Ingredients:</strong> {p.ingredients || 'None'}
                                </div>
                                <Button 
                                    onClick={() => handleDelete(p.id)} 
                                    style={{ backgroundColor: '#d32f2f', width: '100%', fontSize: '0.9em', marginTop: '10px' }}
                                >
                                    Delete
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#666'}}>
                            <p>No products found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CafeteriaDashboard;