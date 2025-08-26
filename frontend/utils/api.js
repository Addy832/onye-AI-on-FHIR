import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging and authentication
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Add authentication token if available
    const token = localStorage.getItem('healthcareAuthToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response || error);
    
    // Handle specific error cases
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.warn('🔐 Unauthorized - redirecting to login');
          // Handle authentication failure
          localStorage.removeItem('healthcareAuthToken');
          break;
        case 403:
          console.warn('🚫 Forbidden - insufficient permissions');
          break;
        case 429:
          console.warn('⏰ Rate limit exceeded');
          break;
        case 500:
          console.error('🔥 Server error');
          break;
      }
    }
    
    return Promise.reject(error);
  }
);

// API Functions

/**
 * Health check endpoint
 * @returns {Promise} API health status
 */
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/api/health');
    return response.data;
  } catch (error) {
    throw new Error(`Health check failed: ${error.message}`);
  }
};

/**
 * Process natural language query
 * @param {string} query - Natural language healthcare query
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise} Query results with FHIR data and statistics
 */
export const processQuery = async (query, maxResults = 10) => {
  try {
    const response = await apiClient.post('/api/query', {
      query: query.trim(),
      max_results: maxResults,
      use_advanced_nlp: true,  // Enable advanced NLP processing
      include_risk_analysis: false  // Optional risk analysis
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message;
    throw new Error(`Query processing failed: ${errorMessage}`);
  }
};

/**
 * Get example queries
 * @returns {Promise} List of example queries with descriptions
 */
export const getExamples = async () => {
  try {
    const response = await apiClient.get('/api/examples');
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get examples: ${error.message}`);
  }
};

/**
 * Get patients with optional filters
 * @param {Object} filters - Filter parameters
 * @returns {Promise} Patient data with statistics
 */
export const getPatients = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await apiClient.get(`/api/patients?${params}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get patients: ${error.message}`);
  }
};

/**
 * Get available medical conditions
 * @returns {Promise} List of conditions for autocomplete
 */
export const getConditions = async () => {
  try {
    const response = await apiClient.get('/api/conditions');
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get conditions: ${error.message}`);
  }
};

/**
 * Direct FHIR search
 * @param {Object} fhirParams - FHIR search parameters
 * @returns {Promise} FHIR Bundle response
 */
export const fhirSearch = async (fhirParams) => {
  try {
    const response = await apiClient.post('/api/fhir/search', fhirParams);
    return response.data;
  } catch (error) {
    throw new Error(`FHIR search failed: ${error.message}`);
  }
};

// Utility functions for data processing

/**
 * Format patient data for display
 * @param {Array} patients - Array of FHIR Patient resources
 * @returns {Array} Formatted patient data
 */
export const formatPatientData = (patients) => {
  return patients.map(patient => {
    const name = patient.name?.[0];
    const address = patient.address?.[0];
    const telecom = patient.telecom?.find(t => t.system === 'phone');
    
    return {
      id: patient.id,
      name: name ? `${name.given?.[0] || ''} ${name.family || ''}`.trim() : 'Unknown',
      gender: patient.gender || 'Unknown',
      birthDate: patient.birthDate || 'Unknown',
      age: patient.birthDate ? calculateAge(patient.birthDate) : 'Unknown',
      address: address ? `${address.city || ''}, ${address.state || ''}`.trim() : 'Unknown',
      phone: telecom?.value || 'Not provided',
      maritalStatus: patient.maritalStatus?.coding?.[0]?.display || 'Unknown',
    };
  });
};

/**
 * Format condition data for display
 * @param {Array} conditions - Array of FHIR Condition resources
 * @returns {Array} Formatted condition data
 */
export const formatConditionData = (conditions) => {
  return conditions.map(condition => ({
    id: condition.id,
    code: condition.code?.coding?.[0]?.code || 'Unknown',
    display: condition.code?.coding?.[0]?.display || 'Unknown condition',
    category: condition.category?.[0]?.coding?.[0]?.display || 'General',
    clinicalStatus: condition.clinicalStatus?.coding?.[0]?.display || 'Unknown',
    severity: condition.severity?.coding?.[0]?.display || 'Unknown',
    onsetDate: condition.onsetDateTime ? formatDate(condition.onsetDateTime) : 'Unknown',
    patientId: condition.subject?.reference?.split('/')?.[1] || 'Unknown',
  }));
};

/**
 * Calculate age from birth date
 * @param {string} birthDate - ISO date string
 * @returns {number} Age in years
 */
export const calculateAge = (birthDate) => {
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
    return 'Unknown';
  }
};

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Format datetime for display
 * @param {string} dateTimeString - ISO datetime string
 * @returns {string} Formatted datetime
 */
export const formatDateTime = (dateTimeString) => {
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Debounce function for search queries
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Validate query input
 * @param {string} query - User query
 * @returns {Object} Validation result
 */
export const validateQuery = (query) => {
  const trimmedQuery = query.trim();
  
  if (!trimmedQuery) {
    return {
      isValid: false,
      error: 'Please enter a healthcare query',
    };
  }
  
  if (trimmedQuery.length < 3) {
    return {
      isValid: false,
      error: 'Query must be at least 3 characters long',
    };
  }
  
  if (trimmedQuery.length > 200) {
    return {
      isValid: false,
      error: 'Query must be less than 200 characters',
    };
  }
  
  return {
    isValid: true,
    error: null,
  };
};

/**
 * Get chart color based on index
 * @param {number} index - Color index
 * @returns {Object} Chart colors
 */
export const getChartColors = (index) => {
  const colors = [
    { bg: 'rgba(14, 165, 233, 0.6)', border: 'rgba(14, 165, 233, 1)' },
    { bg: 'rgba(34, 197, 94, 0.6)', border: 'rgba(34, 197, 94, 1)' },
    { bg: 'rgba(245, 158, 11, 0.6)', border: 'rgba(245, 158, 11, 1)' },
    { bg: 'rgba(239, 68, 68, 0.6)', border: 'rgba(239, 68, 68, 1)' },
    { bg: 'rgba(147, 51, 234, 0.6)', border: 'rgba(147, 51, 234, 1)' },
    { bg: 'rgba(236, 72, 153, 0.6)', border: 'rgba(236, 72, 153, 1)' },
  ];
  
  return colors[index % colors.length];
};

export default {
  healthCheck,
  processQuery,
  getExamples,
  getPatients,
  getConditions,
  fhirSearch,
  formatPatientData,
  formatConditionData,
  calculateAge,
  formatDate,
  formatDateTime,
  debounce,
  validateQuery,
  getChartColors,
};
