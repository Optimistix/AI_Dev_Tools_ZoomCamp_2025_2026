# Docker Deployment Guide

## Overview

The application is containerized using Docker with a multi-stage build that:
1. Builds the React frontend for production
2. Sets up the Node.js backend
3. Serves both from a single container on port 3001

## Base Image

**node:18-alpine** - Official Node.js 18 LTS on Alpine Linux

### Why Alpine?
- ✅ **Small** - Only ~5MB base (vs ~100MB for standard Node images)
- ✅ **Secure** - Minimal attack surface with fewer packages
- ✅ **Fast** - Quick downloads and deployments
- ✅ **Production-ready** - Industry standard for Node.js containers

## Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

Access at: **http://localhost:3001**

### Option 2: Docker Commands

```bash
# Build the image
docker build -t coding-interview-platform .

# Run the container
docker run -d \
  --name coding-interview \
  -p 3001:3001 \
  -e NODE_ENV=production \
  coding-interview-platform

# View logs
docker logs -f coding-interview

# Stop and remove
docker stop coding-interview
docker rm coding-interview
```

## Build Process

### Multi-Stage Build

The Dockerfile uses a multi-stage build for optimization:

#### Stage 1: Frontend Build
```dockerfile
FROM node:18-alpine AS frontend-build
# Install dependencies
# Build React app for production
# Output: /app/frontend/build
```

#### Stage 2: Production
```dockerfile
FROM node:18-alpine AS production
# Copy backend dependencies
# Copy built frontend from Stage 1
# Run unified server
```

### Build Size Optimization

**Before optimization:** ~800MB
**After optimization:** ~150MB

Techniques used:
- Multi-stage build (discards build dependencies)
- Alpine Linux base image
- `npm ci --only=production` (no dev dependencies)
- Static frontend serving (no separate web server)

## Container Architecture

```
┌─────────────────────────────────────────┐
│         Docker Container                │
│         (node:18-alpine)                │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   Node.js Server (Port 3001)     │ │
│  │   - API Routes (/api/*)          │ │
│  │   - WebSocket Server             │ │
│  │   - Static File Server           │ │
│  └───────────────────────────────────┘ │
│              │                          │
│              ├─ Serves API              │
│              ├─ Handles WebSockets      │
│              └─ Serves React Build      │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   Static Files                   │ │
│  │   (React Production Build)       │ │
│  │   /frontend/build/*              │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
         │
         └─ Port 3001 → Host
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `NODE_ENV` | `production` | Node environment |
| `BASE_URL` | `http://localhost:3001` | Base URL for session links |

### Custom Environment

```bash
docker run -d \
  -p 8080:8080 \
  -e PORT=8080 \
  -e BASE_URL=https://interview.example.com \
  coding-interview-platform
```

## Health Checks

The container includes a health check that:
- Runs every 30 seconds
- Checks `/health` endpoint
- Marks container unhealthy after 3 failed attempts
- Waits 10 seconds before first check

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' coding-interview

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' coding-interview
```

## Production Deployment

### Docker Hub

```bash
# Build with tag
docker build -t yourusername/coding-interview:latest .

# Push to Docker Hub
docker login
docker push yourusername/coding-interview:latest

# Pull and run on production server
docker pull yourusername/coding-interview:latest
docker run -d -p 3001:3001 yourusername/coding-interview:latest
```

### Cloud Platforms

#### AWS ECS/Fargate

```bash
# Authenticate with ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag coding-interview-platform:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/coding-interview:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/coding-interview:latest

# Deploy via ECS task definition
```

#### Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT-ID/coding-interview

# Deploy
gcloud run deploy coding-interview \
  --image gcr.io/PROJECT-ID/coding-interview \
  --platform managed \
  --port 3001
```

#### Azure Container Instances

```bash
# Build and push to ACR
az acr build --registry myregistry --image coding-interview:latest .

# Deploy
az container create \
  --resource-group myResourceGroup \
  --name coding-interview \
  --image myregistry.azurecr.io/coding-interview:latest \
  --ports 3001
```

#### Heroku

```bash
# Login to Heroku Container Registry
heroku container:login

# Build and push
heroku container:push web -a your-app-name

# Release
heroku container:release web -a your-app-name
```

## Kubernetes Deployment

### deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: coding-interview
spec:
  replicas: 3
  selector:
    matchLabels:
      app: coding-interview
  template:
    metadata:
      labels:
        app: coding-interview
    spec:
      containers:
      - name: coding-interview
        image: coding-interview-platform:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3001"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: coding-interview-service
spec:
  selector:
    app: coding-interview
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3001
  type: LoadBalancer
```

## Monitoring & Logs

### View Logs

```bash
# Docker
docker logs -f coding-interview

# Docker Compose
docker-compose logs -f

# Kubernetes
kubectl logs -f deployment/coding-interview
```

### Metrics

```bash
# Container stats
docker stats coding-interview

# Health status
curl http://localhost:3001/health
```

## Troubleshooting

### Container won't start

**Check logs:**
```bash
docker logs coding-interview
```

**Common issues:**
- Port 3001 already in use
- Missing environment variables
- Build failed

**Solution:**
```bash
# Use different port
docker run -p 8080:3001 coding-interview-platform

# Check port usage
lsof -i :3001
netstat -an | grep 3001
```

### WebSocket connection fails

**Issue:** WebSocket connects to wrong URL

**Solution:** Set `BASE_URL` environment variable
```bash
docker run -e BASE_URL=https://your-domain.com -p 3001:3001 coding-interview-platform
```

### Frontend not loading

**Check if build succeeded:**
```bash
docker exec coding-interview ls -la /app/frontend/build
```

**Rebuild:**
```bash
docker build --no-cache -t coding-interview-platform .
```

### High memory usage

**Monitor:**
```bash
docker stats coding-interview
```

**Set memory limits:**
```bash
docker run -m 512m coding-interview-platform
```

## Security Best Practices

### 1. Run as non-root user

Add to Dockerfile:
```dockerfile
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs
```

### 2. Scan for vulnerabilities

```bash
# Using Docker Scout
docker scout cves coding-interview-platform

# Using Trivy
trivy image coding-interview-platform
```

### 3. Use specific versions

```dockerfile
FROM node:18.19.0-alpine3.19
```

### 4. Keep images updated

```bash
# Rebuild regularly
docker build --pull -t coding-interview-platform .
```

## Performance Optimization

### Build Cache

```bash
# Use BuildKit for better caching
DOCKER_BUILDKIT=1 docker build -t coding-interview-platform .
```

### Layer Optimization

Order of operations in Dockerfile (most stable to most changing):
1. Install system dependencies
2. Copy package files
3. Install Node modules
4. Copy source code
5. Build application

## Backup & Restore

### Export Image

```bash
# Save image
docker save coding-interview-platform > coding-interview.tar

# Load image
docker load < coding-interview.tar
```

### Session Data

Sessions are stored in-memory. For persistence, consider:
- Redis for session storage
- Volume mounts for data persistence

## Next Steps

- [ ] Add Redis for session persistence
- [ ] Implement horizontal scaling
- [ ] Add Nginx reverse proxy
- [ ] Set up CI/CD pipeline
- [ ] Configure SSL/TLS
- [ ] Add monitoring (Prometheus/Grafana)
- [ ] Implement log aggregation

## Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js Docker Guide](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Alpine Linux](https://alpinelinux.org/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
