const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const kmsService = require("../services/KmsService");

const jwtValidator = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: process.env.JWKS_URI 
    }),
    audience: ['cathering-backend', 'cathering-react', 'account'], 
    issuer: process.env.JWT_ISSUER,     
    algorithms: ["RS256"],              
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
            console.log(`[OrderService Auth] Token cifrado detectado, procediendo a desencriptar con KMS...`);
            const decryptedToken = await kmsService.decryptData(encryptedToken);
            
            // Reinyectar para que el validador estándar de JWT lo recoja
            req.headers.authorization = `Bearer ${decryptedToken}`;
            console.log(`[OrderService Auth] Token KMS desencriptado e inyectado correctamente.`);
        } else if (req.headers.authorization) {
            // PLAN DE CONTINGENCIA HÍBRIDO (Fallback)
            console.warn(`[OrderService Auth] ADVERTENCIA: No se detectó x-encrypted-session-token. Haciendo fallback al header Authorization estándar.`);
        } else {
            console.log(`[OrderService Auth] Petición sin token de sesión detectada.`);
        }

        // Delegar la ejecución de validación asimétrica RS256 a express-jwt
        return jwtValidator(req, res, next);
        
    } catch (error) {
        console.error('[OrderService Auth] Error crítico al desencriptar el token de sesión:', error);
        return res.status(401).json({ error: 'Token de sesión corrupto o no desencriptable' });
    }
};

module.exports = authMiddleware;