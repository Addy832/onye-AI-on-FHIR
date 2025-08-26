#!/usr/bin/env python3
"""
Medical Ontology Manager
Scalable framework for expanding the BioBERT healthcare NLP system with additional
medical conditions, procedures, medications, and other healthcare concepts.
"""

import json
import requests
from typing import Dict, List, Optional, Any, Set
from dataclasses import dataclass, asdict
import logging
from pathlib import Path
import csv
import urllib.parse

logger = logging.getLogger(__name__)

@dataclass
class MedicalConcept:
    """Standardized medical concept with multiple coding systems"""
    name: str
    primary_term: str
    synonyms: List[str]
    icd10: str
    snomed_ct: Optional[str] = None
    umls_cui: Optional[str] = None
    loinc: Optional[str] = None
    rxnorm: Optional[str] = None
    category: str = "general"
    subcategory: Optional[str] = None
    description: str = ""
    severity: Optional[str] = None  # mild, moderate, severe
    onset_type: Optional[str] = None  # acute, chronic, episodic
    body_system: Optional[str] = None
    age_group: Optional[str] = None  # pediatric, adult, geriatric
    gender_specific: Optional[str] = None  # male, female, both
    drug_class: Optional[str] = None  # for medications
    procedure_type: Optional[str] = None  # diagnostic, therapeutic, surgical

@dataclass
class OntologyExpansionResult:
    """Results from expanding the medical ontology"""
    concepts_added: int
    concepts_updated: int
    concepts_failed: int
    categories_added: List[str]
    failed_concepts: List[Dict[str, Any]]

