# API Reference Guide

Complete reference documentation for the AI on FHIR Backend API. This document provides detailed specifications for all endpoints, request/response formats, and integration examples.

## 📋 Base Information

### Base URL
```
http://127.0.0.1:5000/api
```

### Content Type
All API endpoints accept and return JSON data with Content-Type `application/json`.

### Authentication
The current implementation does not require authentication. This is suitable for demo and development environments.

### Rate Limiting
No rate limiting is currently implemented, but this can be configured for production deployments.

## 🔗 Endpoints Reference

### Health Check

Check the status and availability of the API service.

#### Request
```http
GET /api/health
```

#### Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.123456",
  "service": "AI on FHIR Backend",
  "version": "1.0.0"
}
```

#### Response Fields
- `status` (string): Service health status ('healthy', 'unhealthy')
- `timestamp` (string): ISO 8601 timestamp of the response
- `service` (string): Service name identifier
- `version` (string): Current API version

#### Status Codes
- `200`: Service is healthy and operational
- `503`: Service is experiencing issues

---

### Process Natural Language Query

Transform natural language healthcare queries into structured FHIR searches with complete entity extraction and synthetic data generation.

#### Request
```http
POST /api/query
Content-Type: application/json
```

```json
{
  "query": "Show me all diabetic patients over 50",
  "max_results": 10
}
```

#### Request Fields
- `query` (string, required): Natural language healthcare query
- `max_results` (integer, optional): Maximum number of results to return (default: 10, max: 1000)

#### Response
```json
{
  "success": true,
  "query": "Show me all diabetic patients over 50",
  "entities": {
    "action": "show",
    "demographics": {
      "gender": null
    },
    "age_filters": {
      "min_age": 50,
      "max_age": null
    },
    "time_filters": null,
    "conditions": [
      {
        "text": "diabetic",
        "normalized": "diabetes",
        "icd10": "E11.9",
        "snomed": "44054006",
        "umls": "C0011860",
        "confidence": 0.95,
        "category": "endocrine"
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
      },
      {
        "label": "NUMBER",
        "confidence": 0.8921,
        "text": "50",
        "start": 35,
        "end": 37
      }
    ]
  },
  "fhir_url": "Patient?birthdate=le1974-12-31&_has:Condition:patient:code=E11.9&_include=Patient:condition",
  "results": {
    "resourceType": "Bundle",
    "id": "search-results-uuid",
    "type": "searchset",
    "total": 45,
    "link": [
      {
        "relation": "self",
        "url": "Patient?birthdate=le1974-12-31&_has:Condition:patient:code=E11.9"
      }
    ],
    "entry": [
      {
        "resource": {
          "resourceType": "Patient",
          "id": "patient-uuid",
          "name": [
            {
              "use": "official",
              "family": "Smith",
              "given": ["John"]
            }
          ],
          "gender": "male",
          "birthDate": "1965-03-15",
          "address": [
            {
              "use": "home",
              "line": ["123 Main St"],
              "city": "Springfield",
              "state": "IL",
              "postalCode": "62701",
              "country": "US"
            }
          ]
        }
      }
    ]
  },
  "statistics": {
    "total_patients": 45,
    "avg_age": 62.3,
    "gender_distribution": {
      "male": 23,
      "female": 22
    },
    "condition_frequency": {
      "E11.9": 45
    },
    "age_ranges": {
      "50-59": 18,
      "60-69": 15,
      "70-79": 8,
      "80+": 4
    }
  },
  "processing_time": "2024-01-15T10:30:01.456789"
}
```

#### Response Fields

##### Main Response
- `success` (boolean): Whether the query was processed successfully
- `query` (string): Original query string
- `entities` (object): Extracted entities and FHIR parameters
- `fhir_url` (string): Generated FHIR search URL
- `results` (object): FHIR Bundle with patient data
- `statistics` (object): Summary statistics for the result set
- `processing_time` (string): ISO 8601 timestamp when processing completed

##### Entities Object
- `action` (string): Identified action type ('show', 'find', 'list', 'count')
- `demographics` (object): Demographic filters (gender, etc.)
- `age_filters` (object): Age-related constraints
- `time_filters` (object): Temporal constraints (dates, periods)
- `conditions` (array): Medical conditions with mappings
- `fhir_params` (object): Transformed FHIR search parameters
- `raw_biobert_entities` (array): Raw BioBERT entity extractions

##### Statistics Object
- `total_patients` (integer): Total number of matching patients
- `avg_age` (float): Average age of patients
- `gender_distribution` (object): Count by gender
- `condition_frequency` (object): Frequency of conditions by ICD-10 code
- `age_ranges` (object): Patient counts by age ranges

#### Status Codes
- `200`: Query processed successfully
- `400`: Invalid request (missing query, invalid parameters)
- `500`: Internal server error during processing

#### Example Queries
```bash
# Simple condition query
curl -X POST http://127.0.0.1:5000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me all diabetic patients"}'

