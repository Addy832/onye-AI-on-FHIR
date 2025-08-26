import React from 'react';
import { 
  Brain,
  Search,
  Filter,
  ArrowRight,
  Code,
  User,
  Calendar,
  Activity,
  AlertCircle
} from 'lucide-react';

// Helper function to safely render values
const safeRender = (value) => {
  try {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (typeof value === 'object') {
      // Handle arrays and objects
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return JSON.stringify(value);
    }
    return String(value);
  } catch (error) {
    console.warn('Error rendering value:', value, error);
    return '[Error rendering value]';
  }
};

const QueryAnalysis = ({ results, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-lg mr-3"></div>
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const entities = results.entities || {};
  const fhirParams = entities.fhir_params || {};

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <Brain className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Query Analysis</h3>
            <p className="text-sm text-gray-600">Natural Language Processing Results</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Original Query */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Search className="w-4 h-4 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Original Query</span>
          </div>
          <p className="text-gray-900 font-mono text-sm bg-white p-3 rounded border">
            "{results.query}"
          </p>
        </div>

        {/* Extracted Information and Transformed Parameters Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Extracted Information */}
          <div className="space-y-4">
            <div className="flex items-center mb-3">
              <Filter className="w-4 h-4 text-green-600 mr-2" />
              <h4 className="text-sm font-semibold text-gray-800">Extracted Information</h4>
            </div>

            {/* Action Type */}
            {entities.action && (
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Activity className="w-3 h-3 text-green-600 mr-1" />
                  <span className="text-xs font-medium text-green-800">Action</span>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {safeRender(entities.action)}
                </span>
              </div>
            )}

            {/* Demographics */}
            {entities.demographics && Object.keys(entities.demographics).length > 0 && (
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <User className="w-3 h-3 text-blue-600 mr-1" />
                  <span className="text-xs font-medium text-blue-800">Demographics</span>
                </div>
                <div className="space-y-1">
                  {Object.entries(entities.demographics).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      <span className="text-xs text-blue-700 mr-2 capitalize">{key}:</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {safeRender(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Age Filters */}
            {entities.age_filters && Object.keys(entities.age_filters).length > 0 && (
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <Calendar className="w-3 h-3 text-purple-600 mr-1" />
                  <span className="text-xs font-medium text-purple-800">Age Filters</span>
                </div>
                <div className="space-y-1">
                  {Object.entries(entities.age_filters).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      <span className="text-xs text-purple-700 mr-2 capitalize">{key.replace('_', ' ')}:</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        {safeRender(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Time Filters */}
            {entities.time_filters && Object.keys(entities.time_filters).length > 0 && (
              <div className="bg-teal-50 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <Calendar className="w-3 h-3 text-teal-600 mr-1" />
                  <span className="text-xs font-medium text-teal-800">Time Constraints</span>
                </div>
                <div className="space-y-1">
                  {entities.time_filters.time_phrase && (
                    <div className="flex items-center">
                      <span className="text-xs text-teal-700 mr-2">Period:</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800">
                        {safeRender(entities.time_filters.time_phrase)}
                      </span>
                    </div>
                  )}
                  {entities.time_filters.after_date && (
                    <div className="flex items-center">
                      <span className="text-xs text-teal-700 mr-2">After:</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800">
                        {safeRender(entities.time_filters.after_date)}
                      </span>
                    </div>
                  )}
                  {entities.time_filters.days_back && (
                    <div className="flex items-center">
                      <span className="text-xs text-teal-700 mr-2">Days back:</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800">
                        {safeRender(entities.time_filters.days_back)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Conditions */}
            {entities.conditions && entities.conditions.length > 0 && (
              <div className="bg-red-50 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-3 h-3 text-red-600 mr-1" />
                  <span className="text-xs font-medium text-red-800">Medical Conditions</span>
                </div>
                <div className="space-y-2">
                  {entities.conditions.map((condition, index) => (
                    <div key={index} className="bg-white p-2 rounded border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          {safeRender(condition.text)}
                        </span>
                        {condition.code && (
                          <span className="text-xs text-gray-500 font-mono">
                            {safeRender(condition.code)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Transformed FHIR Parameters */}
          <div className="space-y-4">
            <div className="flex items-center mb-3">
              <ArrowRight className="w-4 h-4 text-blue-600 mr-2" />
              <h4 className="text-sm font-semibold text-gray-800">FHIR Search Parameters</h4>
            </div>

            {/* Resource Type */}
            {fhirParams.resource_type && (
              <div className="bg-indigo-50 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Code className="w-3 h-3 text-indigo-600 mr-1" />
                  <span className="text-xs font-medium text-indigo-800">Resource Type</span>
                </div>
                <code className="text-sm font-mono text-indigo-900 bg-white px-2 py-1 rounded border">
                  {fhirParams.resource_type}
                </code>
              </div>
            )}

            {/* Search Parameters */}
            {fhirParams.search_params && Object.keys(fhirParams.search_params).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <Search className="w-3 h-3 text-gray-600 mr-1" />
                  <span className="text-xs font-medium text-gray-800">Search Parameters</span>
                </div>
                <div className="space-y-2">
                  {Object.entries(fhirParams.search_params).map(([key, value]) => (
                    <div key={key} className="bg-white p-2 rounded border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700">{key}</span>
                        <code className="text-xs font-mono text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                          {safeRender(value)}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Include Parameters */}
            {fhirParams.include && fhirParams.include.length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <Code className="w-3 h-3 text-yellow-600 mr-1" />
                  <span className="text-xs font-medium text-yellow-800">Include</span>
                </div>
                <div className="space-y-1">
                  {fhirParams.include.map((include, index) => (
                    <code key={index} className="text-xs font-mono text-yellow-900 bg-white px-2 py-1 rounded border block">
                      {safeRender(include)}
                    </code>
                  ))}
                </div>
              </div>
            )}

            {/* Sort Parameters */}
            {fhirParams.sort && fhirParams.sort.length > 0 && (
              <div className="bg-cyan-50 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <ArrowRight className="w-3 h-3 text-cyan-600 mr-1" />
                  <span className="text-xs font-medium text-cyan-800">Sort</span>
                </div>
                <div className="space-y-1">
                  {fhirParams.sort.map((sortField, index) => (
                    <code key={index} className="text-xs font-mono text-cyan-900 bg-white px-2 py-1 rounded border block">
                      {safeRender(sortField)}
                    </code>
                  ))}
                </div>
              </div>
            )}

            {/* Count */}
            {fhirParams.count && (
              <div className="bg-orange-50 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Activity className="w-3 h-3 text-orange-600 mr-1" />
                  <span className="text-xs font-medium text-orange-800">Result Limit</span>
                </div>
                <code className="text-sm font-mono text-orange-900 bg-white px-2 py-1 rounded border">
                  {fhirParams.count}
                </code>
              </div>
            )}
          </div>
        </div>

        {/* Raw BioBERT Entities Detection */}
        {entities.raw_biobert_entities && entities.raw_biobert_entities.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center mb-3">
              <Brain className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm font-semibold text-purple-800">Raw BioBERT Entity Detection</span>
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                {entities.raw_biobert_entities.length} detected
              </span>
            </div>
            <p className="text-xs text-purple-700 mb-3">Complete list of all medical entities detected by the BioBERT NER model:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {entities.raw_biobert_entities.map((entity, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-purple-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {entity.label}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {(entity.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-900 font-medium">
                    {entity.text}
                  </div>
                  {entity.start !== undefined && entity.end !== undefined && (
                    <div className="text-xs text-gray-500 mt-1">
                      Position: {entity.start}-{entity.end}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-3 p-3 bg-purple-100 rounded-lg">
              <p className="text-xs text-purple-700">
                <strong>Note:</strong> This shows all entities detected by BioBERT with confidence scores. 
                The system uses additional filtering and processing to determine which entities are used for the actual FHIR search.
              </p>
            </div>
          </div>
        )}

        {/* Generated FHIR URL */}
        {results.fhir_url && (
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Code className="w-4 h-4 text-green-400 mr-2" />
              <span className="text-sm font-medium text-gray-200">Generated FHIR URL</span>
            </div>
            <code className="text-xs text-green-400 font-mono break-all block bg-gray-800 p-3 rounded">
              {results.fhir_url}
            </code>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryAnalysis;
