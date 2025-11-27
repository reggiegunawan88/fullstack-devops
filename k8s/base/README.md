# Kubernetes Base Manifests

Core Kubernetes resources shared across all environments.

## Files

| File | Description |
|------|-------------|
| `fullstack-backend-deployment.yaml` | Backend API deployment (2 replicas) |
| `fullstack-backend-service.yaml` | Backend ClusterIP service (port 3001) |
| `fullstack-frontend-deployment.yaml` | Frontend deployment (2 replicas) |
| `fullstack-frontend-service.yaml` | Frontend ClusterIP service (port 80) |
| `fullstack-frontend-v2-deployment.yaml` | Frontend v2 deployment (2 replicas) |
| `fullstack-frontend-v2-service.yaml` | Frontend v2 ClusterIP service (port 80) |
| `ingress.yaml` | NGINX ingress routing rules |
| `kustomization.yaml` | Kustomize resource list |

## Usage

These manifests are not applied directly. Use overlays instead:

```bash
# Local development
kubectl apply -k k8s/overlays/local

# ECR deployment
kubectl apply -k k8s/overlays/ecr
```

## Adding New Resources

1. Create the manifest in this directory
2. Add it to `kustomization.yaml` under `resources:`