# Complex demographic query
curl -X POST http://127.0.0.1:5000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Find female patients with hypertension under 65", "max_results": 25}'

# Temporal query
curl -X POST http://127.0.0.1:5000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "List patients diagnosed with diabetes in the last year"}'
```

---

### Get Example Queries

Retrieve pre-configured example queries that demonstrate system capabilities.

#### Request
```http
GET /api/examples
```

#### Response
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
        "age_filters": {"min_age": 50},
        "action": "show"
      },
      "complexity": "medium",
      "category": "demographic_condition"
    },
    {
      "query": "Find female patients with hypertension under 65",
      "description": "Find female patients with high blood pressure under 65",
      "use_case": "Cardiovascular care targeting",
      "expected_entities": {
        "demographics": {"gender": "female"},
        "conditions": ["hypertension"],
        "age_filters": {"max_age": 65}
      },
      "complexity": "medium",
      "category": "demographic_condition"
    }
  ]
}
```

#### Response Fields
- `success` (boolean): Operation success status
- `examples` (array): List of example query objects
  - `query` (string): Example query text
  - `description` (string): Human-readable description
  - `use_case` (string): Healthcare use case category
  - `expected_entities` (object): Expected NLP extraction results
  - `complexity` (string): Query complexity level ('simple', 'medium', 'complex')
  - `category` (string): Query category for organization

#### Status Codes
- `200`: Examples retrieved successfully
- `500`: Internal server error

---

### Get Patient Data

Retrieve patient data with optional filtering parameters using direct query parameters.

#### Request
```http
GET /api/patients?gender=female&min_age=50&condition=E11.9&limit=20
```

#### Query Parameters
- `gender` (string, optional): Filter by gender ('male', 'female')
- `min_age` (integer, optional): Minimum age filter
- `max_age` (integer, optional): Maximum age filter  
- `condition` (string, optional): ICD-10 condition code filter
- `limit` (integer, optional): Maximum results (default: 20, max: 1000)

#### Response
```json
{
  "success": true,
  "results": {
    "resourceType": "Bundle",
    "id": "patient-search-results",
    "type": "searchset",
    "total": 23,
    "entry": [
      {
        "resource": {
          "resourceType": "Patient",
          "id": "patient-1",
          "name": [{"use": "official", "family": "Johnson", "given": ["Mary"]}],
          "gender": "female",
          "birthDate": "1965-08-12"
        }
      }
    ]
  },
  "statistics": {
    "total_patients": 23,
    "avg_age": 58.7,
    "gender_distribution": {"female": 23},
    "condition_frequency": {"E11.9": 23}
  }
}
```

#### Status Codes
- `200`: Patients retrieved successfully
- `400`: Invalid query parameters
- `500`: Internal server error

---

### Get Available Conditions

