# Deployment Guide

Comprehensive guide for deploying the AI on FHIR Healthcare Data Querying System across different environments, from development to production.

## 🏗️ Deployment Overview

The AI on FHIR system consists of two main components:
- **Backend API**: Python Flask application with BioBERT NLP processing
- **Frontend Web App**: Next.js React application with modern UI

### System Requirements

#### Minimum Requirements
- **CPU**: 2 cores, 2.4 GHz
- **RAM**: 8 GB (4 GB for BioBERT model)
- **Storage**: 10 GB available space
- **Network**: Stable internet connection for model downloads

#### Recommended Requirements (Production)
- **CPU**: 4+ cores, 3.0 GHz
- **RAM**: 16+ GB
- **Storage**: 50+ GB SSD
- **Network**: High-bandwidth connection
- **Load Balancer**: For multiple instances
- **Monitoring**: Application and infrastructure monitoring

## 🚀 Development Deployment

### Local Development Setup

#### Prerequisites
```bash
# System requirements
- Python 3.8+
- Node.js 18.x+
- npm 8.x+
- Git

# Optional but recommended
- Docker and Docker Compose
- VS Code or preferred IDE
```

#### Backend Development Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set environment variables:**
   ```bash
   # Windows
   set FLASK_ENV=development
   set FLASK_DEBUG=true
   set LOG_LEVEL=DEBUG

   # macOS/Linux
   export FLASK_ENV=development
   export FLASK_DEBUG=true
   export LOG_LEVEL=DEBUG
   ```

5. **Start development server:**
   ```bash
   python app.py
   ```

The backend will be available at `http://127.0.0.1:5000`

#### Frontend Development Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   # Create .env.local
   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000/api
   NEXT_PUBLIC_API_TIMEOUT=10000
   NEXT_PUBLIC_DEBUG_MODE=true
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

### Docker Development Setup

#### Docker Compose for Development

Create `docker-compose.dev.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "5000:5000"
    volumes:
      - ./backend:/app
      - /app/__pycache__
    environment:
      - FLASK_ENV=development
      - FLASK_DEBUG=true
      - LOG_LEVEL=DEBUG
    command: python app.py

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://backend:5000/api
    command: npm run dev
    depends_on:
      - backend
```

#### Backend Development Dockerfile

Create `backend/Dockerfile.dev`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
```

#### Frontend Development Dockerfile

Create `frontend/Dockerfile.dev`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

#### Start Development Environment

```bash
docker-compose -f docker-compose.dev.yml up --build
```

## 🏭 Production Deployment

### Production Environment Setup

#### Environment Variables

Create production environment files:

**Backend `.env.prod`:**
```bash
FLASK_ENV=production
FLASK_DEBUG=false
LOG_LEVEL=WARNING

# Security
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=https://yourdomain.com

# Performance
WORKERS=4
TIMEOUT=120
KEEPALIVE=2

# Monitoring
SENTRY_DSN=your-sentry-dsn
PROMETHEUS_ENABLED=true
```

**Frontend `.env.production`:**
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_SENTRY_DSN=your-frontend-sentry-dsn
```

### Docker Production Setup

#### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - WORKERS=4
    volumes:
      - backend_data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

volumes:
  backend_data:
```

#### Production Backend Dockerfile

Create `backend/Dockerfile.prod`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd --create-home --shell /bin/bash app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy application code
COPY . .
RUN chown -R app:app /app

USER app

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "app:app"]
```

#### Production Frontend Dockerfile

Create `frontend/Dockerfile.prod`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

### Nginx Configuration

Create `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:5000;
    }

    upstream frontend {
        server frontend:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
    limit_req_zone $binary_remote_addr zone=web:10m rate=200r/m;

    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000";

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # Frontend routes
        location / {
            limit_req zone=web burst=50 nodelay;
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health checks
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

## ☁️ Cloud Deployment

### AWS Deployment

#### EC2 Deployment

**Launch EC2 Instance:**

1. Choose Ubuntu 20.04 LTS AMI
2. Instance type: t3.medium (minimum) or t3.large (recommended)
3. Configure security groups:
   - SSH (22): Your IP
   - HTTP (80): Anywhere
   - HTTPS (443): Anywhere
   - Custom (5000): Anywhere (for API)

**Setup Script:**

```bash
#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone repository
git clone <your-repository-url> ai-on-fhir
cd ai-on-fhir

