# Kubernetes Deployment Summary

This document summarizes the Kubernetes deployment journey for our fullstack application using Minikube.

## Deployment Checklist

### Phase 1: Environment Setup

- [x] Verified Minikube installation and status
- [x] Confirmed kubectl connectivity (`kubectl get nodes`)
- [x] Enabled Ingress addon (`minikube addons enable ingress`)
- [x] Understood Docker daemon options (Minikube vs Docker Hub)

### Phase 2: Backend Deployment

- [x] Connected Docker CLI to Minikube (`eval $(minikube docker-env)`)
- [x] Modified backend Dockerfile for monorepo (removed pnpm-lock.yaml)
- [x] Built backend image (`docker build -t fullstack-backend:v1.0`)
- [x] Created `k8s/base/fullstack-backend-deployment.yaml`
- [x] Created `k8s/base/fullstack-backend-service.yaml` (ClusterIP)
- [x] Fixed service selector to match pod labels (`deployment: fullstack-backend`)
- [x] Applied and verified backend pods running

### Phase 3: Frontend Deployment

- [x] Modified frontend Dockerfile for monorepo (removed pnpm-lock.yaml)
- [x] Built frontend image (`docker build -t fullstack-frontend:v1.0`)
- [x] Created `k8s/base/fullstack-frontend-deployment.yaml`
- [x] Created `k8s/base/fullstack-frontend-service.yaml` (ClusterIP)
- [x] Debugged CrashLoopBackOff (nginx upstream resolution issue)
- [x] Fixed nginx.conf proxy to use K8s service name (`http://fullstack-backend:3001`)
- [x] Applied and verified frontend pods running

### Phase 4: Frontend-v2 Deployment

- [x] Created `apps/frontend-v2/` directory with new frontend
- [x] Built frontend-v2 image (`docker build -t fullstack-frontend-v2:v1.0`)
- [x] Created `k8s/base/fullstack-frontend-v2-deployment.yaml`
- [x] Created `k8s/base/fullstack-frontend-v2-service.yaml` (ClusterIP)
- [x] Configured host-based routing via subdomain (`v2.localhost`)
- [x] Applied and verified frontend-v2 pods running

### Phase 5: Networking & Ingress

- [x] Created `k8s/base/ingress.yaml` with path and host-based routing
- [x] Learned about Service types (ClusterIP, NodePort, LoadBalancer)
- [x] Learned about Ingress vs LoadBalancer trade-offs
- [x] Configured `minikube tunnel` for external access
- [x] Successfully access app via Ingress at `http://127.0.0.1`
- [x] Successfully access frontend-v2 via `http://v2.localhost`
- [x] Added `/etc/hosts` entry for `v2.localhost`

### Phase 6: Git Commits

- [x] Committed Dockerfile adaptations
- [x] Committed Kubernetes manifests
- [x] Committed package.json updates

## Files Created/Modified

```
fullstack-devops/
├── apps/
│   ├── backend/
│   │   └── Dockerfile                # Modified (removed lock file)
│   ├── frontend/
│   │   ├── Dockerfile                # Modified (removed lock file)
│   │   └── nginx.conf                # Modified (proxy to K8s service)
│   └── frontend-v2/                  # NEW
│       ├── Dockerfile                # Created
│       ├── Dockerfile.dev            # Created
│       ├── nginx.conf                # Created
│       ├── package.json              # Created
│       ├── vite.config.ts            # Created
│       └── src/                      # Created
├── k8s/
│   └── base/
│       ├── fullstack-backend-deployment.yaml    # Created
│       ├── fullstack-backend-service.yaml       # Created (selector: deployment)
│       ├── fullstack-frontend-deployment.yaml   # Created
│       ├── fullstack-frontend-service.yaml      # Created
│       ├── fullstack-frontend-v2-deployment.yaml # NEW
│       ├── fullstack-frontend-v2-service.yaml    # NEW
│       └── ingress.yaml                         # Updated (host-based routing)
├── package.json                      # Modified (pinned versions)
└── pnpm-lock.yaml                    # Updated
```

## Concepts Learned

| Concept                                        | Status |
| ---------------------------------------------- | ------ |
| Pods, Deployments, ReplicaSets                 | Done   |
| Services (ClusterIP)                           | Done   |
| Labels & Selectors (matching pods to services) | Done   |
| imagePullPolicy                                | Done   |
| kubectl commands (apply, get, logs, describe)  | Done   |
| Port-forwarding                                | Done   |
| Ingress Controller                             | Done   |
| LoadBalancer vs Ingress                        | Done   |
| Host-based routing (subdomains)                | Done   |
| Path-based routing (/api, /)                   | Done   |
| Kustomization (theory)                         | Done   |
| Minikube Docker daemon vs local Docker         | Done   |
| Debugging CrashLoopBackOff                     | Done   |
| Debugging ErrImageNeverPull                    | Done   |
| Service endpoints debugging                    | Done   |
| Immutable selector fields                      | Done   |
| Image tagging strategies (v1.0 vs latest)      | Done   |
| apiVersion for different K8s resources         | Done   |

