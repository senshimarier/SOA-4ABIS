# Usar una imagen base de Node.js 
FROM node:18

# Estableer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el codigo fuante al contenedor
COPY . .

# Exponer el puerto en el que corre el servicio
EXPOSE 3000

# comando para iniciar
CMD ["node" , "index.js"]
