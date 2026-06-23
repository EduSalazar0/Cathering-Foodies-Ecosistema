require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. CORS va primero
app.use(cors());

// 2. Logger global va segundo
app.use((req, res, next) => { 
    console.log(`[Gateway] Recibida petición: ${req.method} ${req.originalUrl}`); 
    next(); 
});

const kmsService = require('./src/services/KmsService');

// INTERCEPTOR CRIPTOGRÁFICO: Cifrar JWT en tránsito
app.use(async (req, res, next) => {
    try {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            const token = req.headers.authorization.split(' ')[1];
            
            console.log(`[Gateway KMS] Interceptando token para cifrar...`);
            // Ciframos el token usando KMS
            const encryptedToken = await kmsService.encryptData(token);
            
            // Inyectamos el header cifrado
            req.headers['x-encrypted-session-token'] = encryptedToken;
            
            // Purgamos el token original en texto plano
            delete req.headers.authorization;
            console.log(`[Gateway KMS] Token cifrado y header Authorization purgado.`);
        }
        next();
    } catch (error) {
        console.error('[Gateway KMS] Error al cifrar token:', error);
        res.status(500).json({ error: 'Error en capa de seguridad del Gateway' });
    }
});

// 3. PROXIES van tercero (ANTES de cualquier parser de body)
const proxyOptions = (target, pathRewriteKey, pathRewriteValue) => {
    const options = {
        target,
        changeOrigin: true,
        proxyTimeout: 5000,
        timeout: 5000,
        logLevel: 'debug',
        onProxyReq: (proxyReq, req, res) => {
            console.log(`[Proxy -> ${target}] Enviando: ${req.method} ${req.url}`);
        },
        onError: (err, req, res) => {
            console.error(`[PROXY ERROR hacia ${target}]`, err.message);
            res.status(502).json({ error: 'Bad Gateway', details: err.message });
        }
    };
    if (pathRewriteKey && pathRewriteValue !== undefined) {
        options.pathRewrite = { [pathRewriteKey]: pathRewriteValue };
    }
    return options;
};

// Rutas Proxy
app.use('/api/wallet', createProxyMiddleware(proxyOptions('http://order-service:3003', '^/', '/api/wallet/')));
app.use('/api/orders', createProxyMiddleware(proxyOptions('http://order-service:3003', '^/', '/api/orders/')));
app.use('/api/auth', createProxyMiddleware(proxyOptions('http://auth-service:3001', '^/', '/api/auth/')));
app.use('/api/catalog', createProxyMiddleware(proxyOptions('http://catalog-service:3002', '^/', '/api/catalog/')));
app.use('/api/products', createProxyMiddleware(proxyOptions('http://catalog-service:3002', '^/', '/api/products/')));
app.use('/api/ingredients', createProxyMiddleware(proxyOptions('http://catalog-service:3002', '^/', '/api/ingredients/')));
app.use('/api/colegio', createProxyMiddleware(proxyOptions('http://catalog-service:3002', '^/', '/api/colegio/')));
app.use('/uploads', createProxyMiddleware(proxyOptions('http://catalog-service:3002', '^/', '/uploads/')));

// 4. Body Parser (Si es necesario para rutas locales futuras, va al final)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Iniciar Gateway
app.listen(PORT, () => {
    console.log(`API Gateway corriendo en puerto ${PORT}`);
    console.log(`Redirigiendo tráfico a microservicios internos...`);
});