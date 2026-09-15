# Standalone frontend image, served via nginx. habit-backend and
# habit-frontend are separate deployables (own images, own origins) - the
# app calls the backend cross-origin, so VITE_API_BASE_URL must point at
# wherever that backend actually runs (baked in at build time, since Vite
# inlines import.meta.env.VITE_* into the static bundle).
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