Retrieve the complete list of available medical conditions with their standard healthcare code mappings.

#### Request
```http
GET /api/conditions
```

#### Response
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
      "is_synonym": false,
      "synonyms": ["diabetes mellitus", "DM", "diabetic condition"]
    },
    {
      "text": "hypertension",
      "code": "I10",
      "display": "Essential (primary) hypertension",
      "category": "cardiovascular",
      "snomed_code": "38341003",
      "umls_cui": "C0020538",
      "is_synonym": false,
      "synonyms": ["high blood pressure", "HTN", "arterial hypertension"]
    }
  ]
}
```

#### Response Fields
- `success` (boolean): Operation success status
- `conditions` (array): List of condition objects
  - `text` (string): Primary condition name
  - `code` (string): ICD-10 code
  - `display` (string): Official ICD-10 description
  - `category` (string): Medical specialty category
  - `snomed_code` (string): SNOMED-CT code
  - `umls_cui` (string): UMLS Concept Unique Identifier
  - `is_synonym` (boolean): Whether this is a synonym entry
  - `synonyms` (array): Alternative names for the condition

#### Status Codes
- `200`: Conditions retrieved successfully
- `500`: Internal server error

---

### Direct FHIR Search

Execute direct FHIR searches using structured parameters, bypassing NLP processing.

#### Request
```http
POST /api/fhir/search
Content-Type: application/json
```

```json
{
  "resource_type": "Patient",
  "search_params": {
    "gender": "female",
    "birthdate": "le1974-12-31",
    "_has:Condition:patient:code": "I10"
  },
  "include": ["Patient:condition"],
  "max_results": 15
}
```

#### Request Fields
- `resource_type` (string, required): FHIR resource type ('Patient', 'Condition', etc.)
- `search_params` (object, required): FHIR search parameters
- `include` (array, optional): FHIR include parameters for related resources
- `max_results` (integer, optional): Maximum results to return

#### Response
```json
{
  "success": true,
  "fhir_url": "Patient?gender=female&birthdate=le1974-12-31&_has:Condition:patient:code=I10&_include=Patient:condition",
  "results": {
    "resourceType": "Bundle",
    "id": "fhir-search-results",
    "type": "searchset",
    "total": 18,
    "entry": [...]
  },
  "statistics": {
    "total_patients": 18,
    "avg_age": 67.2,
    "gender_distribution": {"female": 18},
    "condition_frequency": {"I10": 18}
  }
}
```

#### Status Codes
- `200`: FHIR search completed successfully
- `400`: Invalid FHIR parameters
- `500`: Internal server error

## 🚫 Error Handling

### Error Response Format

All error responses follow a consistent format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "details": {
    "field": "Specific field that caused the error (if applicable)",
    "value": "Invalid value that was provided",
    "expected": "Description of expected format or value"
  },
  "timestamp": "2024-01-15T10:30:00.123456"
}
```