## Quick Reference Commands

```bash
# Connect to Minikube Docker (IMPORTANT: must do before building images!)
eval $(minikube docker-env)

# Switch back to local Docker
eval $(minikube docker-env -u)

# Build images (run after connecting to Minikube Docker)
docker build -t fullstack-backend:v1.0 -f apps/backend/Dockerfile apps/backend/
docker build -t fullstack-frontend:v1.0 -f apps/frontend/Dockerfile apps/frontend/
docker build -t fullstack-frontend-v2:v1.0 -f apps/frontend-v2/Dockerfile apps/frontend-v2/

# Apply manifests
kubectl apply -f k8s/base/

# Check status
kubectl get deployments
kubectl get pods
kubectl get services
kubectl get ingress
kubectl get endpoints

# Debug pods
kubectl logs <pod-name>
kubectl describe pod <pod-name>
kubectl get pods --show-labels

# Restart deployments (after rebuilding images)
kubectl rollout restart deployment --all
kubectl rollout restart deployment <deployment-name>

# Delete and recreate (when selector changes)
kubectl delete deployment <deployment-name>
kubectl apply -f k8s/base/<deployment-file>.yaml

# Port forwarding
kubectl port-forward service/fullstack-frontend 8080:80
kubectl port-forward service/fullstack-backend 3001:3001

# Access via tunnel
minikube tunnel
```

## Current Architecture

```
                    ┌───────────────────────────────────────────────────────┐
                    │                  Minikube Cluster                     │
                    │                                                       │
┌──────────┐        │  ┌─────────────────────────────────────────────────┐ │
│  User    │───────►│  │            Ingress Controller (nginx)           │ │
│ Browser  │        │  └──────────────────────┬──────────────────────────┘ │
└──────────┘        │                         │                             │
                    │         ┌───────────────┼───────────────┐             │
                    │         │               │               │             │
                    │    127.0.0.1       127.0.0.1      v2.localhost        │
                    │      /api/*            /*             /*              │
                    │         │               │               │             │
                    │         ▼               ▼               ▼             │
                    │    ┌─────────┐    ┌──────────┐   ┌─────────────┐     │
                    │    │ Backend │    │ Frontend │   │ Frontend-v2 │     │
                    │    │ Service │    │ Service  │   │  Service    │     │
                    │    │  :3001  │    │   :80    │   │    :80      │     │
                    │    └────┬────┘    └────┬─────┘   └──────┬──────┘     │
                    │         │              │                │             │
                    │    ┌────┴────┐    ┌────┴─────┐   ┌──────┴──────┐     │
                    │    │ Pod Pod │    │ Pod  Pod │   │  Pod   Pod  │     │
                    │    │  (x2)   │    │   (x2)   │   │    (x2)     │     │
                    │    └────────��┘    └──────────┘   └─────────────┘     │
                    │                                                       │
                    └───────────────────────────────────────────────────────┘
```

## Routing Table

| Host          | Path     | Service               | Port |
| ------------- | -------- | --------------------- | ---- |
| `127.0.0.1`   | `/api/*` | fullstack-backend     | 3001 |
| `127.0.0.1`   | `/*`     | fullstack-frontend    | 80   |
| `v2.localhost`| `/api/*` | fullstack-backend     | 3001 |
| `v2.localhost`| `/*`     | fullstack-frontend-v2 | 80   |

## Troubleshooting Guide

### ErrImageNeverPull
- **Cause**: Image not found in Minikube's Docker
- **Fix**: Run `eval $(minikube docker-env)` then rebuild image

### Service has no endpoints
- **Cause**: Service selector doesn't match pod labels
- **Fix**: Check `kubectl get pods --show-labels` and ensure service selector matches

### Selector is immutable
- **Cause**: Trying to change deployment selector after creation
- **Fix**: Delete deployment and recreate: `kubectl delete deployment <name>`

### API calls failing in K8s
- **Cause**: Using `localhost` in nginx.conf instead of K8s service name
- **Fix**: Use `http://<service-name>:<port>` (e.g., `http://fullstack-backend:3001`)

### Frontend-v2 can't reach backend
- **Cause**: Missing `/api` route for the subdomain in ingress
- **Fix**: Add `/api` path to the host's ingress rules

## Next Steps (Optional)

- [ ] Add Kustomization for dev/prod overlays
- [ ] Add ConfigMaps for environment variables
- [ ] Add health checks (readinessProbe, livenessProbe)
- [ ] Add resource limits (CPU, memory)
- [ ] Push images to Docker Hub (production-like)
- [ ] Set up CI/CD pipeline
- [ ] Add Horizontal Pod Autoscaler (HPA)
