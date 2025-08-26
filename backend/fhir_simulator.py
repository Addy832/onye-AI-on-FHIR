"""
FHIR Simulator for Healthcare Data
Generates realistic FHIR-compliant Patient and Condition resources
based on natural language query parameters.
"""

import uuid
import random
from datetime import datetime, timedelta, date
from typing import Dict, List, Any, Optional
import json
import logging

logger = logging.getLogger(__name__)

class FHIRSimulator:
    """
    Simulates FHIR Patient and Condition resources based on query parameters.
    Generates realistic healthcare data for demonstration purposes.
    """
    
    def __init__(self):
        self.sample_names = {
            'male': [
                'James Johnson', 'Michael Smith', 'Robert Brown', 'John Davis', 'William Miller',
                'David Wilson', 'Richard Moore', 'Joseph Taylor', 'Thomas Anderson', 'Christopher Thomas'
            ],
            'female': [
                'Mary Johnson', 'Patricia Smith', 'Jennifer Brown', 'Linda Davis', 'Elizabeth Miller',
                'Barbara Wilson', 'Susan Moore', 'Jessica Taylor', 'Sarah Anderson', 'Karen Thomas'
            ]
        }
        
        self.addresses = [
            {'city': 'Boston', 'state': 'MA', 'postal_code': '02101'},
            {'city': 'New York', 'state': 'NY', 'postal_code': '10001'},
            {'city': 'Chicago', 'state': 'IL', 'postal_code': '60601'},
            {'city': 'Miami', 'state': 'FL', 'postal_code': '33101'},
            {'city': 'Los Angeles', 'state': 'CA', 'postal_code': '90001'},
            {'city': 'Houston', 'state': 'TX', 'postal_code': '77001'},
            {'city': 'Philadelphia', 'state': 'PA', 'postal_code': '19101'},
            {'city': 'Phoenix', 'state': 'AZ', 'postal_code': '85001'}
        ]
        
        self.condition_details = {
            'E11.9': {
                'display': 'Type 2 diabetes mellitus without complications',
                'category': 'endocrine',
                'severity': 'moderate'
            },
            'I10': {
                'display': 'Essential hypertension',
                'category': 'cardiovascular',
                'severity': 'mild'
            },
            'I25.9': {
                'display': 'Chronic ischemic heart disease, unspecified',
                'category': 'cardiovascular', 
                'severity': 'moderate'
            },
            'J45.9': {
                'display': 'Asthma, unspecified',
                'category': 'respiratory',
                'severity': 'mild'
            },
            'J44.1': {
                'display': 'Chronic obstructive pulmonary disease with acute exacerbation',
                'category': 'respiratory',
                'severity': 'moderate'
            },
            'F32.9': {
                'display': 'Major depressive disorder, single episode, unspecified',
                'category': 'mental-health',
                'severity': 'moderate'
            },
            'F41.9': {
                'display': 'Anxiety disorder, unspecified',
                'category': 'mental-health',
                'severity': 'mild'
            },
            'M19.9': {
                'display': 'Osteoarthritis, unspecified site',
                'category': 'musculoskeletal',
                'severity': 'mild'
            },
            'E66.9': {
                'display': 'Obesity, unspecified',
                'category': 'endocrine',
                'severity': 'moderate'
            }
        }

    def generate_fhir_response(self, fhir_params: Dict[str, Any], max_results: int = 10) -> Dict[str, Any]:
        """
        Generate a FHIR Bundle response based on query parameters.
        
        Args:
            fhir_params: FHIR search parameters from NLP processing
            max_results: Maximum number of results to return
            
        Returns:
            FHIR Bundle with Patient and Condition resources
        """
        patients = self._generate_patients(fhir_params, max_results)
        conditions = []
        
        # Generate conditions for patients if condition filters were specified
        if fhir_params.get('search_params', {}).get('_has:Condition:patient:code'):
            condition_codes = fhir_params['search_params']['_has:Condition:patient:code'].split(',')
            for patient in patients:
                for code in condition_codes:
                    condition = self._generate_condition(patient['id'], code, fhir_params)
                    conditions.append(condition)
        
        # Create FHIR Bundle
        bundle = {
            'resourceType': 'Bundle',
            'id': str(uuid.uuid4()),
            'type': 'searchset',
            'total': len(patients),
            'timestamp': datetime.now().isoformat() + 'Z',
            'entry': []
        }
        
        # Add patients to bundle
        for patient in patients:
            bundle['entry'].append({
                'fullUrl': f'Patient/{patient["id"]}',
                'resource': patient,
                'search': {'mode': 'match'}
            })
        
        # Add conditions to bundle if requested
        for condition in conditions:
            bundle['entry'].append({
                'fullUrl': f'Condition/{condition["id"]}',
                'resource': condition,
                'search': {'mode': 'include'}
            })
        
        return bundle

    def _generate_patients(self, fhir_params: Dict[str, Any], count: int) -> List[Dict[str, Any]]:
        """Generate realistic Patient resources based on parameters."""
        patients = []
        search_params = fhir_params.get('search_params', {})
        
        for i in range(count):
            # Determine gender
            gender = search_params.get('gender', random.choice(['male', 'female']))
            
            # Generate birthdate based on age filters
            birthdate = self._generate_birthdate(search_params)
            
            # Select name based on gender
            name = random.choice(self.sample_names[gender])
            first_name, last_name = name.split(' ', 1)
            
            # Generate address
            address = random.choice(self.addresses)
            
            patient = {
                'resourceType': 'Patient',
                'id': str(uuid.uuid4()),
                'active': True,
                'name': [{
                    'use': 'usual',
                    'family': last_name,
                    'given': [first_name]
                }],
                'gender': gender,
                'birthDate': birthdate,
                'address': [{
                    'use': 'home',
                    'line': [f'{random.randint(100, 999)} {random.choice(["Main St", "Oak Ave", "Pine Rd", "Elm Dr", "First St"])}'],
                    'city': address['city'],
                    'state': address['state'],
                    'postalCode': address['postal_code'],
                    'country': 'US'
                }],
                'telecom': [{
                    'system': 'phone',
                    'value': f'({random.randint(100, 999)}) {random.randint(100, 999)}-{random.randint(1000, 9999)}',
                    'use': 'home'
                }, {
                    'system': 'email',
                    'value': f'{first_name.lower()}.{last_name.lower()}@email.com',
                    'use': 'home'
                }],
                'maritalStatus': {
                    'coding': [{
                        'system': 'http://terminology.hl7.org/CodeSystem/v3-MaritalStatus',
                        'code': random.choice(['M', 'S', 'D', 'W']),
                        'display': random.choice(['Married', 'Single', 'Divorced', 'Widowed'])
                    }]
                }
            }
            
            patients.append(patient)
        
        return patients

    def _generate_birthdate(self, search_params: Dict[str, Any]) -> str:
        """Generate realistic birthdate based on age constraints."""
        current_year = datetime.now().year
        
        # Parse birthdate filters
        birthdate_param = search_params.get('birthdate', '')
        
        if 'le' in birthdate_param and 'ge' in birthdate_param:
            # Range constraint: ge1954-01-01&birthdate=le1974-12-31
            parts = birthdate_param.split('&birthdate=')
            min_date = parts[0].replace('ge', '')
            max_date = parts[1].replace('le', '')
            min_year = int(min_date.split('-')[0])
            max_year = int(max_date.split('-')[0])
        elif 'le' in birthdate_param:
            # Maximum age constraint
            max_year = int(birthdate_param.replace('le', '').split('-')[0])
            min_year = max_year - 30  # 30 year range
        elif 'ge' in birthdate_param:
            # Minimum age constraint  
            min_year = int(birthdate_param.replace('ge', '').split('-')[0])
            max_year = min_year + 30  # 30 year range
        else:
            # No age constraints - random adult age
            min_year = current_year - 80
            max_year = current_year - 18
        
        # Generate random date within range
        birth_year = random.randint(min_year, max_year)
        birth_month = random.randint(1, 12)
        birth_day = random.randint(1, 28)  # Safe day range for all months
        
        return f'{birth_year}-{birth_month:02d}-{birth_day:02d}'

    def _generate_condition(self, patient_id: str, condition_code: str, fhir_params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a Condition resource for a patient."""
        
        condition_info = self.condition_details.get(condition_code, {
            'display': f'Condition with code {condition_code}',
            'category': 'general',
            'severity': 'moderate'
        })
        
        # Generate onset date
        onset_date = self._generate_onset_date(fhir_params)
        
        condition = {
            'resourceType': 'Condition',
            'id': str(uuid.uuid4()),
            'clinicalStatus': {
                'coding': [{
                    'system': 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                    'code': 'active',
                    'display': 'Active'
                }]
            },
            'verificationStatus': {
                'coding': [{
                    'system': 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
                    'code': 'confirmed',
                    'display': 'Confirmed'
                }]
            },
            'category': [{
                'coding': [{
                    'system': 'http://terminology.hl7.org/CodeSystem/condition-category',
                    'code': condition_info['category'],
                    'display': condition_info['category'].title()
                }]
            }],
            'severity': {
                'coding': [{
                    'system': 'http://snomed.info/sct',
                    'code': '6736007' if condition_info['severity'] == 'moderate' else '255604002',
                    'display': condition_info['severity'].title()
                }]
            },
            'code': {
                'coding': [{
                    'system': 'http://hl7.org/fhir/sid/icd-10-cm',
                    'code': condition_code,
                    'display': condition_info['display']
                }]
            },
            'subject': {
                'reference': f'Patient/{patient_id}'
            },
            'onsetDateTime': onset_date,
            'recordedDate': datetime.now().isoformat() + 'Z'
        }
        
        return condition

    def _generate_onset_date(self, fhir_params: Dict[str, Any]) -> str:
        """Generate realistic condition onset date."""
        search_params = fhir_params.get('search_params', {})
        
        # Check for time filters
        onset_filter = search_params.get('_has:Condition:patient:onset-date', '')
        
        if 'ge' in onset_filter:
            # Must be after specified date
            min_date_str = onset_filter.replace('ge', '')
            min_date = datetime.strptime(min_date_str, '%Y-%m-%d')
            max_date = datetime.now()
            
            # Random date between min_date and now
            time_diff = max_date - min_date
            random_days = random.randint(0, time_diff.days)
            onset_date = min_date + timedelta(days=random_days)
        else:
            # Random date within last 5 years
            max_date = datetime.now()
            min_date = max_date - timedelta(days=5*365)
            time_diff = max_date - min_date
            random_days = random.randint(0, time_diff.days)
            onset_date = min_date + timedelta(days=random_days)
        
        return onset_date.isoformat() + 'Z'

    def generate_fhir_url(self, fhir_params: Dict[str, Any], base_url: str = 'https://fhir-server.example.com') -> str:
        """
        Generate a realistic FHIR API URL from the parameters.
        
        Args:
            fhir_params: FHIR search parameters
            base_url: Base FHIR server URL
            
        Returns:
            Complete FHIR search URL
        """
        resource_type = fhir_params.get('resource_type', 'Patient')
        search_params = fhir_params.get('search_params', {})
        includes = fhir_params.get('include', [])
        
        url_parts = [f'{base_url}/{resource_type}']
        
        # Add search parameters
        params = []
        for key, value in search_params.items():
            params.append(f'{key}={value}')
        
        # Add include parameters
        for include in includes:
            params.append(f'_include={include}')
        
        if params:
            url_parts.append('?' + '&'.join(params))
        
        return ''.join(url_parts)

    def get_summary_statistics(self, bundle: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate summary statistics from FHIR Bundle results.
        
        Args:
            bundle: FHIR Bundle response
            
        Returns:
            Dictionary with summary statistics for frontend visualization
        """
        patients = [entry['resource'] for entry in bundle['entry'] 
                   if entry['resource']['resourceType'] == 'Patient']
        conditions = [entry['resource'] for entry in bundle['entry']
                     if entry['resource']['resourceType'] == 'Condition']
        
        # Calculate age distribution
        ages = []
        for patient in patients:
            birthdate = datetime.strptime(patient['birthDate'], '%Y-%m-%d')
            age = (datetime.now() - birthdate).days // 365
            ages.append(age)
        
        # Age distribution for charts
        age_groups = {
            '18-30': 0, '31-40': 0, '41-50': 0, 
            '51-60': 0, '61-70': 0, '70+': 0
        }
        
        for age in ages:
            if 18 <= age <= 30:
                age_groups['18-30'] += 1
            elif 31 <= age <= 40:
                age_groups['31-40'] += 1
            elif 41 <= age <= 50:
                age_groups['41-50'] += 1
            elif 51 <= age <= 60:
                age_groups['51-60'] += 1
            elif 61 <= age <= 70:
                age_groups['61-70'] += 1
            else:
                age_groups['70+'] += 1
        
        # Gender distribution
        gender_count = {'male': 0, 'female': 0}
        for patient in patients:
            gender_count[patient['gender']] += 1
        
        # Condition distribution
        condition_count = {}
        for condition in conditions:
            code = condition['code']['coding'][0]['code']
            display = condition['code']['coding'][0]['display']
            condition_count[display] = condition_count.get(display, 0) + 1
        
        return {
            'total_patients': len(patients),
            'total_conditions': len(conditions),
            'age_distribution': age_groups,
            'gender_distribution': gender_count,
            'condition_distribution': condition_count,
            'average_age': sum(ages) / len(ages) if ages else 0
        }


# Test the FHIR simulator
if __name__ == "__main__":
    simulator = FHIRSimulator()
    
    # Test with sample FHIR parameters
    test_params = {
        'resource_type': 'Patient',
        'search_params': {
            'gender': 'female',
            'birthdate': 'le1974-12-31',
            '_has:Condition:patient:code': 'E11.9'
        },
        'include': ['Patient:condition']
    }
    
    print("=== FHIR Simulator Test ===")
    print(f"Parameters: {test_params}")
    
    # Generate FHIR URL
    fhir_url = simulator.generate_fhir_url(test_params)
    print(f"\\nGenerated FHIR URL: {fhir_url}")
    
    # Generate FHIR Bundle
    bundle = simulator.generate_fhir_response(test_params, max_results=5)
    print(f"\\nGenerated {bundle['total']} patients with conditions")
    
    # Generate summary statistics
    stats = simulator.get_summary_statistics(bundle)
    print(f"\\nSummary Statistics: {stats}")
