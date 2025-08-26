import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  Heart,
  Brain,
  Pill,
  TrendingUp,
  Shield,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  Info,
  Loader
} from 'lucide-react';

const ClinicalRiskDashboard = ({ patients = [], onRiskPrediction = () => {} }) => {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [populationAnalysis, setPopulationAnalysis] = useState(null);

  // Risk category colors and icons
  const getRiskStyle = (category) => {
    switch (category?.toLowerCase()) {
      case 'high':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          icon: AlertTriangle
        };
      case 'medium':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          icon: AlertCircle
        };
      case 'low':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600',
          icon: CheckCircle
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600',
          icon: Info
        };
    }
  };

  // Get risk score color
  const getRiskScoreColor = (score) => {
    if (score >= 0.7) return 'text-red-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Predict risks for all patients
  const predictPopulationRisk = async () => {
    if (!patients || patients.length === 0) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/risk/population', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patients: patients
        })
      });

      if (response.ok) {
        const result = await response.json();
        setPopulationAnalysis(result.population_analysis);
        onRiskPrediction(result.population_analysis);
      } else {
        console.error('Failed to get population risk analysis');
      }
    } catch (error) {
      console.error('Error predicting population risk:', error);
    } finally {
      setLoading(false);
    }
  };

  // Predict risk for individual patient
  const predictPatientRisk = async (patient) => {
    setLoading(true);
    setSelectedPatient(patient);

    try {
      const response = await fetch('http://localhost:5000/api/risk/patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: patient.id,
          patient_data: patient
        })
      });

      if (response.ok) {
        const result = await response.json();
        setRiskData(result);
      } else {
        console.error('Failed to get patient risk prediction');
      }
    } catch (error) {
      console.error('Error predicting patient risk:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-run population analysis when patients change
  useEffect(() => {
    if (patients && patients.length > 0) {
      predictPopulationRisk();
    }
  }, [patients]);

  if (!patients || patients.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Clinical Risk Prediction</h3>
          <p>No patients available for risk assessment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <Brain className="w-8 h-8 mr-3" />
              Clinical Risk Prediction
            </h2>
            <p className="text-blue-100 mt-1">AI-powered risk assessment for clinical decision support</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{patients.length}</div>
            <div className="text-blue-100">Patients</div>
          </div>
        </div>
      </div>

      {/* Population Risk Analysis */}
      {populationAnalysis && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-600" />
            Population Risk Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {populationAnalysis.high_risk_patients || 0}
                  </div>
                  <div className="text-sm text-red-700">High Risk Patients</div>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {((populationAnalysis.average_readmission_risk || 0) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-700">Avg Readmission Risk</div>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {((populationAnalysis.average_mortality_risk || 0) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-purple-700">Avg Mortality Risk</div>
                </div>
                <Heart className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Risk Distribution */}
          {populationAnalysis.risk_distribution && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-800 mb-3">Risk Distribution</h4>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                  <span className="text-sm">High Risk: {populationAnalysis.risk_distribution.high}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                  <span className="text-sm">Medium Risk: {populationAnalysis.risk_distribution.medium}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span className="text-sm">Low Risk: {populationAnalysis.risk_distribution.low}</span>
                </div>
              </div>
            </div>
          )}

          {/* Population Recommendations */}
          {populationAnalysis.population_recommendations && populationAnalysis.population_recommendations.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                <Zap className="w-4 h-4 mr-2 text-orange-500" />
                Population Recommendations
              </h4>
              <ul className="space-y-2">
                {populationAnalysis.population_recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Patient List with Risk Prediction */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Individual Risk Assessment
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((patient, index) => (
              <div
                key={patient.id || index}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => predictPatientRisk(patient)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {patient.name?.[0]?.given?.[0] || 'Unknown'} {patient.name?.[0]?.family || 'Patient'}
                    </h4>
                    <p className="text-sm text-gray-600">ID: {patient.id}</p>
                  </div>
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <Brain className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Age:</span> {patient.age || 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Gender:</span> {patient.gender || 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Conditions:</span> {patient.conditions?.length || 0}
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <span className="text-xs font-medium text-blue-600">Click for Risk Assessment</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Individual Patient Risk Details Modal/Panel */}
      {selectedPatient && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Risk Assessment: {selectedPatient.name?.[0]?.given?.[0] || 'Unknown'} {selectedPatient.name?.[0]?.family || 'Patient'}
                </h3>
                <p className="text-sm text-gray-600">Patient ID: {selectedPatient.id}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedPatient(null);
                  setRiskData(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                <span className="text-gray-600">Analyzing patient data...</span>
              </div>
            ) : riskData ? (
              <div className="space-y-6">
                {/* Risk Scores Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Readmission Risk */}
                  {riskData.risks.readmission && (
                    <div className={`rounded-lg p-4 ${getRiskStyle(riskData.risks.readmission.category).bgColor} ${getRiskStyle(riskData.risks.readmission.category).borderColor} border`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Activity className={`w-5 h-5 mr-2 ${getRiskStyle(riskData.risks.readmission.category).iconColor}`} />
                          <span className="font-semibold text-gray-900">30-Day Readmission</span>
                        </div>
                        <span className={`text-2xl font-bold ${getRiskScoreColor(riskData.risks.readmission.score)}`}>
                          {(riskData.risks.readmission.score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className={`text-xs uppercase font-medium ${getRiskStyle(riskData.risks.readmission.category).textColor} mb-2`}>
                        {riskData.risks.readmission.category} Risk
                      </div>
                      <div className="text-xs text-gray-600">
                        Confidence: {(riskData.risks.readmission.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}

                  {/* Mortality Risk */}
                  {riskData.risks.mortality && (
                    <div className={`rounded-lg p-4 ${getRiskStyle(riskData.risks.mortality.category).bgColor} ${getRiskStyle(riskData.risks.mortality.category).borderColor} border`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Heart className={`w-5 h-5 mr-2 ${getRiskStyle(riskData.risks.mortality.category).iconColor}`} />
                          <span className="font-semibold text-gray-900">1-Year Mortality</span>
                        </div>
                        <span className={`text-2xl font-bold ${getRiskScoreColor(riskData.risks.mortality.score)}`}>
                          {(riskData.risks.mortality.score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className={`text-xs uppercase font-medium ${getRiskStyle(riskData.risks.mortality.category).textColor} mb-2`}>
                        {riskData.risks.mortality.category} Risk
                      </div>
                      <div className="text-xs text-gray-600">
                        Confidence: {(riskData.risks.mortality.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}

                  {/* Disease Progression Risk */}
                  {riskData.risks.disease_progression && (
                    <div className={`rounded-lg p-4 ${getRiskStyle(riskData.risks.disease_progression.category).bgColor} ${getRiskStyle(riskData.risks.disease_progression.category).borderColor} border`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <TrendingUp className={`w-5 h-5 mr-2 ${getRiskStyle(riskData.risks.disease_progression.category).iconColor}`} />
                          <span className="font-semibold text-gray-900">Disease Progression</span>
                        </div>
                        <span className={`text-2xl font-bold ${getRiskScoreColor(riskData.risks.disease_progression.score)}`}>
                          {(riskData.risks.disease_progression.score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className={`text-xs uppercase font-medium ${getRiskStyle(riskData.risks.disease_progression.category).textColor} mb-2`}>
                        {riskData.risks.disease_progression.category} Risk
                      </div>
                      <div className="text-xs text-gray-600">
                        Confidence: {(riskData.risks.disease_progression.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}

                  {/* Medication Adherence Risk */}
                  {riskData.risks.medication_adherence && (
                    <div className={`rounded-lg p-4 ${getRiskStyle(riskData.risks.medication_adherence.category).bgColor} ${getRiskStyle(riskData.risks.medication_adherence.category).borderColor} border`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Pill className={`w-5 h-5 mr-2 ${getRiskStyle(riskData.risks.medication_adherence.category).iconColor}`} />
                          <span className="font-semibold text-gray-900">Med Non-Adherence</span>
                        </div>
                        <span className={`text-2xl font-bold ${getRiskScoreColor(riskData.risks.medication_adherence.score)}`}>
                          {(riskData.risks.medication_adherence.score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className={`text-xs uppercase font-medium ${getRiskStyle(riskData.risks.medication_adherence.category).textColor} mb-2`}>
                        {riskData.risks.medication_adherence.category} Risk
                      </div>
                      <div className="text-xs text-gray-600">
                        Confidence: {(riskData.risks.medication_adherence.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Overall Summary */}
                {riskData.overall_summary && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-gray-600" />
                      Overall Risk Summary
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Category:</span>
                        <div className={`font-semibold ${getRiskStyle(riskData.overall_summary.overall_risk_category).textColor}`}>
                          {riskData.overall_summary.overall_risk_category?.toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg Score:</span>
                        <div className="font-semibold text-gray-900">
                          {(riskData.overall_summary.average_risk_score * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Highest Risk:</span>
                        <div className="font-semibold text-gray-900">
                          {(riskData.overall_summary.highest_risk_score * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Recommendations:</span>
                        <div className="font-semibold text-gray-900">
                          {riskData.overall_summary.total_recommendations}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Clinical Recommendations */}
                {riskData.risks.readmission?.recommendations && riskData.risks.readmission.recommendations.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-blue-600" />
                      Clinical Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {riskData.risks.readmission.recommendations.slice(0, 5).map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Click "Analyze Risk" to generate predictions</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicalRiskDashboard;
