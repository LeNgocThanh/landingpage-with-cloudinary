# Giai đoạn 1: Build (Chạy trên server GitHub)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Giai đoạn 2: Chạy (Chạy trên VPS Linux của bạn)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy các file cần thiết từ giai đoạn build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]