# Setup SSL certificates (Let's Encrypt)
sudo apt install certbot -y
sudo certbot certonly --standalone -d yourdomain.com

# Copy SSL certificates
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Setup auto-renewal for SSL
echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f /home/ubuntu/ai-on-fhir/docker-compose.prod.yml restart nginx" | sudo crontab -
```

#### ECS Deployment

**Task Definition JSON:**

```json
{
  "family": "ai-on-fhir",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "4096",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "your-ecr-repo/ai-fhir-backend:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "FLASK_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/ai-on-fhir",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "backend"
        }
      }
    },
    {
      "name": "frontend",
      "image": "your-ecr-repo/ai-fhir-frontend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "dependsOn": [
        {
          "containerName": "backend",
          "condition": "HEALTHY"
        }
      ]
    }
  ]
}
```

### Google Cloud Platform

#### Cloud Run Deployment

**Backend deployment:**

```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/ai-fhir-backend ./backend

# Deploy to Cloud Run
gcloud run deploy ai-fhir-backend \
  --image gcr.io/PROJECT_ID/ai-fhir-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 4Gi \
  --cpu 2 \
  --timeout 300 \
  --set-env-vars FLASK_ENV=production
```

**Frontend deployment:**

```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/ai-fhir-frontend ./frontend

# Deploy to Cloud Run
gcloud run deploy ai-fhir-frontend \
  --image gcr.io/PROJECT_ID/ai-fhir-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --set-env-vars NODE_ENV=production
```

### Azure Deployment

#### Container Instances

**Backend deployment:**

```bash
# Create resource group
az group create --name ai-fhir-rg --location eastus

# Deploy backend container
az container create \
  --resource-group ai-fhir-rg \
  --name ai-fhir-backend \
  --image your-registry/ai-fhir-backend:latest \
  --cpu 2 \
  --memory 8 \
  --ports 5000 \
  --environment-variables FLASK_ENV=production \
  --dns-name-label ai-fhir-api
```

**Frontend deployment:**

```bash
# Deploy frontend container
az container create \
  --resource-group ai-fhir-rg \
  --name ai-fhir-frontend \
  --image your-registry/ai-fhir-frontend:latest \
  --cpu 1 \
  --memory 2 \
  --ports 3000 \
  --environment-variables NODE_ENV=production \
  --dns-name-label ai-fhir-web
```

### Heroku Deployment

#### Backend Deployment

1. **Create Heroku app:**
   ```bash
   heroku create ai-fhir-backend
   ```

2. **Add buildpacks:**
   ```bash
   heroku buildpacks:add heroku/python -a ai-fhir-backend
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set FLASK_ENV=production -a ai-fhir-backend
   heroku config:set WEB_CONCURRENCY=4 -a ai-fhir-backend
   ```

4. **Create Procfile:**
   ```
   web: gunicorn --bind 0.0.0.0:$PORT --workers $WEB_CONCURRENCY --timeout 120 app:app
   ```

5. **Deploy:**
   ```bash
   git subtree push --prefix backend heroku-backend main
   ```

#### Frontend Deployment

1. **Create Vercel deployment:**
   ```bash
   npm install -g vercel
   cd frontend
   vercel --prod
   ```

2. **Configure environment variables in Vercel dashboard:**
   - `NEXT_PUBLIC_API_BASE_URL`: Your Heroku backend URL
   - `NODE_ENV`: production

## 📊 Monitoring and Logging

### Application Monitoring

#### Health Check Endpoints

**Backend health check:**
```bash
curl http://your-backend-url/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.123456",
  "service": "AI on FHIR Backend",
  "version": "1.0.0"
}
```

#### Prometheus Metrics

Add to `backend/requirements.txt`:
```
prometheus-client==0.19.0
```

Configure metrics in `app.py`:
```python
from prometheus_client import Counter, Histogram, generate_latest
import time

REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')

@app.before_request
def before_request():
    request.start_time = time.time()

@app.after_request
def after_request(response):
    REQUEST_COUNT.labels(method=request.method, endpoint=request.endpoint).inc()
    REQUEST_DURATION.observe(time.time() - request.start_time)
    return response

@app.route('/metrics')
def metrics():
    return generate_latest()
```

### Log Aggregation

#### Structured Logging

Install structured logging:
```bash
pip install structlog==23.2.0
```

Configure in `app.py`:
```python
import structlog
import logging

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="ISO"),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer()
    ],
    wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
    logger_factory=structlog.WriteLoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()
```

#### Centralized Logging with ELK Stack

**Docker Compose addition:**

```yaml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    volumes:
      - ./logstash/logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

## 🔒 Security Considerations

### SSL/TLS Configuration

#### Let's Encrypt SSL Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Security Headers

Configure in Nginx:

```nginx
# Security headers
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### Environment Variable Management

#### Using Docker Secrets

```yaml
services:
  backend:
    image: ai-fhir-backend
    secrets:
      - flask_secret_key
      - database_password
    environment:
      - FLASK_SECRET_KEY_FILE=/run/secrets/flask_secret_key

secrets:
  flask_secret_key:
    file: ./secrets/flask_secret_key.txt
  database_password:
    file: ./secrets/db_password.txt
```

## 🚨 Troubleshooting

### Common Deployment Issues

#### Backend Issues

**BioBERT Model Download Failures:**
```bash
# Clear cache and retry
rm -rf ~/.cache/huggingface/transformers/
docker system prune -f
docker-compose up --build backend
```

**Memory Issues:**
```bash
# Increase container memory limits
docker run --memory="4g" ai-fhir-backend
```

**Port Binding Issues:**
```bash
# Check for conflicting processes
sudo lsof -i :5000
sudo kill -9 <PID>
```

#### Frontend Issues

**Build Failures:**
```bash
# Clear Next.js cache
rm -rf frontend/.next
rm -rf frontend/node_modules
cd frontend && npm install && npm run build
```

**API Connection Issues:**
```bash
# Check environment variables
echo $NEXT_PUBLIC_API_BASE_URL
# Verify backend connectivity
curl -f http://backend:5000/api/health
```

### Performance Optimization

#### Backend Optimization

1. **Enable Gunicorn workers:**
   ```bash
   gunicorn --workers 4 --worker-class gevent --worker-connections 1000 app:app
   ```

2. **BioBERT Model Caching:**
   ```python
   # Preload model on startup
   @app.before_first_request
   def load_model():
       nlp_processor.initialize()
   ```

3. **Response Caching:**
   ```python
   from flask_caching import Cache
   
   cache = Cache(app, config={'CACHE_TYPE': 'simple'})
   
   @app.route('/api/conditions')
   @cache.cached(timeout=3600)  # Cache for 1 hour
   def get_conditions():
       # Implementation
   ```

#### Frontend Optimization

1. **Enable Next.js optimizations:**
   ```javascript
   // next.config.js
   module.exports = {
     experimental: {
       optimizeCss: true,
       optimizeImages: true,
     },
     compress: true,
   }
   ```

2. **Implement service worker caching:**
   ```javascript
   // pages/_app.js
   useEffect(() => {
     if ('serviceWorker' in navigator) {
       navigator.serviceWorker.register('/sw.js');
     }
   }, []);
   ```

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] SSL certificates obtained and configured
- [ ] Health checks implemented and tested
- [ ] Security headers configured
- [ ] Resource limits set appropriately
- [ ] Logging and monitoring configured
- [ ] Backup strategy implemented
- [ ] Load testing completed

### Post-Deployment

- [ ] Health checks passing
- [ ] SSL certificates valid and auto-renewing
- [ ] Monitoring dashboards accessible
- [ ] Log aggregation working
- [ ] Performance metrics within acceptable ranges
- [ ] Security scan completed
- [ ] Documentation updated
- [ ] Team trained on deployment process

---

*Comprehensive deployment guide covering development, staging, and production environments for the AI on FHIR healthcare data querying system.*
