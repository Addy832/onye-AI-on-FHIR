# AI on FHIR Backend API

The backend API server for the AI on FHIR healthcare data querying system. Built with Flask and powered by BioBERT for advanced biomedical natural language processing.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Flask API     │    │  NLP Processor  │    │ FHIR Simulator  │
│                 │    │                 │    │                 │
│ - Route Handlers│────┤ - BioBERT Model │────┤ - Data Generation│
│ - CORS Support  │    │ - Medical Onto. │    │ - FHIR Bundles  │
│ - Error Handling│    │ - Entity Extract│    │ - Statistics    │
│ - Input Valid.  │    │ - Query Parsing │    │ - URL Generation│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- pip package manager
- 4GB+ RAM (for BioBERT model)

### Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the server:**
   ```bash
   python app.py
   ```

The server will start at `http://127.0.0.1:5000` with development mode enabled.

### Production Deployment

For production, use Gunicorn:

```bash
gunicorn -w 4 -b 0.0.0.0:5000 --timeout 120 app:app
```

## 📋 API Documentation

### Base URL

```
http://127.0.0.1:5000/api
```

### Endpoints

#### Health Check

**GET** `/api/health`

Returns the current status of the API server.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.123456",
  "service": "AI on FHIR Backend",
  "version": "1.0.0"
}
```

#### Process Natural Language Query

**POST** `/api/query`

Processes natural language healthcare queries and returns structured FHIR data.

**Request Body:**
```json
{
  "query": "Show me all diabetic patients over 50",
  "max_results": 10
}
```

**Response:**
```json
{
  "success": true,
  "query": "Show me all diabetic patients over 50",
  "entities": {
    "action": "show",
    "demographics": {"gender": null},
    "age_filters": {"min_age": 50},
    "conditions": [
      {
        "text": "diabetic",
        "icd10": "E11.9",
        "snomed": "44054006",
        "confidence": 0.95
      }
    ],
    "fhir_params": {
      "resource_type": "Patient",
      "search_params": {
        "birthdate": "le1974-12-31",
        "_has:Condition:patient:code": "E11.9"
      },
      "include": ["Patient:condition"]
    },
    "raw_biobert_entities": [
      {
        "label": "CONDITION",
        "confidence": 0.9543,
        "text": "diabetic",
        "start": 15,
        "end": 23
      }
    ]
  },
  "fhir_url": "Patient?birthdate=le1974-12-31&_has:Condition:patient:code=E11.9&_include=Patient:condition",
  "results": {
    "resourceType": "Bundle",
    "id": "search-results",
    "type": "searchset",
    "total": 45,
    "entry": [...]
  },
  "statistics": {
    "total_patients": 45,
    "avg_age": 62.3,
    "gender_distribution": {"male": 23, "female": 22},
    "condition_frequency": {"E11.9": 45}
  },
  "processing_time": "2024-01-15T10:30:01.456789"
}
```

#### Get Example Queries

**GET** `/api/examples`

Returns a list of example queries with descriptions and expected outcomes.

**Response:**
```json
{
  "success": true,
  "examples": [
    {
      "query": "Show me all diabetic patients over 50",
      "description": "Search for patients with diabetes over age 50",
      "use_case": "Population health management",
      "expected_entities": {
        "conditions": ["diabetes"],
        "age_filters": {"min_age": 50}
      }
    }
  ]
}
```

#### Get Patient Data

**GET** `/api/patients`

Retrieve patient data with optional filtering parameters.

**Query Parameters:**
- `gender`: male/female
- `min_age`: minimum age
- `max_age`: maximum age
- `condition`: ICD-10 condition code
- `limit`: maximum results (default: 20)

**Example:**
```
GET /api/patients?gender=female&min_age=50&condition=E11.9&limit=20
```

#### Get Available Conditions

**GET** `/api/conditions`

Returns available medical conditions with their mappings to standard healthcare coding systems.

**Response:**
```json
{
  "success": true,
  "conditions": [
    {
      "text": "diabetes",
      "code": "E11.9",
      "display": "Type 2 diabetes mellitus without complications",
      "category": "endocrine",
      "snomed_code": "44054006",
      "umls_cui": "C0011860",
      "is_synonym": false
    }
  ]
}
```

#### Direct FHIR Search

**POST** `/api/fhir/search`

Accepts direct FHIR parameters for advanced queries.

**Request Body:**
```json
{
  "resource_type": "Patient",
  "search_params": {
    "gender": "female",
    "birthdate": "le1974-12-31"
  },
  "include": ["Patient:condition"],
  "max_results": 10
}
```

## 🧠 NLP Processing

### BioBERT Integration

The system uses BioBERT (Bidirectional Encoder Representations from Transformers for Biomedical Text Mining) for processing healthcare queries.

**Key Features:**
- Biomedical entity recognition
- Medical condition extraction
- Demographic information parsing
- Temporal constraint identification
- Confidence scoring for all entities

### Medical Ontology

The backend includes a comprehensive medical ontology with:

- **1000+ Medical Concepts**: Common healthcare conditions and symptoms
- **Multi-Standard Mappings**: ICD-10, SNOMED-CT, and UMLS codes
- **Synonym Recognition**: Alternative medical terminology
- **Category Organization**: Conditions grouped by medical specialty

### Entity Extraction Process

1. **Query Analysis**: Parse natural language input
2. **Entity Recognition**: Identify medical concepts using BioBERT
3. **Confidence Scoring**: Assign confidence levels to extracted entities
4. **Parameter Mapping**: Convert entities to FHIR search parameters
5. **Validation**: Ensure parameters are valid and consistent

## 🔧 Core Components

### app.py
Main Flask application with route handlers and error management.

### nlp_processor.py
BioBERT-powered NLP processing engine for medical query analysis.

### fhir_simulator.py
FHIR-compliant data generation and simulation system.

### medical_ontology_manager.py
Medical concept management with multi-standard code mappings.

## 📊 Data Generation

The FHIR simulator generates realistic synthetic healthcare data:

### Patient Resources
- Demographics (name, gender, birth date)
- Contact information
- Identifiers and IDs
- Addresses and phone numbers

### Condition Resources
- Medical conditions with proper ICD-10 coding
- Onset dates and clinical status
- Severity and category information
- Evidence and verification status

### Bundle Structure
- FHIR R4 compliant Bundle resources
- Search result metadata
- Include parameters for related resources
- Total count and pagination support

## 🧪 Testing

### Unit Tests
```bash
python -m pytest tests/
```

### API Testing
```bash
python test_actual_api.py
python test_biobert_raw.py
python test_biobert_system.py
```

### Manual Testing
```bash
# Test health endpoint
curl http://127.0.0.1:5000/api/health

