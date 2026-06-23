// frontend/src/components/common/Input.jsx
import React from 'react';

// AÑADIMOS 'name' a la lista de props
const Input = ({ label, id, name, type = 'text', value, onChange, placeholder, required = false }) => {
    
    // Si no se pasa un 'name', usamos el 'id' como fallback
    const inputName = name || id; 
    
    return (
        <div style={{ marginBottom: '15px' }}>
            <label htmlFor={id} style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                {label}
            </label>
            <input
                type={type}
                id={id}
                name={inputName} // <-- AHORA USAMOS EL 'name' CORRECTO
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                }}
            />
        </div>
    );
};

export default Input;