### Common Error Scenarios

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required field: query"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Endpoint not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error: BioBERT model initialization failed"
}
```

## 📊 FHIR Compliance

### Supported Resources

#### Patient Resource
- Complete demographic information
- Names, addresses, contact information
- Birth dates and gender
- Identifiers and extensions

#### Condition Resource
- ICD-10, SNOMED-CT, and UMLS coding
- Clinical status and verification status
- Onset dates and severity
- Evidence and notes

#### Bundle Resource
- Search result collections
- Pagination and total counts
- Include parameters for related resources
- Link relations for navigation

### FHIR Search Parameters

#### Patient Search Parameters
- `gender`: 'male' or 'female'
- `birthdate`: Date comparisons (eq, gt, lt, ge, le)
- `name`: Partial name matching
- `_has:Condition:patient:code`: Patients with specific conditions

#### Condition Search Parameters
- `code`: ICD-10, SNOMED-CT, or UMLS codes
- `patient`: Reference to patient resource
- `clinical-status`: 'active', 'resolved', etc.
- `verification-status`: 'confirmed', 'provisional', etc.

#### Bundle Parameters
- `_include`: Include related resources
- `_count`: Number of results per page
- `_sort`: Sort order for results

## 🔧 Integration Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Process natural language query
async function searchPatients(query, maxResults = 10) {
  try {
    const response = await apiClient.post('/query', {
      query: query,
      max_results: maxResults
    });
    
    return response.data;
  } catch (error) {
    console.error('Query failed:', error.response?.data || error.message);
    throw error;
  }
}

// Get available conditions for autocomplete
async function getConditions() {
  try {
    const response = await apiClient.get('/conditions');
    return response.data.conditions;
  } catch (error) {
    console.error('Failed to get conditions:', error);
    throw error;
  }
}

// Example usage
searchPatients('Show me all diabetic patients over 50')
  .then(results => {
    console.log(`Found ${results.statistics.total_patients} patients`);
    console.log('FHIR URL:', results.fhir_url);
  })
  .catch(error => {
    console.error('Search failed:', error);
  });
```

### Python

```python
import requests
import json

class AIFHIRClient:
    def __init__(self, base_url='http://127.0.0.1:5000/api'):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
    
    def query(self, query_text, max_results=10):
        """Process natural language query"""
        url = f'{self.base_url}/query'
        payload = {
            'query': query_text,
            'max_results': max_results
        }
        
        response = self.session.post(url, json=payload)
        response.raise_for_status()
        return response.json()
    
    def get_conditions(self):
        """Get available medical conditions"""
        url = f'{self.base_url}/conditions'
        response = self.session.get(url)
        response.raise_for_status()
        return response.json()['conditions']
    
    def health_check(self):
        """Check API health"""
        url = f'{self.base_url}/health'
        response = self.session.get(url)
        response.raise_for_status()
        return response.json()

# Example usage
client = AIFHIRClient()

try:
    # Check if API is healthy
    health = client.health_check()
    print(f"API Status: {health['status']}")
    
    # Process query
    results = client.query('Find female patients with hypertension under 65')
    print(f"Found {results['statistics']['total_patients']} patients")
    
    # Display extracted entities
    entities = results['entities']
    print(f"Detected conditions: {[c['text'] for c in entities['conditions']]}")
    print(f"Age filters: {entities['age_filters']}")
    
except requests.exceptions.RequestException as e:
    print(f"API request failed: {e}")
```

### cURL Examples

```bash
# Health check
curl -X GET http://127.0.0.1:5000/api/health

# Process natural language query
curl -X POST http://127.0.0.1:5000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Show me all diabetic patients over 50",
    "max_results": 20
  }'

# Get patient data with filters
curl -X GET "http://127.0.0.1:5000/api/patients?gender=female&min_age=50&limit=10"

# Get available conditions
curl -X GET http://127.0.0.1:5000/api/conditions

# Direct FHIR search
curl -X POST http://127.0.0.1:5000/api/fhir/search \
  -H "Content-Type: application/json" \
  -d '{
    "resource_type": "Patient",
    "search_params": {
      "gender": "female",
      "birthdate": "le1974-12-31"
    },
    "max_results": 15
  }'
```

## 📈 Performance Considerations

### Response Times
- Simple queries: < 500ms
- Complex queries with multiple conditions: < 1.5s
- Large result sets (100+ patients): < 3s

### Optimization Tips
1. **Limit Results**: Use appropriate `max_results` values
2. **Cache Responses**: Implement client-side caching for repeated queries
3. **Batch Operations**: Group related queries together
4. **Monitor Performance**: Track response times and error rates

### Rate Limiting (Production)
- Implement rate limiting: 100 requests per minute per IP
- Use authentication for higher limits
- Monitor and alert on unusual usage patterns

---

*Complete API reference for healthcare professionals and developers integrating with the AI on FHIR system.*
