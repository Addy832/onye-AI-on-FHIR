# AI on FHIR Backend Deployment

## Google Cloud Run Deployment (Recommended for ML Apps)

### Prerequisites
1. Install Google Cloud CLI: https://cloud.google.com/sdk/docs/install
2. Create a Google Cloud Project
3. Enable Cloud Run API

### Deployment Steps

1. **Login to Google Cloud:**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Deploy from this directory:**
   ```bash
   cd backend
   gcloud run deploy ai-fhir-backend \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --memory 4Gi \
     --cpu 2 \
     --timeout 300
   ```

3. **Alternative: Deploy with app.yaml:**
   ```bash
   gcloud run deploy ai-fhir-backend --source . --config app.yaml
   ```

### Why Google Cloud Run?
- ✅ Handles ML dependencies compilation properly
- ✅ Generous memory (4GB) for BioBERT models
- ✅ Auto-scaling from 0 to 10 instances
- ✅ Built-in HTTPS and custom domains
- ✅ Pay only for actual usage

### Alternative: Railway Deployment

1. Create account at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Select the backend folder as the root directory
4. Railway will automatically detect:
   - Python runtime from `runtime.txt`
   - Dependencies from `requirements.txt`  
   - Start command from `Procfile`

## Health Check

After deployment, test the health endpoint:
```bash
curl https://your-app-url.railway.app/api/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "service": "AI on FHIR Backend",
  "version": "1.0.0"
}
```
