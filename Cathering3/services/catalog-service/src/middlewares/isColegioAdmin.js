module.exports = (req, res, next) => {
    // Ajusta 'COLEGIO_ADMIN' según como guardes el rol en tu base de datos
    if (req.user && (req.user.role === 'COLEGIO_ADMIN' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ error: 'Acceso denegado: Se requiere rol Admin de Colegio.' });
    }
};