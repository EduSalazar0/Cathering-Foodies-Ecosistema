const validateColegio = (req, res, next) => {
    // Lee los datos directamente del body (funciona para POST y PUT)
    const { nombre, telefono } = req.body; 

    if (!nombre || !telefono) {
        return res.status(400).json({ 
            message: 'El nombre de la institución y el teléfono son obligatorios.' 
        });
    }

    const phoneRegex = /^\d{10}$/; 
    if (!phoneRegex.test(telefono)) {
        return res.status(400).json({ 
            message: 'El número de teléfono no es válido. Debe tener 10 dígitos.' 
        });
    }

    next();
};

module.exports = validateColegio;