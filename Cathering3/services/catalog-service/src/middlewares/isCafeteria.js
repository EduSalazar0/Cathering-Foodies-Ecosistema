module.exports = (req, res, next) => {
    const roles = req.user?.realm_access?.roles || [];
    if (!roles.includes('cafeteria') && req.user?.role !== 'cafeteria') {
        return res.status(403).json({ error: 'Requiere rol de Cafetería' });
    }
    next();
};