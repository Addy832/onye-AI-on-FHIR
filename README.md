# AI on FHIR Healthcare Data Querying System

A comprehensive healthcare data querying system that uses advanced Natural Language Processing (NLP) and BioBERT models to transform natural language queries into structured FHIR-compliant healthcare data searches.

## 🏥 Overview

This system bridges the gap between healthcare professionals and complex healthcare data by providing an intuitive natural language interface for querying patient information. It combines state-of-the-art NLP processing with FHIR (Fast Healthcare Interoperability Resources) standards to create a powerful healthcare data analytics platform.

### Key Features

- **Natural Language Query Processing**: Transform plain English queries into structured healthcare data searches
- **BioBERT Integration**: Advanced biomedical language model for precise medical entity extraction
- **FHIR Compliance**: Full adherence to FHIR R4 standards for healthcare interoperability
- **Real-time Analytics**: Interactive dashboards with patient statistics and visualizations
- **Raw Entity Display**: Detailed view of BioBERT entity extraction results for transparency
- **Responsive Web Interface**: Modern React-based frontend with Tailwind CSS styling
- **RESTful API**: Comprehensive backend API for healthcare data operations

### Use Cases

- **Population Health Management**: Query patient cohorts by demographics and conditions
- **Clinical Research**: Identify patients matching specific criteria for studies
- **Care Coordination**: Find patients requiring specific interventions or follow-ups
- **Quality Reporting**: Generate reports on patient populations and outcomes
- **Clinical Decision Support**: Access relevant patient data through natural language

## 🏗️ Architecture

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│    Frontend         │    │    Backend API      │    │   FHIR Simulator    │
│  (Next.js/React)   │◄──►│   (Flask/Python)    │◄──►│   (Synthetic Data)  │
│                     │    │                     │    │                     │
│ - React Components  │    │ - BioBERT NLP       │    │ - FHIR R4 Bundle    │
│ - Tailwind CSS      │    │ - Medical Ontology  │    │ - Patient Resources │
│ - Chart.js          │    │ - Query Processing  │    │ - Condition Mapping │
│ - Lucide Icons      │    │ - Entity Extraction │    │ - Statistics        │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

### Components

1. **Frontend Application** (`/frontend`)
   - Next.js 13.5.4 with React 18.2.0
   - Tailwind CSS for modern, responsive design
   - Interactive data visualization with Chart.js
   - Real-time query processing and results display

2. **Backend API Server** (`/backend`)
   - Flask 2.3.3 REST API with CORS support
   - BioBERT and Transformers 4.35.0 for NLP processing
   - Medical ontology management with ICD-10, SNOMED-CT, and UMLS codes
   - FHIR R4 compliant data generation and simulation

3. **NLP Processing Engine**
   - BioBERT model for biomedical entity extraction
   - Custom medical ontology with 1000+ healthcare concepts
   - Advanced query parsing and intent recognition
   - Real-time entity confidence scoring

## 🚀 Quick Start

### Local Development Setup

**Prerequisites:**
- **Node.js** 18.x or higher
- **Python** 3.8+ with pip
- **Git** for version control

**Installation:**

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ai-on-fhir-project
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```
   The backend server will start at `http://127.0.0.1:5000`

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The frontend application will start at `http://localhost:3000`

### First Query

1. Open your browser to `http://localhost:3000`
2. Enter a natural language query such as:
   - "Show me all diabetic patients over 50"
   - "Find female patients with hypertension under 65"
   - "List patients with cardiovascular conditions between ages 40-70"
3. View the extracted entities, FHIR parameters, and simulated patient data

## 📋 API Documentation

### Base URL
```
http://127.0.0.1:5000/api
```

### Endpoints

#### Health Check
```
GET /health
```
Returns system health status and version information.

#### Process Natural Language Query
```
POST /query
Content-Type: application/json

{
  "query": "Show me all diabetic patients over 50",
  "max_results": 10
}
```

#### Get Example Queries
```
GET /examples
```
Returns pre-configured example queries with descriptions and use cases.

#### Get Patient Data
```
GET /patients?gender=female&min_age=50&condition=E11.9&limit=20
```

#### Get Available Conditions
```
GET /conditions
```
Returns medical conditions with ICD-10, SNOMED-CT, and UMLS mappings.

