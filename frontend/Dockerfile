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

# Build the Next.js application
RUN pnpm build

# Debugging step: List directory contents to verify .next exists
RUN ls -al /app/.next

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy built files and configs from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/tailwind.config.js ./
COPY --from=builder /app/postcss.config.js ./

# Install only production dependencies
RUN pnpm install --prod

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["sh", "-c", "pnpm start -H 0.0.0.0 -p 3000"]
