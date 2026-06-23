// auth-service/src/middlewares/AuthMiddleware.js
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const kmsService = require("../services/KmsService");
const jwtValidator = jwt({
    // Descarga dinámica de la llave pública desde Keycloak
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: process.env.JWKS_URI // Ej: http://<IP>/realms/proyecto-seguro/protocol/openid-connect/certs
    }),

    audience: ['cathering-backend', 'cathering-react', 'account'],
    issuer: process.env.JWT_ISSUER,     // Ej: http://<IP>/realms/proyecto-seguro
    algorithms: ["RS256"],              // Firma asimétrica estricta

    // IMPORTANTE: Esto asegura que el payload se guarde en req.user para no romper tus controladores
    requestProperty: 'user',

    getToken: function fromHeaderOrQuerystring(req) {
        if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
            return req.headers.authorization.split(" ")[1];
        }
        return null;
    }
});

const authMiddleware = async (req, res, next) => {
    try {
        const encryptedToken = req.headers['x-encrypted-session-token'];

        if (encryptedToken) {
            console.log(`[AuthService Auth] Token cifrado detectado, procediendo a desencriptar con KMS...`);
            const decryptedToken = await kmsService.decryptData(encryptedToken);

            // Reinyectar para que el validador estándar de JWT lo recoja
            req.headers.authorization = `Bearer ${decryptedToken}`;
            console.log(`[AuthService Auth] Token KMS desencriptado e inyectado correctamente.`);
        } else if (req.headers.authorization) {
            // PLAN DE CONTINGENCIA HÍBRIDO (Fallback)
            console.warn(`[AuthService Auth] ADVERTENCIA: No se detectó x-encrypted-session-token. Haciendo fallback al header Authorization estándar.`);
        } else {
            console.log(`[AuthService Auth] Petición sin token de sesión detectada.`);
        }

        // Delegar la ejecución de validación asimétrica RS256 a express-jwt
        return jwtValidator(req, res, next);

    } catch (error) {
        console.error('[AuthService Auth] Error crítico al desencriptar el token de sesión:', error);
        return res.status(401).json({ error: 'Token de sesión corrupto o no desencriptable' });
    }
};

// Middleware para capturar errores de token vencido o inválido
const handleAuthError = (err, req, res, next) => {
    if (err.name === "UnauthorizedError") {
        return res.status(401).json({
            error: "Token inválido, expirado o ausente",
            details: err.message
        });
    }
    next(err);
};

module.exports = { authMiddleware, handleAuthError };