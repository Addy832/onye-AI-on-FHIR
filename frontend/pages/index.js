import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  Stethoscope, 
  Brain, 
  Shield, 
  Activity,
  AlertCircle,
  CheckCircle,
  Info,
  ExternalLink
} from 'lucide-react';

// Components
import SearchInput from '../components/SearchInput';
import DataTable from '../components/DataTable';
import ChartsDashboard, { ChartsLoading } from '../components/DataCharts';
import QueryAnalysis from '../components/QueryAnalysis';
import BackendStatus from '../components/BackendStatus';

// Hooks
import { useHealthcareQuery, useExamples } from '../hooks/useHealthcareData';

// Utils
import { healthCheck } from '../utils/api';

export default function Home() {
  const [activeTab, setActiveTab] = useState('charts');
  const [apiStatus, setApiStatus] = useState('checking');
  
  // Healthcare query hook
  const {
    query,
    setQuery,
    results,
    loading,
    error,
    queryHistory,
    executeQuery,
    clearResults,
  } = useHealthcareQuery();
  
  // Examples hook
  const { examples, loading: examplesLoading } = useExamples();
  
  // Check API health on mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        await healthCheck();
        setApiStatus('healthy');
      } catch (err) {
        setApiStatus('error');
        console.error('API health check failed:', err);
      }
    };
    
    checkApiHealth();
  }, []);
  
  // Handle query submission
  const handleQuerySubmit = async (searchQuery) => {
    await executeQuery(searchQuery, 10);
  };
  
  // Handle example query click
  const handleExampleClick = (exampleQuery) => {
    setQuery(exampleQuery);
    handleQuerySubmit(exampleQuery);
  };
  
  return (
    <>
      <Head>
        <title>AI on FHIR - Healthcare Data Querying System</title>
        <meta name="description" content="Natural language querying for FHIR-compliant healthcare data" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex items-center">
                  <div className="p-2 bg-medical-100 rounded-lg mr-3">
                    <Stethoscope className="w-6 h-6 text-medical-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">AI on FHIR</h1>
                    <p className="text-xs text-gray-500">Healthcare Data Querying</p>
                  </div>
                </div>
              </div>
              
              {/* API Status Indicator */}
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  apiStatus === 'healthy' 
                    ? 'bg-health-100 text-health-700' 
                    : apiStatus === 'error'
                    ? 'bg-danger-100 text-danger-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {apiStatus === 'healthy' ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      API Connected
                    </>
                  ) : apiStatus === 'error' ? (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      API Offline
                    </>
                  ) : (
                    <>
                      <Activity className="w-4 h-4 animate-pulse" />
                      Checking...
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Brain className="w-12 h-12 text-medical-600 mr-3" />
              <Shield className="w-12 h-12 text-health-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Natural Language Healthcare Queries
            </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Ask questions about patient data in plain English. Our AI processes your queries 
                and returns FHIR-compliant healthcare information with interactive visualizations.
              </p>
            
            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="medical-card p-6 text-center">
                <Brain className="w-8 h-8 text-medical-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Smart NLP Processing</h3>
                <p className="text-sm text-gray-600">Advanced natural language understanding for healthcare queries</p>
              </div>
              <div className="health-card p-6 text-center">
                <Activity className="w-8 h-8 text-health-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">FHIR Compliant</h3>
                <p className="text-sm text-gray-600">Standards-based healthcare data interoperability</p>
              </div>
              <div className="medical-card p-6 text-center">
                <Shield className="w-8 h-8 text-medical-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">HIPAA Secure</h3>
                <p className="text-sm text-gray-600">Healthcare-grade security and privacy protection</p>
              </div>
            </div>
          </div>

          {/* Backend Status and Search Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Backend Status Sidebar */}
            <div className="lg:col-span-1">
              <BackendStatus />
            </div>
            
            {/* Search Section */}
            <div className="lg:col-span-2">
              <div className="medical-card p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                  Ask Your Healthcare Question
                </h3>
                
                <SearchInput
                  value={query}
                  onChange={setQuery}
                  onSubmit={handleQuerySubmit}
                  loading={loading}
                  queryHistory={queryHistory}
                  placeholder="e.g., Show me all diabetic patients over 50..."
                />
                
                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-4 bg-danger-50 border border-danger-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-danger-600 mr-2" />
                      <span className="text-danger-700 font-medium">Query Error</span>
                    </div>
                    <p className="text-danger-600 mt-1">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Example Queries */}
          {!results && !loading && examples.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Try These Example Queries
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {examples.slice(0, 4).map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example.query)}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:border-medical-300 hover:shadow-md transition-all duration-200 text-left group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 group-hover:text-medical-700 mb-1">
                          "{example.query}"
                        </p>
                        <p className="text-sm text-gray-500">{example.description}</p>
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-medical-100 text-medical-700">
                            {example.use_case}
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-medical-600 ml-2 flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results Section */}
          {(results || loading) && (
            <div className="space-y-8">
              {/* Query Info */}
              {results && (
                <div className="bg-medical-50 border border-medical-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Info className="w-5 h-5 text-medical-600 mr-2" />
                      <div>
                        <p className="font-medium text-medical-900">
                          Query: "{results.query}"
                        </p>
                        <p className="text-sm text-medical-700">
                          Found {results.statistics?.total_patients || 0} patients • 
                          Processed in {results.processing_time_ms ? `${results.processing_time_ms}ms` : 'unknown time'}
                          {results.features_used?.advanced_nlp && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              Advanced NLP
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={clearResults}
                      className="text-medical-600 hover:text-medical-800 text-sm"
                    >
                      Clear Results
                    </button>
                  </div>
                  
                </div>
              )}
              
              {/* Query Analysis - New Component */}
              <QueryAnalysis results={results} loading={loading} />

              {/* Data Visualization Tabs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                    <button
                      onClick={() => setActiveTab('charts')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'charts'
                          ? 'border-medical-500 text-medical-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Activity className="w-4 h-4 inline mr-2" />
                      Data Visualization
                    </button>
                    <button
                      onClick={() => setActiveTab('table')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'table'
                          ? 'border-medical-500 text-medical-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Activity className="w-4 h-4 inline mr-2" />
                      Data Table
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'charts' && (
                    <>
                      {loading ? (
                        <ChartsLoading />
                      ) : (
                        <ChartsDashboard statistics={results?.statistics} />
                      )}
                    </>
                  )}
                  
                  {activeTab === 'table' && (
                    <DataTable 
                      results={results}
                      loading={loading}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                Built for the AI on FHIR Full-Stack Engineer Assessment
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Demonstrating healthcare data interoperability, NLP processing, and HIPAA-compliant design
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
