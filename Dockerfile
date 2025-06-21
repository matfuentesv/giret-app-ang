FROM node:20.11 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --project=giret-app-ang --configuration production

FROM nginx:alpine

COPY --from=build /app/dist/giret-app-ang/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
