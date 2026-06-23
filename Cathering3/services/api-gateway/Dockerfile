FROM node:22-alpine
WORKDIR /app
# Instalar dependencias de compilación para sqlite3
RUN apk add --no-cache python3 make g++ sqlite-dev
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
