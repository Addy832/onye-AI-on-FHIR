# Developer Guide

Comprehensive guide for developers working on the AI on FHIR Healthcare Data Querying System. This document covers architecture, development workflow, testing, and contribution guidelines.

## 🏗️ System Architecture

### High-Level Overview

The AI on FHIR system follows a modern three-tier architecture:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                           │
│                     (Next.js React Frontend)                       │
├─────────────────────────────────────────────────────────────────────┤
│                        Application Layer                            │
│                      (Flask Python Backend)                        │
├─────────────────────────────────────────────────────────────────────┤
│                         Data Layer                                  │
│              (BioBERT Models + Medical Ontology)                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### Backend Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Flask App     │    │  NLP Processor  │    │ FHIR Simulator  │
│                 │    │                 │    │                 │
│ - Route Handlers│────┤ - BioBERT       │────┤ - Data Gen      │
│ - CORS Support  │    │ - Med Ontology  │    │ - FHIR Bundles  │
│ - Error Handler │    │ - Entity Extract│    │ - Statistics    │
│ - Input Valid   │    │ - Query Parse   │    │ - URL Gen       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### Frontend Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │  React Comps    │    │  UI Libraries   │
│                 │    │                 │    │                 │
│ - Pages Router  │────┤ - Search Input  │────┤ - Tailwind CSS  │
│ - Static Gen    │    │ - Data Display  │    │ - Chart.js      │
│ - API Routes    │    │ - Visualizations│    │ - Lucide Icons  │
│ - Asset Opt     │    │ - Form Handling │    │ - Framer Motion │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Development Setup

### Prerequisites

#### System Requirements
- **Operating System**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **Python**: 3.8 or higher
- **Node.js**: 18.x or higher
- **RAM**: 8 GB minimum (BioBERT model requirements)
- **Storage**: 10 GB free space

#### Development Tools
- **Code Editor**: VS Code (recommended) or your preferred IDE
- **Version Control**: Git
- **Package Managers**: pip (Python), npm (Node.js)
- **Optional**: Docker and Docker Compose

### Initial Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd ai-on-fhir-project
   ```

2. **Backend Setup**
   ```bash
   cd backend
   
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Set environment variables
   export FLASK_ENV=development
   export FLASK_DEBUG=true
   export LOG_LEVEL=DEBUG
   
   # Start development server
   python app.py
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   
   # Install dependencies
   npm install
   
   # Create environment file
   echo "NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000/api" > .env.local
   
   # Start development server
   npm run dev
   ```

### Development Environment Configuration

#### VS Code Setup

Create `.vscode/settings.json`:

```json
{
  "python.defaultInterpreterPath": "./backend/venv/bin/python",
  "python.formatting.provider": "black",
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "eslint.workingDirectories": ["frontend"],
  "editor.formatOnSave": true,
  "files.associations": {
    "*.js": "javascriptreact",
    "*.jsx": "javascriptreact"
  }
}
```

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: Flask",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/backend/app.py",
      "env": {
        "FLASK_ENV": "development",
        "FLASK_DEBUG": "true"
      },
      "console": "integratedTerminal"
    }
  ]
}
```

#### Git Configuration

Create `.gitignore`:

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
share/python-wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# Virtual Environment
venv/
env/
ENV/

# Flask
instance/
.webassets-cache

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Next.js
.next/
out/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Cache
.cache/
```

## 🔧 Backend Development

### Project Structure

```
backend/
├── app.py                      # Main Flask application
├── nlp_processor.py           # BioBERT NLP processing
├── fhir_simulator.py          # FHIR data generation
├── medical_ontology_manager.py # Medical concept management
├── requirements.txt           # Python dependencies
├── sample_medical_concepts.csv # Medical ontology data
├── tests/                     # Test files
│   ├── test_api.py
│   ├── test_nlp.py
│   └── test_fhir.py
└── utils/                     # Utility modules
    ├── validators.py
    └── helpers.py
