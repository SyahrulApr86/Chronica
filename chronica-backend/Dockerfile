# Use Node.js 20 Alpine as base image (required by NestJS 11+)
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install git for husky and other dependencies
RUN apk add --no-cache git dumb-init curl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies with husky skip for Docker environment
ENV HUSKY=0
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM node:20-alpine AS development
WORKDIR /app

# Install git for potential git operations
RUN apk add --no-cache git

# Copy package files
COPY package*.json ./

# Skip husky installation in Docker environment
ENV HUSKY=0
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Install dumb-init and curl for proper signal handling and health checks
RUN apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy package files and install production dependencies
COPY package*.json ./

# Skip husky installation in Docker environment
ENV HUSKY=0
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application from development stage
COPY --from=development /app/dist ./dist
COPY --from=development /app/prisma ./prisma

# Generate Prisma client in production
RUN npx prisma generate

# Copy generated Prisma client
COPY --from=development /app/node_modules/.prisma ./node_modules/.prisma

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3005/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["dumb-init", "node", "dist/main"] 