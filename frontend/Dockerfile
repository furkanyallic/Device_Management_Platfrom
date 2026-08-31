# 1. Aşama: Build (React + Vite static bundle)
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 2. Aşama: Runner (Nginx Web Server)
FROM nginx:alpine AS runner

# Static HTML/JS/CSS paketlerini Nginx dizinine kopyala
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA (React Router DOM) için Nginx konfigürasyonunu kopyala
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