```

### Core Components

#### Flask Application (app.py)

The main application file containing:

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

from nlp_processor import BioBERTHealthcareNLP
from fhir_simulator import FHIRSimulator

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize processors
nlp_processor = BioBERTHealthcareNLP()
fhir_simulator = FHIRSimulator()

@app.route('/api/query', methods=['POST'])
def process_query():
    """Main endpoint for processing healthcare queries"""
    # Implementation details...
```

#### NLP Processor (nlp_processor.py)

BioBERT integration for medical entity extraction:

```python
from transformers import AutoTokenizer, AutoModel
import torch
import numpy as np

class BioBERTHealthcareNLP:
    def __init__(self):
        self.tokenizer = None
        self.model = None
        self.medical_ontology = {}
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize BioBERT model and tokenizer"""
        model_name = "dmis-lab/biobert-base-cased-v1.1"
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name)
    
    def process_query(self, query_text):
        """Process natural language healthcare query"""
        # Implementation details...
```

#### FHIR Simulator (fhir_simulator.py)

Synthetic healthcare data generation:

```python
import uuid
import random
from datetime import datetime, timedelta
from faker import Faker

class FHIRSimulator:
    def __init__(self):
        self.fake = Faker()
        
    def generate_fhir_response(self, fhir_params, max_results=10):
        """Generate FHIR-compliant synthetic patient data"""
        # Implementation details...
```

### API Development Guidelines

#### Endpoint Design

1. **RESTful Principles**: Follow REST conventions for URL structure
2. **Consistent Response Format**: All endpoints return JSON with consistent structure
3. **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
4. **Input Validation**: Validate all inputs before processing

Example endpoint structure:

```python
@app.route('/api/resource', methods=['POST'])
def create_resource():
    try:
        # Validate input
        data = request.get_json()
        if not data or 'required_field' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: required_field'
            }), 400
        
        # Process request
        result = process_data(data)
        
        # Return success response
        return jsonify({
            'success': True,
            'data': result,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in create_resource: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500
```

#### Testing Backend APIs

Create comprehensive test suites:

```python
import unittest
import json
from app import app

class TestHealthcareAPI(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = self.app.get('/api/health')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'healthy')
    
    def test_query_processing(self):
        """Test query processing endpoint"""
        query_data = {
            'query': 'Show me all diabetic patients over 50',
            'max_results': 10
        }
        
        response = self.app.post('/api/query', 
                               data=json.dumps(query_data),
                               content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertIn('entities', data)
        self.assertIn('results', data)

if __name__ == '__main__':
    unittest.main()
```

## 🎨 Frontend Development

### Project Structure

```
frontend/
├── pages/
│   ├── index.js              # Main application page
│   ├── _app.js               # Next.js app wrapper
│   └── api/                  # API routes (if needed)
├── components/
│   ├── SearchInput.jsx       # Query input component
│   ├── QueryAnalysis.js      # Results analysis display
│   ├── DataTable.jsx         # Patient data table
│   ├── DataCharts.jsx        # Data visualizations
│   └── BackendStatus.js      # Backend health indicator
├── styles/
│   ├── globals.css           # Global styles
│   └── components/           # Component-specific styles
├── public/                   # Static assets
├── utils/                    # Utility functions
├── hooks/                    # Custom React hooks
└── __tests__/               # Test files
```

### Component Development

#### React Component Guidelines

1. **Functional Components**: Use functional components with hooks
2. **PropTypes**: Define prop types for all components
3. **Error Boundaries**: Implement error boundaries for robust error handling
4. **Accessibility**: Follow WCAG guidelines for accessibility

Example component structure:

```javascript
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Search, Loader } from 'lucide-react';

const SearchInput = ({ onSearch, loading, placeholder }) => {
  const [query, setQuery] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }
    
    setError(null);
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-12 pr-24 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          disabled={loading}
        />
        
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 top-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Search'}
        </button>
      </div>
      
      {error && (
        <p className="mt-2 text-red-600 text-sm">{error}</p>
      )}
    </form>
  );
};

SearchInput.propTypes = {
  onSearch: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  placeholder: PropTypes.string,
};

SearchInput.defaultProps = {
  loading: false,
  placeholder: 'Enter your healthcare query...',
};

export default SearchInput;
```

