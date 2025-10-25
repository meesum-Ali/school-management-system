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

# Accept build arguments for Next.js public environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_ZITADEL_ISSUER
ARG NEXT_PUBLIC_ZITADEL_CLIENT_ID
ARG NEXT_PUBLIC_ZITADEL_REDIRECT_URI

# Set environment variables for the build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_ZITADEL_ISSUER=$NEXT_PUBLIC_ZITADEL_ISSUER
ENV NEXT_PUBLIC_ZITADEL_CLIENT_ID=$NEXT_PUBLIC_ZITADEL_CLIENT_ID
ENV NEXT_PUBLIC_ZITADEL_REDIRECT_URI=$NEXT_PUBLIC_ZITADEL_REDIRECT_URI

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
# Copy source files needed for App Router at runtime
COPY --from=builder /app/app ./app
COPY --from=builder /app/components ./components
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/hooks ./hooks
COPY --from=builder /app/types ./types
COPY --from=builder /app/styles ./styles
COPY --from=builder /app/theme ./theme

# Install only production dependencies
RUN pnpm install --prod

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["sh", "-c", "pnpm start -H 0.0.0.0 -p 3000"]
