# Stage 1: Dependencies
FROM node:18-alpine AS dependencies

WORKDIR /app

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm@9

# Install all dependencies (including dev dependencies for building)
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Build the React application
# This creates optimized production files in dist/
RUN pnpm build

# Stage 3: Production (nginx)
# Use nginx to serve the static files
FROM nginx:alpine AS runner

# Copy custom nginx configuration
# We'll create this file next
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React app from builder stage
# Vite outputs to dist/ by default
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (standard HTTP port)
EXPOSE 80

# nginx runs in foreground by default, perfect for Docker
CMD ["nginx", "-g", "daemon off;"]