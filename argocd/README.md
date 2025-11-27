# ArgoCD Configuration

This directory contains ArgoCD Application manifests for GitOps deployments.

## Files

- `fullstack-application.yaml` - Defines the ArgoCD Application that syncs `k8s/overlays/ecr` to the cluster

## Usage

Apply the application to your cluster:

```bash
kubectl apply -f argocd/fullstack-application.yaml
```

## How It Works

1. ArgoCD watches this repo's `k8s/overlays/ecr` directory
2. When changes are pushed to Git, ArgoCD auto-syncs to the cluster
3. Manual image tag updates in `k8s/overlays/ecr/kustomization.yaml` trigger deployments
