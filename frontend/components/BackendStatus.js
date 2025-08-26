import React, { useState, useEffect } from 'react';
import { 
  Server,
  Database,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  Layers,
  Clock,
  Globe,
  HardDrive
} from 'lucide-react';
import { healthCheck } from '../utils/api';

const BackendStatus = () => {
  const [backendInfo, setBackendInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBackendInfo = async () => {
      try {
        setLoading(true);
        const healthData = await healthCheck();
        setBackendInfo(healthData);
        setError(null);
      } catch (err) {
        setError(err.message);
        setBackendInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBackendInfo();
    
    // Poll for backend status every 30 seconds
    const interval = setInterval(fetchBackendInfo, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse flex items-center">
          <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  const isOnline = !error && backendInfo;
  const backendType = getBackendType(backendInfo);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${
      isOnline ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'
    }`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-3 ${
              isOnline ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isOnline ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Backend Status</h3>
              <p className="text-xs text-gray-600">
                {isOnline ? 'Connected' : 'Offline'}
              </p>
            </div>
          </div>
          
          {/* Connection Indicator */}
          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isOnline 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 mr-1" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {isOnline ? (
          <>
            {/* Backend Type and Version */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Server className="w-3 h-3 text-blue-600 mr-1" />
                  <span className="text-xs font-medium text-blue-800">Service</span>
                </div>
                <p className="text-sm font-mono text-blue-900">
                  {backendInfo.service || 'AI on FHIR Backend'}
                </p>
                {backendInfo.version && (
                  <p className="text-xs text-blue-700">v{backendInfo.version}</p>
                )}
              </div>

              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <Database className="w-3 h-3 text-purple-600 mr-1" />
                  <span className="text-xs font-medium text-purple-800">Data Source</span>
                </div>
                <p className="text-xs font-semibold text-purple-900">
                  {backendType.name}
                </p>
                <p className="text-xs text-purple-700">
                  {backendType.description}
                </p>
              </div>
            </div>

            {/* Features */}
            {backendInfo.features && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <Layers className="w-3 h-3 text-gray-600 mr-1" />
                  <span className="text-xs font-medium text-gray-800">Features</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(backendInfo.features).map(([feature, enabled]) => (
                    <span 
                      key={feature}
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        enabled 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {enabled ? '✓' : '✗'} {formatFeatureName(feature)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* FHIR Server Info */}
            {backendInfo.fhir_server && (
              <div className="bg-cyan-50 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <Globe className="w-3 h-3 text-cyan-600 mr-1" />
                  <span className="text-xs font-medium text-cyan-800">FHIR Server</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs">
                    <span className="font-medium">Name:</span> {backendInfo.fhir_server.name || 'Unknown'}
                  </p>
                  <p className="text-xs">
                    <span className="font-medium">Version:</span> {backendInfo.fhir_server.fhirVersion || 'Unknown'}
                  </p>
                  {backendInfo.fhir_server.url && (
                    <p className="text-xs break-all">
                      <span className="font-medium">URL:</span> {backendInfo.fhir_server.url}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Last Updated */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Last checked: {new Date().toLocaleTimeString()}
              </div>
              {backendInfo.timestamp && (
                <div>
                  Server time: {new Date(backendInfo.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <WifiOff className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-600 font-medium mb-1">Backend Unavailable</p>
            <p className="text-xs text-gray-600">
              Cannot connect to the backend server. Please ensure the Python server is running on localhost:5000.
            </p>
            <div className="mt-3 p-2 bg-red-50 rounded border-l-4 border-red-400">
              <p className="text-xs text-red-700">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to determine backend type
function getBackendType(backendInfo) {
  if (!backendInfo) {
    return { name: 'Unknown', description: 'Backend unavailable' };
  }

  // Check for FHIR server info to determine if it's using real FHIR or simulator
  if (backendInfo.fhir_server) {
    return {
      name: 'Real FHIR Server',
      description: `Connected to ${backendInfo.fhir_server.name || 'HAPI FHIR'}`
    };
  }

  // Check service name
  if (backendInfo.service && backendInfo.service.includes('Enhanced')) {
    return {
      name: 'Enhanced Backend',
      description: 'Advanced NLP with fallback options'
    };
  }

  return {
    name: 'FHIR Simulator',
    description: 'Local simulated healthcare data'
  };
}

// Helper function to format feature names
function formatFeatureName(feature) {
  return feature
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace('Nlp', 'NLP')
    .replace('Api', 'API');
}

export default BackendStatus;