# Test query processing
curl -X POST http://127.0.0.1:5000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me all diabetic patients over 50"}'
```

## 🔒 Security Features

### Input Validation
- JSON schema validation
- Query length limits
- Parameter type checking
- SQL injection prevention

### CORS Configuration
- Controlled cross-origin access
- Configurable allowed origins
- Method and header restrictions

### Error Handling
- Comprehensive error logging
- Safe error messages for clients
- Stack trace protection in production

## 📈 Performance

### Optimization Features
- BioBERT model caching
- Medical ontology pre-loading
- Efficient FHIR data generation
- Response compression

### Monitoring
- Request/response timing
- Error rate tracking
- Memory usage monitoring
- Model performance metrics

## 🔧 Configuration

### Environment Variables

```bash
# Server Configuration
FLASK_ENV=development
FLASK_PORT=5000
FLASK_HOST=127.0.0.1

# Logging
LOG_LEVEL=INFO

# NLP Configuration
BIOBERT_MODEL_PATH=default
MEDICAL_ONTOLOGY_PATH=sample_medical_concepts.csv

# FHIR Configuration
FHIR_BASE_URL=http://hapi.fhir.org/baseR4
MAX_RESULTS_DEFAULT=10
MAX_RESULTS_LIMIT=1000
```

### Deployment Configuration

For production deployment:

1. **Set environment to production:**
   ```bash
   export FLASK_ENV=production
   ```

2. **Configure logging:**
   ```bash
   export LOG_LEVEL=WARNING
   ```

3. **Use production WSGI server:**
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 --timeout 120 app:app
   ```

## 📦 Dependencies

### Core Dependencies
- **Flask 2.3.3**: Web framework
- **Flask-CORS 4.0.0**: Cross-origin resource sharing
- **transformers 4.35.0**: BioBERT model support
- **torch 2.1.0**: PyTorch for ML operations
- **spacy 3.6.1**: Additional NLP processing

### Optional Dependencies
- **gunicorn 21.2.0**: Production WSGI server
- **pytest 7.4.0**: Testing framework
- **structlog 23.2.0**: Enhanced logging
- **prometheus-client 0.19.0**: Metrics collection

## 🐛 Troubleshooting

### Common Issues

1. **BioBERT model download fails:**
   ```bash
   # Clear transformers cache and retry
   rm -rf ~/.cache/huggingface/transformers/
   python -c "from transformers import AutoTokenizer, AutoModel; AutoTokenizer.from_pretrained('dmis-lab/biobert-base-cased-v1.1'); AutoModel.from_pretrained('dmis-lab/biobert-base-cased-v1.1')"
   ```

2. **Memory issues with large queries:**
   - Increase system memory or reduce max_results
   - Enable model quantization for memory efficiency

3. **Slow response times:**
   - Check BioBERT model is cached
   - Verify medical ontology loading
   - Monitor system resources

### Debug Mode

Enable debug logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🚀 Deployment

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

### Cloud Deployment

The backend is ready for deployment on:
- AWS Elastic Beanstalk
- Google Cloud Run
- Azure App Service
- Heroku
- DigitalOcean App Platform

## 📝 API Status Codes

- **200**: Success
- **400**: Bad Request (invalid input)
- **404**: Endpoint not found
- **500**: Internal server error

## 🤝 Contributing

1. Follow PEP 8 Python style guide
2. Add comprehensive tests for new features
3. Update API documentation for changes
4. Include performance considerations
5. Test with various query types

---

*Backend API designed for high-performance healthcare data processing with comprehensive FHIR compliance.*
