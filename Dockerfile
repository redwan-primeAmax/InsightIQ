# Build stage
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-slim
WORKDIR /app
# We need production dependencies because server.cjs has external packages
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/analysis_prompt.txt ./

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/server.cjs"]
