"""
AI on FHIR Flask API Server
Main application that integrates NLP processing with FHIR simulation
to provide natural language healthcare data querying.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import traceback
from datetime import datetime

from nlp_processor import BioBERTHealthcareNLP
from fhir_simulator import FHIRSimulator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Initialize processors
nlp_processor = BioBERTHealthcareNLP()
fhir_simulator = FHIRSimulator()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'AI on FHIR Backend',
        'version': '1.0.0'
    })

@app.route('/api/query', methods=['POST'])
def process_query():
    """
    Main endpoint to process natural language healthcare queries.
    
    Expected JSON payload:
    {
        "query": "Show me all diabetic patients over 50",
        "max_results": 10
    }
    
    Returns:
    {
        "success": true,
        "query": "original query",
        "entities": {...},
        "fhir_url": "generated FHIR URL",
        "results": {...FHIR Bundle...},
        "statistics": {...summary stats...}
    }
    """
    try:
        # Get request data
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: query'
            }), 400
        
        query = data['query'].strip()
        max_results = data.get('max_results', 10)
        
        if not query:
            return jsonify({
                'success': False,
                'error': 'Query cannot be empty'
            }), 400
        
        logger.info(f"Processing query: {query}")
        
        # Step 1: Process natural language query
        entities = nlp_processor.process_query(query)
        
        # Step 2: Generate FHIR URL for reference
        fhir_url = fhir_simulator.generate_fhir_url(entities['fhir_params'])
        
        # Step 3: Generate simulated FHIR data
        fhir_bundle = fhir_simulator.generate_fhir_response(
            entities['fhir_params'], 
            max_results=max_results
        )
        
        # Step 4: Generate summary statistics for frontend visualization
        statistics = fhir_simulator.get_summary_statistics(fhir_bundle)
        
        # Step 5: Prepare response
        response = {
            'success': True,
            'query': query,
            'entities': entities,
            'fhir_url': fhir_url,
            'results': fhir_bundle,
            'statistics': statistics,
            'processing_time': datetime.now().isoformat()
        }
        
        logger.info(f"Query processed successfully. Found {statistics['total_patients']} patients")
        
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        logger.error(traceback.format_exc())
        
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/api/examples', methods=['GET'])
def get_examples():
    """
    Get example queries that demonstrate the system capabilities.
    
    Returns:
    {
        "examples": [
            {
                "query": "Show me all diabetic patients over 50",
                "description": "Search for patients with diabetes over age 50",
                "expected_entities": {...}
            },
            ...
        ]
    }
    """
    try:
        examples = nlp_processor.get_example_queries()
        
        # Add descriptions and use cases for each example
        enhanced_examples = []
        for example in examples:
            enhanced_example = {
                **example,
                'description': _get_query_description(example['query']),
                'use_case': _get_use_case(example['query'])
            }
            enhanced_examples.append(enhanced_example)
        
        return jsonify({
            'success': True,
            'examples': enhanced_examples
        })
    
    except Exception as e:
        logger.error(f"Error getting examples: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/api/patients', methods=['GET'])
def get_patients():
    """
    Get patient data with optional filters.
    
    Query parameters:
    - gender: male/female
    - min_age: minimum age
    - max_age: maximum age
    - condition: condition code
    - limit: max results (default 20)
    
    Returns FHIR Bundle with Patient resources.
    """
    try:
        # Parse query parameters
        gender = request.args.get('gender')
        min_age = request.args.get('min_age', type=int)
        max_age = request.args.get('max_age', type=int)
        condition = request.args.get('condition')
        limit = request.args.get('limit', 20, type=int)
        
        # Build FHIR parameters from query params
        fhir_params = {
            'resource_type': 'Patient',
            'search_params': {},
            'include': []
        }
        
        if gender:
            fhir_params['search_params']['gender'] = gender
        
        if min_age or max_age:
            current_year = datetime.now().year
            if min_age and max_age:
                max_birth_year = current_year - min_age
                min_birth_year = current_year - max_age
                fhir_params['search_params']['birthdate'] = f'ge{min_birth_year}-01-01&birthdate=le{max_birth_year}-12-31'
            elif min_age:
                max_birth_year = current_year - min_age
                fhir_params['search_params']['birthdate'] = f'le{max_birth_year}-12-31'
            elif max_age:
                min_birth_year = current_year - max_age
                fhir_params['search_params']['birthdate'] = f'ge{min_birth_year}-01-01'
        
        if condition:
            fhir_params['search_params']['_has:Condition:patient:code'] = condition
            fhir_params['include'].append('Patient:condition')
        
        # Generate FHIR response
        bundle = fhir_simulator.generate_fhir_response(fhir_params, max_results=limit)
        statistics = fhir_simulator.get_summary_statistics(bundle)
        
        return jsonify({
            'success': True,
            'results': bundle,
            'statistics': statistics
        })
    
    except Exception as e:
        logger.error(f"Error getting patients: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/api/conditions', methods=['GET'])
def get_conditions():
    """
    Get available condition mappings for frontend auto-complete.
    
    Returns:
    {
        "conditions": [
            {
                "text": "diabetes",
                "code": "E11.9",
                "display": "Type 2 diabetes mellitus without complications"
            },
            ...
        ]
    }
    """
    try:
        conditions = []
        for concept_name, concept_data in nlp_processor.medical_ontology.items():
            # Add primary concept
            conditions.append({
                'text': concept_name.replace('_', ' '),
                'code': concept_data['icd10'],
                'display': concept_data.get('description', f'Condition {concept_data["icd10"]}'),
                'category': concept_data.get('category', 'general'),
                'snomed_code': concept_data.get('snomed'),
                'umls_cui': concept_data.get('umls')
            })
            
            # Add synonyms as separate entries
            for synonym in concept_data.get('synonyms', [])[:3]:  # Limit to 3 most common synonyms
                conditions.append({
                    'text': synonym,
                    'code': concept_data['icd10'],
                    'display': f'{synonym} ({concept_data.get("description", "")})',
                    'category': concept_data.get('category', 'general'),
                    'snomed_code': concept_data.get('snomed'),
                    'umls_cui': concept_data.get('umls'),
                    'is_synonym': True
                })
        
        return jsonify({
            'success': True,
            'conditions': conditions
        })
    
    except Exception as e:
        logger.error(f"Error getting conditions: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500


@app.route('/api/fhir/search', methods=['POST'])
def fhir_search():
    """
    Direct FHIR search endpoint that accepts FHIR parameters.
    
    Expected JSON payload:
    {
        "resource_type": "Patient",
        "search_params": {
            "gender": "female",
            "birthdate": "le1974-12-31"
        },
        "include": ["Patient:condition"],
        "max_results": 10
    }
    
    Returns FHIR Bundle.
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Missing FHIR parameters'
            }), 400
        
        max_results = data.get('max_results', 10)
        
        # Generate FHIR response
        bundle = fhir_simulator.generate_fhir_response(data, max_results=max_results)
        statistics = fhir_simulator.get_summary_statistics(bundle)
        fhir_url = fhir_simulator.generate_fhir_url(data)
        
        return jsonify({
            'success': True,
            'fhir_url': fhir_url,
            'results': bundle,
            'statistics': statistics
        })
    
    except Exception as e:
        logger.error(f"Error in FHIR search: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

def _get_query_description(query: str) -> str:
    """Generate a description for a query example."""
    descriptions = {
        'Show me all diabetic patients over 50': 'Search for patients with diabetes over age 50',
        'Find female patients with hypertension under 65': 'Find female patients with high blood pressure under 65',
        'List all patients diagnosed with diabetes in the last year': 'List recently diagnosed diabetes patients',
        'Show patients with cardiovascular conditions between ages 40-70': 'Show middle-aged patients with heart conditions',
        'Count male patients with depression': 'Count male patients with depression diagnosis'
    }
    return descriptions.get(query, 'Example healthcare query')

def _get_use_case(query: str) -> str:
    """Generate a use case for a query example."""
    use_cases = {
        'Show me all diabetic patients over 50': 'Population health management',
        'Find female patients with hypertension under 65': 'Cardiovascular care targeting',
        'List all patients diagnosed with diabetes in the last year': 'Recent diagnosis tracking',
        'Show patients with cardiovascular conditions between ages 40-70': 'Preventive care targeting',
        'Count male patients with depression': 'Mental health statistics'
    }
    return use_cases.get(query, 'Healthcare analytics')

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    logger.info("Starting AI on FHIR Backend Server...")
    logger.info("Available endpoints:")
    logger.info("  GET  /api/health            - Health check")
    logger.info("  POST /api/query             - Process natural language query")
    logger.info("  GET  /api/examples          - Get example queries")
    logger.info("  GET  /api/patients          - Get patient data with filters")
    logger.info("  GET  /api/conditions        - Get available conditions")
    logger.info("  POST /api/fhir/search       - Direct FHIR search")
    
    # Run Flask app (production-ready configuration)
    import os
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
