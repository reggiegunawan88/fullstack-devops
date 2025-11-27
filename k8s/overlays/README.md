# Kustomize Overlays

Environment-specific configurations that build on top of `k8s/base/`.

## Overlays

| Directory | Purpose | Image Source |
|-----------|---------|--------------|
| `local/` | Local minikube development | Local Docker images |
| `ecr/` | AWS ECR deployment | Amazon ECR registry |

## Usage

```bash
# Preview generated manifests
kubectl kustomize k8s/overlays/ecr

# Apply to cluster
kubectl apply -k k8s/overlays/ecr
```

## Updating Image Tags (ECR)

After CI pushes new images to ECR, manually update tags in `ecr/kustomization.yaml`:

```yaml
images:
  - name: fullstack-backend:v1.0
    newName: 355446107250.dkr.ecr.us-east-1.amazonaws.com/fullstack-devops/backend
    newTag: master-4  # ← Update this
```

Commit and push — ArgoCD will auto-sync the changes.