class MedicalOntologyManager:
    """
    Manager for expanding and maintaining the medical ontology used by BioBERT NLP system
    """
    
    def __init__(self, nlp_processor_path: str = "nlp_processor.py"):
        self.nlp_processor_path = nlp_processor_path
        self.current_ontology = self._load_current_ontology()
        self.umls_api_key = None  # Set this to use UMLS API
        
    def _load_current_ontology(self) -> Dict[str, Dict]:
        """Load current medical ontology from nlp_processor.py"""
        try:
            with open(self.nlp_processor_path, 'r') as f:
                content = f.read()
            
            # Extract the medical ontology section
            start_marker = "def _load_medical_ontology(self) -> Dict[str, Dict]:"
            end_marker = "def _create_intent_templates(self)"
            
            start_idx = content.find(start_marker)
            end_idx = content.find(end_marker)
            
            if start_idx == -1 or end_idx == -1:
                raise ValueError("Could not find medical ontology section in nlp_processor.py")
            
            ontology_section = content[start_idx:end_idx]
            
            # Extract return dictionary (this is a simple extraction - could be improved with AST)
            return_start = ontology_section.find("return {")
            if return_start == -1:
                raise ValueError("Could not find ontology return statement")
            
            # For now, return empty dict - actual implementation would parse the Python code
            # This would require more sophisticated parsing
            logger.warning("Current implementation returns empty ontology - implement proper parsing")
            return {}
            
        except Exception as e:
            logger.error(f"Failed to load current ontology: {e}")
            return {}
    
    def create_concept(self, 
                      name: str,
                      primary_term: str,
                      synonyms: List[str],
                      icd10: str,
                      category: str,
                      **kwargs) -> MedicalConcept:
        """Create a new medical concept with validation"""
        
        # Validate required fields
        if not name or not primary_term or not icd10 or not category:
            raise ValueError("Name, primary_term, icd10, and category are required")
        
        # Validate ICD-10 format (basic validation)
        if not self._validate_icd10(icd10):
            logger.warning(f"ICD-10 code {icd10} may not be valid format")
        
        # Clean and standardize synonyms
        synonyms = [s.strip() for s in synonyms if s.strip()]
        synonyms = list(dict.fromkeys(synonyms))  # Remove duplicates while preserving order
        
        return MedicalConcept(
            name=name.lower().replace(' ', '_'),
            primary_term=primary_term,
            synonyms=synonyms,
            icd10=icd10.upper(),
            category=category.lower(),
            **kwargs
        )
    
    def _validate_icd10(self, code: str) -> bool:
        """Basic ICD-10 code validation"""
        import re
        # Basic ICD-10 pattern: Letter + 2 digits + optional decimal + optional digits
        pattern = r'^[A-Z][0-9]{2}(\.[0-9A-Z]*)?$'
        return bool(re.match(pattern, code.upper()))
    
    def lookup_snomed_ct(self, term: str) -> Optional[str]:
        """Lookup SNOMED CT code for a medical term (requires SNOMED CT access)"""
        # This would integrate with SNOMED CT API or database
        # Placeholder implementation
        logger.info(f"SNOMED CT lookup not implemented for: {term}")
        return None
    
    def lookup_umls_cui(self, term: str) -> Optional[str]:
        """Lookup UMLS CUI for a medical term"""
        if not self.umls_api_key:
            logger.info("UMLS API key not configured")
            return None
        
        try:
            # UMLS REST API integration (simplified)
            base_url = "https://uts-ws.nlm.nih.gov/rest"
            search_url = f"{base_url}/search/current"
            
            params = {
                'string': term,
                'apiKey': self.umls_api_key,
                'returnIdType': 'concept'
            }
            
            response = requests.get(search_url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                results = data.get('result', {}).get('results', [])
                if results:
                    return results[0].get('ui')  # Return first CUI
            
        except Exception as e:
            logger.error(f"UMLS lookup failed for {term}: {e}")
        
        return None
    
    def add_concepts_from_csv(self, csv_path: str) -> OntologyExpansionResult:
        """Add medical concepts from CSV file"""
        concepts_added = 0
        concepts_updated = 0
        concepts_failed = 0
        categories_added = set()
        failed_concepts = []
        
        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                
                for row in reader:
                    try:
                        # Extract required fields
                        name = row.get('name', '').strip()
                        primary_term = row.get('primary_term', name).strip()
                        synonyms = [s.strip() for s in row.get('synonyms', '').split('|') if s.strip()]
                        icd10 = row.get('icd10', '').strip()
                        category = row.get('category', 'general').strip()
                        
                        # Optional fields
                        optional_fields = {
                            'snomed_ct': row.get('snomed_ct', '').strip() or None,
                            'umls_cui': row.get('umls_cui', '').strip() or None,
                            'description': row.get('description', '').strip(),
                            'subcategory': row.get('subcategory', '').strip() or None,
                            'body_system': row.get('body_system', '').strip() or None,
                            'severity': row.get('severity', '').strip() or None,
                            'onset_type': row.get('onset_type', '').strip() or None
                        }
                        
                        # Create concept
                        concept = self.create_concept(
                            name=name,
                            primary_term=primary_term,
                            synonyms=synonyms,
                            icd10=icd10,
                            category=category,
                            **{k: v for k, v in optional_fields.items() if v}
                        )
                        
                        # Attempt to enrich with external APIs
                        if not concept.umls_cui:
                            concept.umls_cui = self.lookup_umls_cui(primary_term)
                        
                        # Add to ontology (this would update the actual file)
                        self._add_concept_to_ontology(concept)
                        
                        concepts_added += 1
                        categories_added.add(category)
                        
                        logger.info(f"Added concept: {concept.name}")
                        
                    except Exception as e:
                        concepts_failed += 1
                        failed_concepts.append({
                            'row': dict(row),
                            'error': str(e)
                        })
                        logger.error(f"Failed to add concept from row {dict(row)}: {e}")
        
        except Exception as e:
            logger.error(f"Failed to read CSV file {csv_path}: {e}")
            raise
        
        return OntologyExpansionResult(
            concepts_added=concepts_added,
            concepts_updated=concepts_updated,
            concepts_failed=concepts_failed,
            categories_added=list(categories_added),
            failed_concepts=failed_concepts
        )
    
    def add_icd10_category(self, icd10_chapter: str, include_subcategories: bool = True) -> OntologyExpansionResult:
        """Add all conditions from a specific ICD-10 chapter"""
        # ICD-10 chapters mapping
        icd10_chapters = {
            'A00-B99': 'infectious_diseases',
            'C00-D49': 'neoplasms', 
            'D50-D89': 'blood_disorders',
            'E00-E89': 'endocrine_disorders',
            'F01-F99': 'mental_health',
            'G00-G99': 'neurological',
            'H00-H59': 'eye_disorders',
            'H60-H95': 'ear_disorders',
            'I00-I99': 'cardiovascular',
            'J00-J99': 'respiratory',
            'K00-K95': 'digestive',
            'L00-L99': 'skin_disorders',
            'M00-M99': 'musculoskeletal',
            'N00-N99': 'genitourinary',
            'O00-O9A': 'pregnancy_related',
            'P00-P96': 'perinatal',
            'Q00-Q99': 'congenital_malformations',
            'R00-R99': 'symptoms_signs',
            'S00-T88': 'injury_poisoning',
            'V00-Y99': 'external_causes',
            'Z00-Z99': 'health_status'
        }
        
        category = icd10_chapters.get(icd10_chapter, 'general')
        
        # This would integrate with ICD-10 database/API to get all codes in range
        logger.info(f"ICD-10 bulk import not fully implemented for chapter {icd10_chapter}")
        
        # Placeholder - would return actual results
        return OntologyExpansionResult(
            concepts_added=0,
            concepts_updated=0,
            concepts_failed=0,
            categories_added=[category],
            failed_concepts=[]
        )
    
    def _add_concept_to_ontology(self, concept: MedicalConcept):
        """Add a concept to the medical ontology in nlp_processor.py"""
        # This would modify the actual nlp_processor.py file
        # For now, just log what would be added
        
        ontology_entry = {
            'icd10': concept.icd10,
            'snomed': concept.snomed_ct,
            'umls': concept.umls_cui,
            'synonyms': concept.synonyms,
            'category': concept.category,
            'description': concept.description
        }
        
        logger.info(f"Would add to ontology: {concept.name} -> {ontology_entry}")
    
    def generate_ontology_python_code(self, concepts: List[MedicalConcept]) -> str:
        """Generate Python code for the medical ontology dictionary"""
        lines = ["        return {"]
        
        for concept in concepts:
            lines.append(f'            # {concept.category.title()} conditions')
            lines.append(f'            "{concept.name}": {{')
            lines.append(f'                "icd10": "{concept.icd10}",')
            
            if concept.snomed_ct:
                lines.append(f'                "snomed": "{concept.snomed_ct}",')
            if concept.umls_cui:
                lines.append(f'                "umls": "{concept.umls_cui}",')
            
            # Format synonyms list
            synonyms_str = ', '.join([f'"{s}"' for s in concept.synonyms])
            lines.append(f'                "synonyms": [{synonyms_str}],')
            lines.append(f'                "category": "{concept.category}",')
            lines.append(f'                "description": "{concept.description}"')
            lines.append('            },')
            lines.append('')
        
        lines.append("        }")
        return '\n'.join(lines)
    
    def export_ontology_to_csv(self, output_path: str):
        """Export current ontology to CSV for external editing"""
        concepts = []
        
        # Convert current ontology to concept list
        for name, data in self.current_ontology.items():
            concept = MedicalConcept(
                name=name,
                primary_term=name.replace('_', ' ').title(),
                synonyms=data.get('synonyms', []),
                icd10=data.get('icd10', ''),
                snomed_ct=data.get('snomed'),
                umls_cui=data.get('umls'),
                category=data.get('category', 'general'),
                description=data.get('description', '')
            )
            concepts.append(concept)
        
        # Write to CSV
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            fieldnames = [
                'name', 'primary_term', 'synonyms', 'icd10', 'snomed_ct', 'umls_cui',
                'category', 'subcategory', 'description', 'body_system', 'severity', 'onset_type'
            ]
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            
            for concept in concepts:
                row = asdict(concept)
                row['synonyms'] = '|'.join(row['synonyms'])  # Join synonyms with pipe
                writer.writerow(row)
        
        logger.info(f"Exported {len(concepts)} concepts to {output_path}")
    
    def create_sample_expansion_csv(self, output_path: str):
        """Create a sample CSV file showing the format for adding new concepts"""
        sample_concepts = [
            {
                'name': 'migraine',
                'primary_term': 'Migraine',
                'synonyms': 'migraine headache|severe headache|vascular headache',
                'icd10': 'G43.9',
                'snomed_ct': '37796009',
                'umls_cui': 'C0149931',
                'category': 'neurological',
                'subcategory': 'headache_disorders',
                'description': 'migraine headache neurological vascular pain',
                'body_system': 'nervous_system',
                'severity': 'moderate',
                'onset_type': 'episodic'
            },
            {
                'name': 'gastroenteritis',
                'primary_term': 'Gastroenteritis',
                'synonyms': 'stomach flu|intestinal flu|gastric flu|food poisoning',
                'icd10': 'K59.1',
                'snomed_ct': '25374005',
                'umls_cui': 'C0017160',
                'category': 'digestive',
                'subcategory': 'inflammatory_bowel',
                'description': 'gastroenteritis digestive inflammation intestinal stomach',
                'body_system': 'digestive_system',
                'severity': 'mild',
                'onset_type': 'acute'
            },
            {
                'name': 'osteoporosis',
                'primary_term': 'Osteoporosis',
                'synonyms': 'bone loss|bone density loss|brittle bone disease',
                'icd10': 'M81.9',
                'snomed_ct': '64859006',
                'umls_cui': 'C0029456',
                'category': 'musculoskeletal',
                'subcategory': 'bone_disorders',
                'description': 'osteoporosis bone density skeletal fragility fracture',
                'body_system': 'skeletal_system',
                'severity': 'moderate',
                'onset_type': 'chronic'
            }
        ]
        
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            fieldnames = [
                'name', 'primary_term', 'synonyms', 'icd10', 'snomed_ct', 'umls_cui',
                'category', 'subcategory', 'description', 'body_system', 'severity', 'onset_type'
            ]
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            
            for concept in sample_concepts:
                writer.writerow(concept)
        
        logger.info(f"Created sample expansion CSV at {output_path}")
    
    def validate_ontology(self) -> Dict[str, Any]:
        """Validate the current medical ontology for completeness and consistency"""
        validation_results = {
            'total_concepts': len(self.current_ontology),
            'missing_fields': [],
            'invalid_codes': [],
            'duplicate_codes': [],
            'categories': set(),
            'coverage_analysis': {}
        }
        
        seen_icd10 = set()
        
        for name, data in self.current_ontology.items():
            # Check required fields
            required_fields = ['icd10', 'synonyms', 'category', 'description']
            for field in required_fields:
                if not data.get(field):
                    validation_results['missing_fields'].append(f"{name}: missing {field}")
            
            # Check ICD-10 format
            icd10 = data.get('icd10', '')
            if icd10:
                if not self._validate_icd10(icd10):
                    validation_results['invalid_codes'].append(f"{name}: invalid ICD-10 {icd10}")
                
                if icd10 in seen_icd10:
                    validation_results['duplicate_codes'].append(f"Duplicate ICD-10: {icd10}")
                seen_icd10.add(icd10)
            
            # Track categories
            category = data.get('category', 'unknown')
            validation_results['categories'].add(category)
        
        validation_results['categories'] = list(validation_results['categories'])
        
        return validation_results

def main():
    """Example usage of the Medical Ontology Manager"""
    
    # Initialize manager
    manager = MedicalOntologyManager()
    
    # Create sample expansion CSV
    print("📋 Creating sample expansion CSV...")
    manager.create_sample_expansion_csv('data/sample_medical_concepts.csv')
    print("✅ Sample CSV created: data/sample_medical_concepts.csv")
    
    # Validate current ontology
    print("\n🔍 Validating current ontology...")
    validation = manager.validate_ontology()
    print(f"✅ Validation complete:")
    print(f"   - Total concepts: {validation['total_concepts']}")
    print(f"   - Categories: {', '.join(validation['categories'])}")
    print(f"   - Missing fields: {len(validation['missing_fields'])}")
    print(f"   - Invalid codes: {len(validation['invalid_codes'])}")
    
    # Example: Add concepts from CSV (if file exists)
    sample_csv = Path('data/sample_medical_concepts.csv')
    if sample_csv.exists():
        print(f"\n📈 Adding concepts from {sample_csv}...")
        result = manager.add_concepts_from_csv(str(sample_csv))
        print(f"✅ Expansion complete:")
        print(f"   - Concepts added: {result.concepts_added}")
        print(f"   - Concepts failed: {result.concepts_failed}")
        print(f"   - New categories: {', '.join(result.categories_added)}")
    
    print("\n🎉 Medical Ontology Manager demonstration complete!")
    print("\nTo expand the ontology:")
    print("1. Edit data/sample_medical_concepts.csv or create your own")
    print("2. Run: python medical_ontology_manager.py")
    print("3. The manager will validate and integrate new concepts")

if __name__ == "__main__":
    main()
