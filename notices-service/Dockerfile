# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Clean install of dependencies
RUN npm ci 
COPY . .

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app

# Switch to non-root user provided by the alpine node image
USER node

# Copy built artifacts from the builder stage
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/index.js ./

EXPOSE 5000

CMD ["node", "index.js"]