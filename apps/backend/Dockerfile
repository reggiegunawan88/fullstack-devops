# Stage 1: Dependencies
# We use the full node image here because we need build tools
FROM node:18-alpine AS dependencies

# Set working directory inside container
WORKDIR /app

# Copy package files first (this is for better caching)
# If these files don't change, Docker can reuse this layer
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally in the container
RUN npm install -g pnpm@9

# Install dependencies
# --frozen-lockfile ensures exact versions from lock file
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
# This stage builds our TypeScript code
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm in builder stage too
RUN npm install -g pnpm@9

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy all source code
COPY . .

# Build the TypeScript code to JavaScript
RUN pnpm build

# Stage 3: Runner (Production)
# This is the final slim image that will run in production
FROM node:18-alpine AS runner

WORKDIR /app

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy only the built code and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the port our app runs on
EXPOSE 3001

# Start the application
CMD ["node", "dist/index.js"]