# Kubernetes

Kubernetes manifests are intentionally deferred.

## Current Decision

The repository does not include Kubernetes manifests because the target runtime platform, ingress controller, secret manager, certificate strategy, registry, and scaling policy are not defined.

Adding generic manifests now would create a misleading production claim and would still require substantial human infrastructure decisions.

## What Would Be Needed Later

If Kubernetes becomes the selected deployment target, the platform design should define:

- Container image registry.
- Namespace strategy.
- Deployment and rollout policy.
- Service and ingress configuration.
- TLS certificate management.
- Secret management.
- ConfigMap strategy.
- PostgreSQL connectivity.
- Readiness and liveness probes.
- Horizontal scaling rules.
- Resource requests and limits.
- Network policies.
- Observability integration.
- Backup and restore process.

## Current Repository Readiness

The repository now includes the local building blocks Kubernetes would need later:

- Application Dockerfile.
- `/live` endpoint.
- `/ready` endpoint.
- Graceful shutdown handling.
- Production-oriented environment validation.

No Kubernetes resources are required to run the current local or CI workflows.
