FROM node:20.11 AS build

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar el archivo package.json y package-lock.json al contenedor
COPY package*.json ./

# Instalar las dependencias del proyecto
RUN npm install

# Copiar el resto del código del proyecto al contenedor
COPY . .

# Construir la aplicación Angular
RUN npm run build --prod

# Usar una imagen base de nginx para servir la aplicación
FROM nginx:alpine

# Copiar los archivos estáticos construidos desde el contenedor de construcción anterior
COPY --from=build /app/dist/giret-app-ang/browser /usr/share/nginx/html

# Copiar archivo de configuración de Nginx
#COPY nginx.conf /etc/nginx/nginx.conf

# Exponer el puerto 80 para el servidor
EXPOSE 4200

# Comando para ejecutar nginx
CMD ["nginx", "-g", "daemon off;"]