#### Custom Hooks

Create reusable logic with custom hooks:

```javascript
// hooks/useAPI.js
import { useState, useCallback } from 'react';
import axios from 'axios';

const useAPI = (baseURL = process.env.NEXT_PUBLIC_API_BASE_URL) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiClient = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const makeRequest = useCallback(async (config) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient(config);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  const processQuery = useCallback(async (query, maxResults = 10) => {
    return makeRequest({
      method: 'POST',
      url: '/query',
      data: { query, max_results: maxResults },
    });
  }, [makeRequest]);

  const getExamples = useCallback(async () => {
    return makeRequest({
      method: 'GET',
      url: '/examples',
    });
  }, [makeRequest]);

  return {
    loading,
    error,
    processQuery,
    getExamples,
    makeRequest,
  };
};

export default useAPI;
```

#### State Management

For larger applications, consider using Context API or external state management:

```javascript
// context/AppContext.js
import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  currentQuery: '',
  results: null,
  loading: false,
  error: null,
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_QUERY':
      return { ...state, currentQuery: action.payload };
    case 'SET_RESULTS':
      return { ...state, results: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
```

### Styling Guidelines

#### Tailwind CSS Best Practices

1. **Utility-First**: Use Tailwind utilities for styling
2. **Component Extraction**: Extract repeated patterns into components
3. **Responsive Design**: Use responsive prefixes for mobile-first design
4. **Custom Configuration**: Extend Tailwind config for project-specific needs

