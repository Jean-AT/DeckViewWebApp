# --- Stage 1: build ---
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: nginx ---
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
ENV BACKEND_URL=http://localhost:3000
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]