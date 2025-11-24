# Fullstack DevOps - Turborepo

A modern fullstack monorepo application built with Turborepo, featuring a React 19 + Vite frontend and HonoJS backend.

## Tech Stack

- **Monorepo Management**: Turborepo
- **Package Manager**: pnpm
- **Frontend**: React 19 (RC), Vite, TypeScript
- **Backend**: HonoJS, Node.js, TypeScript
- **Development**: Hot reloading, TypeScript, ESLint

## Project Structure

```
fullstack-devops/
├── apps/
│   ├── backend/        # HonoJS API server
│   └── frontend/       # React 19 + Vite app
├── turbo.json         # Turborepo configuration
├── pnpm-workspace.yaml
└── package.json
```

## API Endpoints

The backend provides the following endpoints:

- `GET /api/health` - Health check endpoint
- `GET /api/hello` - Returns a greeting message
- `GET /api/info` - Returns application information

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9.0.0+

### Installation

1. Install dependencies:
```bash
pnpm install
```

### Development

Run both frontend and backend in development mode:

```bash
pnpm dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Build

Build all applications:

```bash
pnpm build
```

### Start Production

After building, start the production servers:

```bash
pnpm start
```

## Features

- **Monorepo Architecture**: Efficient code sharing and dependency management
- **Hot Reloading**: Instant feedback during development
- **TypeScript**: Type-safe development across the stack
- **Modern React**: Using React 19 RC with latest features
- **Fast Build**: Vite for lightning-fast HMR and builds
- **CORS Enabled**: Backend configured for frontend integration
- **Proxy Configuration**: Frontend proxies API calls to backend

## Development Workflow

1. The frontend runs on port 3000 and proxies `/api/*` requests to the backend on port 3001
2. Both applications support hot reloading for rapid development
3. Turbo manages the build pipeline and caching for optimal performance

## Scripts

- `pnpm dev` - Start development servers
- `pnpm build` - Build all applications
- `pnpm start` - Start production servers
- `pnpm type-check` - Run TypeScript type checking

## Docker Setup

This project includes a comprehensive Docker setup for both development and production environments, designed to handle the complexities of a pnpm monorepo structure.

### Docker Architecture Overview

We use a multi-stage Docker build process and separate configurations for development and production:

- **Development**: Hot-reloading enabled with volume mounts
- **Production**: Optimized multi-stage builds with minimal image sizes

### File Structure

```
fullstack-devops/
├── apps/
│   ├── backend/
│   │   ├── Dockerfile         # Production multi-stage build
│   │   ├── Dockerfile.dev     # Development with hot-reload
│   │   └── .dockerignore      # Exclude unnecessary files
│   └── frontend/
│       ├── Dockerfile         # Production with nginx
│       ├── Dockerfile.dev     # Development with Vite
│       ├── nginx.conf         # nginx configuration
│       └── .dockerignore      # Exclude unnecessary files
├── docker-compose.yml         # Production orchestration
└── docker-compose.dev.yml     # Development with hot-reload
```

### Development Setup

#### Quick Start

```bash
# Start development environment with hot-reloading
docker-compose -f docker-compose.dev.yml up

# Run in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

#### Development Features

1. **Hot Reloading**: Source code is mounted as volumes, changes reflect immediately
2. **Monorepo Support**: Handles pnpm workspace dependencies correctly
3. **Network Communication**: Services communicate via Docker network using service names
4. **Environment Variables**: Configured for development mode

#### How Development Containers Work

**Backend Development Container:**
- Uses Node.js 18 Alpine base image
- Installs all workspace dependencies via pnpm
- Mounts source files for hot-reloading with tsx watch mode
- Runs on port 3001

**Frontend Development Container:**
- Uses Node.js 18 Alpine for Vite dev server
- Configures Vite to listen on all interfaces (required for Docker)
- Proxies `/api` requests to backend container
- Runs on port 3000

### Production Setup

#### Build and Run

```bash
# Build and start production containers
docker-compose up --build

# Run in background
docker-compose up -d

# Access services:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

#### Production Optimizations

1. **Multi-Stage Builds**: Reduces final image size significantly
2. **Security**: Runs as non-root user
3. **Layer Caching**: Optimized COPY commands for better cache utilization
4. **Static File Serving**: Frontend uses nginx for optimal performance

### Docker Implementation Details

#### Monorepo Challenges Solved

1. **Dependency Management**:
   - pnpm creates symlinks to a central `.pnpm` store
   - Solution: Install all workspace dependencies in container
   - Cannot use `--frozen-lockfile` in dev due to path differences

2. **Build Context**:
   - Uses repository root as build context
   - Copies all necessary `package.json` files
   - Maintains monorepo structure inside containers

3. **Volume Mounts for Development**:
   ```yaml
   volumes:
     - ./apps/backend/src:/workspace/apps/backend/src
     - ./apps/backend/package.json:/workspace/apps/backend/package.json
   ```

#### Backend Dockerfile (Production)

```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@9
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@9
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
COPY --from=builder /app/dist ./dist
COPY --from=dependencies /app/node_modules ./node_modules
USER nodejs
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

**Key Features:**
- Three stages: dependencies, builder, runner
- Final image only contains compiled code and production dependencies
- Runs as non-root user for security
- ~150MB final image size

#### Frontend Dockerfile (Production)

```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS dependencies
# ... install dependencies

# Stage 2: Builder
FROM node:18-alpine AS builder
# ... build React app

# Stage 3: Production (nginx)
FROM nginx:alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Key Features:**
- Builds React app in builder stage
- Serves static files with nginx
- Includes custom nginx configuration for SPA routing
- Proxies API calls to backend service

#### nginx Configuration

The nginx.conf handles:
- React Router (SPA) routing with try_files
- API proxy to backend service
- Gzip compression
- Security headers
- Static asset caching (1 year for hashed files)

### Docker Compose Configuration

#### Development (docker-compose.dev.yml)

```yaml
services:
  backend-dev:
    build:
      context: .  # Root context for monorepo
      dockerfile: ./apps/backend/Dockerfile.dev
    environment:
      - NODE_ENV=development
    volumes:  # Mount source for hot-reload
      - ./apps/backend/src:/workspace/apps/backend/src
    working_dir: /workspace
    command: pnpm --filter backend dev

  frontend-dev:
    build:
      context: .
      dockerfile: ./apps/frontend/Dockerfile.dev
    environment:
      - VITE_API_BASE_URL=http://backend-dev:3001
    volumes:
      - ./apps/frontend/src:/workspace/apps/frontend/src
    depends_on:
      - backend-dev
```

**Key Points:**
- Uses root as build context for monorepo support
- Environment variables for service discovery
- Volume mounts for hot-reloading
- Service dependencies ensure correct startup order

#### Production (docker-compose.yml)

```yaml
services:
  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3001/api/health"]

  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"  # nginx runs on port 80 internally
    depends_on:
      - backend
```

### Troubleshooting

#### Common Issues and Solutions

1. **Module not found errors**:
   - Cause: pnpm symlinks not resolving correctly
   - Solution: Install all workspace dependencies, not just filtered

2. **Container crashes on startup**:
   - Check logs: `docker-compose -f docker-compose.dev.yml logs [service-name]`
   - Ensure all dependencies are installed correctly

3. **Hot-reload not working**:
   - Verify volume mounts are correct
   - Check that Vite is configured with `host: true`

4. **Port already in use**:
   - Change ports in docker-compose.yml
   - Or stop conflicting local services

### Best Practices

1. **Always use exact versions** in package.json for reproducible builds
2. **Use .dockerignore** to exclude unnecessary files
3. **Layer caching**: Order Dockerfile commands from least to most frequently changing
4. **Security**: Always run production containers as non-root user
5. **Multi-stage builds**: Keep production images small and secure

### Next Steps

The Docker setup provides a solid foundation for:
- Kubernetes deployment (next phase)
- CI/CD pipeline integration
- Container registry workflows
- Production deployment strategies