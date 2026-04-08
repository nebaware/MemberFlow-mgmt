# Build Stage
FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies for both frontend and backend
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Final Stage
FROM node:20-slim

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Copy build artifacts and server source
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/.env.example ./.env

EXPOSE 3001

CMD ["npx", "tsx", "server/index.ts"]
