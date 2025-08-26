# AI on FHIR Backend - Local Development

## Quick Start

### Windows
Simply double-click `start.bat` or run:
```cmd
start.bat
```

### Mac/Linux/WSL
Make the script executable and run:
```bash
chmod +x start.sh
./start.sh
```

### Manual Setup
1. Install Python 3.8+ 
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the server:
   ```bash
   python app.py
   ```

## Access the API

- **Server**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **API Endpoints**:
  - `POST /api/query` - Process natural language healthcare queries
  - `GET /api/examples` - Get example queries
  - `GET /api/patients` - Get patient data with filters
  - `GET /api/conditions` - Get available medical conditions
  - `POST /api/fhir/search` - Direct FHIR search

## Features

✅ **BioBERT NLP Processing** - Advanced medical entity extraction  
✅ **FHIR Simulation** - Realistic healthcare data generation  
✅ **Natural Language Queries** - "Show me diabetic patients over 50"  
✅ **Medical Ontology** - ICD-10, SNOMED-CT, UMLS codes  
✅ **CORS Enabled** - Ready for frontend integration  

## Example Query

```bash
curl -X POST http://localhost:5000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me all diabetic patients over 50", "max_results": 10}'
```

## Note

The first startup may take a few minutes while BioBERT models are downloaded and initialized.