Example Tailwind configuration:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        healthcare: {
          blue: '#0066cc',
          green: '#28a745',
          red: '#dc3545',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
```

## 🧪 Testing Strategy

### Backend Testing

#### Unit Tests

```python
# tests/test_nlp_processor.py
import unittest
from unittest.mock import patch, MagicMock
from nlp_processor import BioBERTHealthcareNLP

class TestNLPProcessor(unittest.TestCase):
    def setUp(self):
        self.nlp_processor = BioBERTHealthcareNLP()
    
    def test_entity_extraction(self):
        """Test entity extraction from medical query"""
        query = "Show me all diabetic patients over 50"
        
        result = self.nlp_processor.extract_entities(query)
        
        self.assertIsInstance(result, list)
        self.assertTrue(len(result) > 0)
        
        # Check for expected entity types
        entity_labels = [entity['label'] for entity in result]
        self.assertIn('CONDITION', entity_labels)
    
    @patch('nlp_processor.AutoModel.from_pretrained')
    def test_model_initialization(self, mock_model):
        """Test BioBERT model initialization"""
        mock_model.return_value = MagicMock()
        
        processor = BioBERTHealthcareNLP()
        
        self.assertIsNotNone(processor.model)
        self.assertIsNotNone(processor.tokenizer)
```

#### Integration Tests

```python
# tests/test_integration.py
import unittest
import json
from app import app

class TestIntegration(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
    
    def test_end_to_end_query_processing(self):
        """Test complete query processing pipeline"""
        # Test data
        query_data = {
            'query': 'Find female patients with diabetes under 65',
            'max_results': 5
        }
        
        # Make request
        response = self.app.post('/api/query',
                               data=json.dumps(query_data),
                               content_type='application/json')
        
        # Validate response
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        
        # Validate response structure
        required_fields = ['query', 'entities', 'fhir_url', 'results', 'statistics']
        for field in required_fields:
            self.assertIn(field, data)
        
        # Validate entities extraction
        entities = data['entities']
        self.assertIn('demographics', entities)
        self.assertIn('conditions', entities)
        self.assertIn('fhir_params', entities)
        
        # Validate FHIR compliance
        results = data['results']
        self.assertEqual(results['resourceType'], 'Bundle')
        self.assertIn('entry', results)
```

### Frontend Testing

#### Component Tests

```javascript
// __tests__/SearchInput.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchInput from '../components/SearchInput';

describe('SearchInput', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  test('renders search input with placeholder', () => {
    render(<SearchInput onSearch={mockOnSearch} />);
    
    expect(screen.getByPlaceholderText('Enter your healthcare query...')).toBeInTheDocument();
  });

  test('calls onSearch when form is submitted', async () => {
    render(<SearchInput onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button', { name: /search/i });
    
    fireEvent.change(input, { target: { value: 'diabetic patients' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('diabetic patients');
    });
  });

  test('shows error for empty query', async () => {
    render(<SearchInput onSearch={mockOnSearch} />);
    
    const button = screen.getByRole('button', { name: /search/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a search query')).toBeInTheDocument();
    });
  });

  test('disables input during loading', () => {
    render(<SearchInput onSearch={mockOnSearch} loading={true} />);
    
    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button');
    
    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });
});
```

#### API Integration Tests

```javascript
// __tests__/api.test.js
import { renderHook, act } from '@testing-library/react';
import axios from 'axios';
import useAPI from '../hooks/useAPI';

jest.mock('axios');
const mockedAxios = axios;

describe('useAPI hook', () => {
  beforeEach(() => {
    mockedAxios.create.mockReturnValue({
      request: jest.fn(),
    });
  });

  test('processes query successfully', async () => {
    const mockResponse = {
      data: {
        success: true,
        results: { resourceType: 'Bundle' }
      }
    };

    mockedAxios.create().mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAPI());

    await act(async () => {
      const response = await result.current.processQuery('test query');
      expect(response.success).toBe(true);
    });
  });
});
```

### Test Configuration

#### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  collectCoverageFrom: [
    'components/**/*.{js,jsx}',
    'hooks/**/*.{js,jsx}',
    'utils/**/*.{js,jsx}',
    '!**/*.d.ts',
  ],
};
```

## 🔄 Development Workflow

### Git Workflow

#### Branch Strategy

1. **main**: Production-ready code
2. **develop**: Development integration branch
3. **feature/**: Feature development branches
4. **hotfix/**: Critical bug fixes
5. **release/**: Release preparation branches

#### Commit Guidelines

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Examples:
```
feat(backend): add BioBERT entity confidence scoring
fix(frontend): resolve chart rendering issue on mobile
docs(api): update endpoint documentation
test(nlp): add unit tests for entity extraction
```

#### Pull Request Process

1. **Create Feature Branch**: `git checkout -b feature/new-feature`
2. **Implement Changes**: Write code, tests, and documentation
3. **Test Locally**: Ensure all tests pass
4. **Create Pull Request**: Include description and testing notes
5. **Code Review**: Address feedback from reviewers
6. **Merge**: Squash and merge after approval

### Code Quality

#### Python Code Quality

Use these tools for Python code quality:

```bash
# Install development dependencies
pip install black flake8 mypy pytest

# Format code
black .

# Check linting
flake8 .

# Type checking
mypy .

# Run tests
pytest
```

#### JavaScript Code Quality

Use these tools for JavaScript code quality:

```bash
# Install development dependencies
npm install --save-dev eslint prettier

# Format code
npm run format

# Check linting
npm run lint

# Run tests
npm test
```

#### Pre-commit Hooks

Set up pre-commit hooks to ensure code quality:

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json

  - repo: https://github.com/psf/black
    rev: 22.10.0
    hooks:
      - id: black

  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8

  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.49.0
    hooks:
      - id: eslint
        files: \.(js|jsx|ts|tsx)$
```

## 🚀 Performance Optimization

### Backend Performance

#### Database Optimization

1. **Efficient Queries**: Optimize database queries and use indexing
2. **Connection Pooling**: Use connection pooling for database connections
3. **Caching**: Implement Redis or memory caching for frequently accessed data

#### Model Optimization

1. **Model Caching**: Cache BioBERT model in memory
2. **Batch Processing**: Process multiple queries in batches
3. **Quantization**: Use model quantization for memory efficiency

#### API Optimization

```python
from flask_caching import Cache
from functools import lru_cache
import asyncio

# Configure caching
cache = Cache(app, config={'CACHE_TYPE': 'simple'})

# Cache expensive operations
@cache.cached(timeout=3600)
def get_medical_ontology():
    """Cache medical ontology for 1 hour"""
    return load_medical_ontology()

# Use LRU cache for model results
@lru_cache(maxsize=128)
def get_cached_prediction(query_hash):
    """Cache prediction results"""
    return model.predict(query_hash)

# Async processing for non-blocking operations
async def process_multiple_queries(queries):
    """Process multiple queries asynchronously"""
    tasks = [process_single_query(query) for query in queries]
    return await asyncio.gather(*tasks)
```

### Frontend Performance

#### React Optimization

1. **Component Memoization**: Use React.memo for expensive components
2. **Lazy Loading**: Implement code splitting and lazy loading
3. **Virtual Scrolling**: Use virtual scrolling for large data sets

#### Bundle Optimization

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize bundle splitting
      config.optimization.splitChunks.chunks = 'all';
    }
    return config;
  },
  // Enable compression
  compress: true,
  // Optimize images
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
};
```

#### Performance Monitoring

```javascript
// utils/performance.js
export const measurePerformance = (name, fn) => {
  return async (...args) => {
    const start = performance.now();
    try {
      const result = await fn(...args);
      const end = performance.now();
      console.log(`${name} took ${end - start} milliseconds`);
      return result;
    } catch (error) {
      console.error(`Error in ${name}:`, error);
      throw error;
    }
  };
};

// Usage
const optimizedAPICall = measurePerformance('API Call', apiCall);
```

## 📚 Documentation

### Code Documentation

#### Python Docstrings

```python
def process_healthcare_query(query: str, max_results: int = 10) -> dict:
    """
    Process a natural language healthcare query using BioBERT.
    
    Args:
        query (str): Natural language healthcare query
        max_results (int, optional): Maximum number of results. Defaults to 10.
    
    Returns:
        dict: Processed query results containing entities, FHIR data, and statistics
        
    Raises:
        ValueError: If query is empty or invalid
        RuntimeError: If BioBERT model fails to process query
        
    Example:
        >>> result = process_healthcare_query("Show diabetic patients over 50")
        >>> print(result['statistics']['total_patients'])
        45
    """
    if not query or not query.strip():
        raise ValueError("Query cannot be empty")
    
    # Implementation details...
```

#### JavaScript JSDoc

```javascript
/**
 * Custom hook for managing API calls to the healthcare backend
 * @param {string} baseURL - Base URL for the API
 * @returns {Object} API utilities and state
 * @example
 * const { processQuery, loading, error } = useAPI();
 * const results = await processQuery("Show diabetic patients");
 */
const useAPI = (baseURL = process.env.NEXT_PUBLIC_API_BASE_URL) => {
  // Implementation details...
};
```

### API Documentation

Keep API documentation up to date using OpenAPI/Swagger:

```python
from flask_restx import Api, Resource, fields

api = Api(app, doc='/docs/')

query_model = api.model('Query', {
    'query': fields.String(required=True, description='Natural language healthcare query'),
    'max_results': fields.Integer(description='Maximum results to return', default=10)
})

@api.route('/query')
class QueryResource(Resource):
    @api.expect(query_model)
    @api.doc('process_query')
    def post(self):
        """Process a natural language healthcare query"""
        # Implementation details...
```

## 🤝 Contributing Guidelines

### Code Standards

1. **Python**: Follow PEP 8 style guide
2. **JavaScript**: Follow Airbnb style guide
3. **Testing**: Maintain >80% code coverage
4. **Documentation**: Document all public APIs

### Review Process

1. **Self Review**: Review your own code before submitting
2. **Automated Checks**: Ensure all CI checks pass
3. **Peer Review**: Get approval from at least one reviewer
4. **Testing**: Include tests for new functionality

### Issue Management

1. **Bug Reports**: Use bug report template
2. **Feature Requests**: Use feature request template
3. **Labels**: Apply appropriate labels
4. **Assignees**: Assign to appropriate team members

---

*Developer guide for contributing to the AI on FHIR healthcare data querying system with comprehensive architecture, development, and testing information.*
