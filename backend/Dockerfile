# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN pnpm build

# Debugging step: List directory contents to verify build
RUN ls -al dist

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy built files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Install only production dependencies
RUN pnpm install --prod

# Expose the desired port
EXPOSE 5000

# Define the startup command
CMD ["pnpm", "start:prod"]
