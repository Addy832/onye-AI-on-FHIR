import { useState, useEffect, useCallback } from 'react';
import { processQuery, getExamples, getConditions, validateQuery } from '../utils/api';

/**
 * Hook for managing healthcare query state
 */
export const useHealthcareQuery = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);
  
  // Process healthcare query
  const executeQuery = useCallback(async (searchQuery, maxResults = 10) => {
    // Validate query
    const validation = validateQuery(searchQuery);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await processQuery(searchQuery, maxResults);
      setResults(response);
      
      // Add to query history
      setQueryHistory(prev => [
        {
          id: Date.now(),
          query: searchQuery,
          timestamp: new Date().toISOString(),
          resultCount: response.statistics?.total_patients || 0,
        },
        ...prev.slice(0, 9) // Keep last 10 queries
      ]);
      
      setError(null);
    } catch (err) {
      setError(err.message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Clear results and error
  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);
  
  // Clear query history
  const clearHistory = useCallback(() => {
    setQueryHistory([]);
  }, []);
  
  return {
    query,
    setQuery,
    results,
    loading,
    error,
    queryHistory,
    executeQuery,
    clearResults,
    clearHistory,
  };
};

/**
 * Hook for managing example queries
 */
export const useExamples = () => {
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchExamples = async () => {
      try {
        setLoading(true);
        const response = await getExamples();
        setExamples(response.examples || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        setExamples([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExamples();
  }, []);
  
  return { examples, loading, error };
};

/**
 * Hook for managing autocomplete data
 */
export const useAutocomplete = () => {
  const [conditions, setConditions] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch conditions for autocomplete
  useEffect(() => {
    const fetchConditions = async () => {
      try {
        setLoading(true);
        const response = await getConditions();
        setConditions(response.conditions || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        setConditions([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConditions();
  }, []);
  
  // Generate suggestions based on input
  const generateSuggestions = useCallback((input) => {
    if (!input || input.length < 2) {
      setSuggestions([]);
      return;
    }
    
    const inputLower = input.toLowerCase();
    
    // Smart query templates based on common healthcare patterns
    const smartTemplates = [
      // Demographic-based queries
      { pattern: /^(show|find|list|get)\s+(me\s+)?(all\s+)?/i, suggestions: [
        'Show me all diabetic patients over 50',
        'Show me all female patients with hypertension',
        'Show me all patients diagnosed with lung cancer recently',
        'Show me all elderly patients with cardiovascular disease'
      ]},
      
      // Count-based queries
      { pattern: /^count/i, suggestions: [
        'Count elderly women with diabetes and cardiovascular disease',
        'Count male patients with depression',
        'Count patients diagnosed with heart disease in the last year',
        'Count female patients with breast cancer'
      ]},
      
      // Condition-specific queries
      { pattern: /diabet/i, suggestions: [
        'Show me all diabetic patients over 50',
        'Find diabetic patients diagnosed in the last year',
        'Count elderly women with diabetes and cardiovascular disease',
        'List all patients with diabetes complications'
      ]},
      
      { pattern: /hypertension|blood pressure/i, suggestions: [
        'Find female patients with hypertension under 65',
        'Show patients with high blood pressure over 40',
        'Count patients with uncontrolled hypertension',
        'List elderly patients with hypertension and diabetes'
      ]},
      
      { pattern: /heart|cardiac|cardiovascular/i, suggestions: [
        'Show patients with cardiovascular conditions between ages 40-70',
        'Find patients with heart disease',
        'Count elderly women with diabetes and cardiovascular disease',
        'List patients with recent heart attacks'
      ]},
      
      { pattern: /cancer|tumor|malignant/i, suggestions: [
        'Show me patients diagnosed with lung cancer recently',
        'Find female patients with breast cancer',
        'Count patients with cancer diagnosis in last 6 months',
        'List all cancer patients under 65'
      ]},
      
      { pattern: /depression|mental health|anxiety/i, suggestions: [
        'Count male patients with depression',
        'Find patients with mental health conditions',
        'Show young adults with anxiety disorders',
        'List patients with depression and diabetes'
      ]},
      
      { pattern: /elderly|senior|older/i, suggestions: [
        'Count elderly women with diabetes and cardiovascular disease',
        'Show elderly patients with multiple conditions',
        'Find senior patients diagnosed recently',
        'List elderly patients with hypertension'
      ]},
      
      { pattern: /female|women/i, suggestions: [
        'Find female patients with hypertension under 65',
        'Count elderly women with diabetes and cardiovascular disease',
        'Show female patients with breast cancer',
        'List women with reproductive health issues'
      ]},
      
      { pattern: /male|men/i, suggestions: [
        'Count male patients with depression',
        'Show male patients with heart disease over 50',
        'Find men with prostate conditions',
        'List male patients with diabetes'
      ]}
    ];
    
    // Advanced condition-based suggestions
    const conditionSuggestions = conditions
      .filter(condition => 
        condition.text.toLowerCase().includes(inputLower) ||
        condition.display.toLowerCase().includes(inputLower)
      )
      .slice(0, 3)
      .map(condition => ({
        type: 'condition',
        text: `Show me all patients with ${condition.text}`,
        description: condition.display,
        category: condition.category,
        confidence: 0.8
      }));
    
    // Smart pattern matching
    const patternSuggestions = [];
    for (const template of smartTemplates) {
      if (template.pattern.test(inputLower)) {
        template.suggestions.forEach((suggestion, index) => {
          if (suggestion.toLowerCase().includes(inputLower.substring(0, 10)) || 
              inputLower.includes(suggestion.split(' ')[2]?.toLowerCase() || '')) {
            patternSuggestions.push({
              type: 'smart_pattern',
              text: suggestion,
              description: `Popular healthcare query`,
              category: 'Suggested',
              confidence: 0.9 - (index * 0.1)
            });
          }
        });
        break; // Use first matching pattern
      }
    }
    
    // Intelligent completion suggestions
    const completionSuggestions = [];
    
    // Auto-complete common beginnings
    if (inputLower.startsWith('show') && inputLower.length < 10) {
      completionSuggestions.push(
        { type: 'completion', text: 'Show me all diabetic patients over 50', description: 'Complete your search' },
        { type: 'completion', text: 'Show me patients diagnosed with lung cancer recently', description: 'Complete your search' }
      );
    }
    
    if (inputLower.startsWith('find') && inputLower.length < 8) {
      completionSuggestions.push(
        { type: 'completion', text: 'Find female patients with hypertension under 65', description: 'Complete your search' },
        { type: 'completion', text: 'Find patients with heart disease', description: 'Complete your search' }
      );
    }
    
    if (inputLower.startsWith('count') && inputLower.length < 10) {
      completionSuggestions.push(
        { type: 'completion', text: 'Count elderly women with diabetes and cardiovascular disease', description: 'Complete your search' },
        { type: 'completion', text: 'Count male patients with depression', description: 'Complete your search' }
      );
    }
    
    // Fuzzy matching for medical terms
    const medicalTerms = {
      'dm': 'diabetes mellitus',
      'htn': 'hypertension', 
      'mi': 'myocardial infarction',
      'cad': 'coronary artery disease',
      'copd': 'chronic obstructive pulmonary disease',
      'chf': 'congestive heart failure'
    };
    
    const fuzzyMatches = [];
    Object.entries(medicalTerms).forEach(([abbrev, fullTerm]) => {
      if (inputLower.includes(abbrev) || inputLower.includes(fullTerm)) {
        fuzzyMatches.push({
          type: 'medical_term',
          text: `Show me all patients with ${fullTerm}`,
          description: `${abbrev.toUpperCase()} - ${fullTerm}`,
          category: 'Medical Terms',
          confidence: 0.85
        });
      }
    });
    
    // Combine and rank all suggestions
    const allSuggestions = [
      ...completionSuggestions,
      ...patternSuggestions.slice(0, 3),
      ...conditionSuggestions,
      ...fuzzyMatches.slice(0, 2)
    ]
    .filter((suggestion, index, self) => 
      // Remove duplicates based on text
      index === self.findIndex(s => s.text === suggestion.text)
    )
    .sort((a, b) => (b.confidence || 0.5) - (a.confidence || 0.5)) // Sort by confidence
    .slice(0, 6); // Limit to 6 suggestions for better UX
    
    setSuggestions(allSuggestions);
  }, [conditions]);
  
  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);
  
  return {
    conditions,
    suggestions,
    loading,
    error,
    generateSuggestions,
    clearSuggestions,
  };
};

/**
 * Hook for managing data filters
 */
export const useDataFilters = (initialData = null) => {
  const [filteredData, setFilteredData] = useState(initialData);
  const [filters, setFilters] = useState({
    gender: '',
    ageRange: '',
    condition: '',
    dateRange: '',
  });
  
  // Apply filters to data
  const applyFilters = useCallback((data, filterConfig) => {
    if (!data || !data.results || !data.results.entry) {
      return data;
    }
    
    const patients = data.results.entry
      .filter(entry => entry.resource.resourceType === 'Patient')
      .map(entry => entry.resource);
    
    let filtered = patients;
    
    // Gender filter
    if (filterConfig.gender) {
      filtered = filtered.filter(patient => 
        patient.gender?.toLowerCase() === filterConfig.gender.toLowerCase()
      );
    }
    
    // Age range filter
    if (filterConfig.ageRange) {
      filtered = filtered.filter(patient => {
        if (!patient.birthDate) return false;
        
        const age = calculateAge(patient.birthDate);
        const [min, max] = filterConfig.ageRange.split('-').map(Number);
        
        if (max) {
          return age >= min && age <= max;
        } else {
          return age >= min;
        }
      });
    }
    
    // Update filtered data structure
    const filteredResults = {
      ...data,
      results: {
        ...data.results,
        entry: filtered.map(patient => ({
          fullUrl: `Patient/${patient.id}`,
          resource: patient,
          search: { mode: 'match' }
        })),
        total: filtered.length,
      }
    };
    
    return filteredResults;
  }, []);
  
  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      gender: '',
      ageRange: '',
      condition: '',
      dateRange: '',
    });
  }, []);
  
  // Effect to apply filters when data or filters change
  useEffect(() => {
    if (initialData) {
      const filtered = applyFilters(initialData, filters);
      setFilteredData(filtered);
    }
  }, [initialData, filters, applyFilters]);
  
  return {
    filteredData,
    filters,
    updateFilters,
    clearFilters,
  };
};

/**
 * Hook for managing local storage
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  const setValue = useCallback((value) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);
  
  return [storedValue, setValue];
};

/**
 * Hook for managing theme and accessibility preferences
 */
export const useAccessibility = () => {
  const [preferences, setPreferences] = useLocalStorage('accessibility-preferences', {
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    keyboardNavigation: true,
  });
  
  const togglePreference = useCallback((preference) => {
    setPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference],
    }));
  }, [setPreferences]);
  
  // Apply accessibility preferences to document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      if (preferences.highContrast) {
        root.classList.add('high-contrast');
      } else {
        root.classList.remove('high-contrast');
      }
      
      if (preferences.largeText) {
        root.classList.add('large-text');
      } else {
        root.classList.remove('large-text');
      }
      
      if (preferences.reducedMotion) {
        root.classList.add('reduced-motion');
      } else {
        root.classList.remove('reduced-motion');
      }
    }
  }, [preferences]);
  
  return {
    preferences,
    togglePreference,
  };
};

// Helper function for age calculation
const calculateAge = (birthDate) => {
  try {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    
    return age;
  } catch (error) {
    return 0;
  }
};
