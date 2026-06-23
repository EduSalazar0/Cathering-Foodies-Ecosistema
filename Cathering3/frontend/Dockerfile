# 1. Imagen base
FROM node:22-alpine

# 2. Carpeta de trabajo
WORKDIR /app

# 3. Copiar dependencias e instalar
COPY package*.json ./
RUN npm install

# 4. Copiar código fuente
COPY . .

# 5. Exponer el puerto de Vite
EXPOSE 5173

# 6. Comando de inicio (con --host para que sea accesible desde fuera)
CMD ["npm", "run", "dev", "--", "--host"]