# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies including devDependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
RUN pnpm build

# Verify the build output
RUN ls -la dist/

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Create necessary directories and set permissions
RUN mkdir -p /app/node_modules && \
    chown -R node:node /app

# Switch to non-root user
USER node

# Expose the port the app runs on
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Command to run the application
CMD ["node", "dist/main"]