#### Direct FHIR Search
```
POST /fhir/search
Content-Type: application/json

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

## 🔧 Configuration

### Backend Configuration

The backend can be configured through environment variables:

- `FLASK_ENV`: Development/production mode
- `FLASK_PORT`: Server port (default: 5000)
- `FLASK_HOST`: Server host (default: 127.0.0.1)
- `LOG_LEVEL`: Logging level (INFO, DEBUG, ERROR)

### Frontend Configuration

Frontend configuration is managed through `next.config.js`:

```javascript
module.exports = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://127.0.0.1:5000',
  },
  // Additional Next.js configuration
}
```

## 📊 Features in Detail

### Natural Language Processing

The system uses BioBERT (Bidirectional Encoder Representations from Transformers for Biomedical Text Mining) to process healthcare queries:

- **Entity Recognition**: Identifies medical conditions, demographics, and temporal constraints
- **Intent Classification**: Determines the type of healthcare query (search, count, list)
- **Parameter Extraction**: Converts entities into FHIR search parameters

### Medical Ontology

Comprehensive medical concept mapping:

- **1000+ Medical Concepts**: Extensive coverage of common healthcare conditions
- **Multi-Standard Mapping**: ICD-10, SNOMED-CT, and UMLS code mappings
- **Synonym Support**: Alternative medical terminology recognition
- **Hierarchical Organization**: Condition categories and relationships

### FHIR Compliance

Full adherence to FHIR R4 standards:

- **Patient Resources**: Complete patient demographic information
- **Condition Resources**: Medical conditions with proper coding
- **Bundle Responses**: FHIR-compliant data bundles
- **Search Parameters**: Standard FHIR search parameter support

### Data Visualization

Interactive charts and analytics:

- **Patient Demographics**: Age and gender distribution
- **Condition Analysis**: Medical condition frequency
- **Temporal Trends**: Time-based patient data analysis
- **Summary Statistics**: Key metrics and KPIs

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm test
```

### API Testing
Use the provided test scripts:
```bash
cd backend
python test_actual_api.py
python test_biobert_raw.py
```

## 🔒 Security & Compliance

### Data Privacy
- **Synthetic Data Only**: No real patient data is used or stored
- **HIPAA Awareness**: Architecture designed with healthcare privacy in mind
- **Secure Communication**: HTTPS ready for production deployment

### Access Control
- **CORS Configuration**: Controlled cross-origin resource sharing
- **Rate Limiting**: API request throttling (configurable)
- **Input Validation**: Comprehensive request validation and sanitization

## 🚀 Deployment

### Development
Both frontend and backend include development servers with hot reloading.

### Production

#### Backend (Flask + Gunicorn)
```bash
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

#### Frontend (Next.js)
```bash
cd frontend
npm run build
npm start
```

### Cloud Deployment

**Frontend (Netlify):**
- Automatic deployment from Git repository
- Configured via `netlify.toml`
- Environment variables set in Netlify dashboard

**Backend Options:**
- **Heroku**: `git subtree push --prefix backend heroku main`
- **Railway**: Connect repository and configure service
- **Render**: Deploy directly from Git with automatic builds
- **AWS ECS/Fargate**: Use provided Docker configuration
- **Google Cloud Run**: Deploy containerized backend
- **Azure Container Instances**: Docker-based deployment

> 📖 **Detailed deployment instructions**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 📈 Performance

### Response Times
- **Simple Queries**: < 500ms
- **Complex Queries**: < 1.5s
- **Large Result Sets**: < 3s (1000+ patients)

### Scalability
- **Concurrent Users**: 100+ supported with proper infrastructure
- **Data Volume**: Handles 10,000+ synthetic patient records
- **Query Complexity**: Supports multi-parameter queries with temporal constraints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint configuration for JavaScript/React
- Include comprehensive tests for new features
- Update documentation for API changes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **BioBERT Team**: For the excellent biomedical language model
- **FHIR Community**: For healthcare interoperability standards
- **Open Source Libraries**: All the amazing libraries that make this project possible

## 📞 Support

For questions, issues, or contributions:

- Create an issue on the GitHub repository
- Contact the development team
- Check the documentation in `/docs` for detailed guides

---

*This project demonstrates advanced healthcare NLP capabilities while maintaining strict adherence to healthcare data standards and privacy requirements.*
