import { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  Download, 
  User,
  Calendar,
  MapPin,
  Phone,
  Heart,
  Search,
  X
} from 'lucide-react';
import { formatPatientData, formatDate, calculateAge } from '../utils/api';

const DataTable = ({ 
  results, 
  loading = false,
  onFilterChange,
  className = ''
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    gender: '',
    ageRange: '',
    condition: '',
  });

  // Extract patient and condition data
  const { patients, conditions } = useMemo(() => {
    if (!results?.results?.entry) {
      return { patients: [], conditions: [] };
    }

    const patientEntries = results.results.entry.filter(
      entry => entry.resource.resourceType === 'Patient'
    );
    const conditionEntries = results.results.entry.filter(
      entry => entry.resource.resourceType === 'Condition'
    );

    const formattedPatients = formatPatientData(
      patientEntries.map(entry => entry.resource)
    );

    // Add condition information to patients
    const patientsWithConditions = formattedPatients.map(patient => {
      const patientConditions = conditionEntries
        .filter(entry => 
          entry.resource.subject?.reference?.includes(patient.id)
        )
        .map(entry => ({
          code: entry.resource.code?.coding?.[0]?.code,
          display: entry.resource.code?.coding?.[0]?.display,
          status: entry.resource.clinicalStatus?.coding?.[0]?.display,
          onsetDate: entry.resource.onsetDateTime,
        }));

      return {
        ...patient,
        conditions: patientConditions,
        primaryCondition: patientConditions[0]?.display || 'None specified',
      };
    });

    return {
      patients: patientsWithConditions,
      conditions: conditionEntries.map(entry => entry.resource),
    };
  }, [results]);

  // Filter and search patients
  const filteredPatients = useMemo(() => {
    let filtered = [...patients];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.primaryCondition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.gender) {
      filtered = filtered.filter(patient => 
        patient.gender.toLowerCase() === filters.gender.toLowerCase()
      );
    }

    if (filters.ageRange) {
      const [min, max] = filters.ageRange.split('-').map(Number);
      filtered = filtered.filter(patient => {
        const age = typeof patient.age === 'number' ? patient.age : 0;
        return max ? (age >= min && age <= max) : age >= min;
      });
    }

    return filtered;
  }, [patients, searchTerm, filters]);

  // Sort patients
  const sortedPatients = useMemo(() => {
    if (!sortConfig.key) return filteredPatients;

    return [...filteredPatients].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      let comparison = 0;
      if (aVal > bVal) comparison = 1;
      if (aVal < bVal) comparison = -1;

      return sortConfig.direction === 'desc' ? comparison * -1 : comparison;
    });
  }, [filteredPatients, sortConfig]);

  // Pagination
  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedPatients.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedPatients, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedPatients.length / itemsPerPage);

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({ gender: '', ageRange: '', condition: '' });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      ['Name', 'Gender', 'Age', 'Address', 'Phone', 'Primary Condition', 'Marital Status'].join(','),
      ...sortedPatients.map(patient => [
        patient.name,
        patient.gender,
        patient.age,
        patient.address,
        patient.phone,
        patient.primaryCondition,
        patient.maritalStatus,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'patient-data.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Render sort icon
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ChevronDown className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-medical-600" /> : 
      <ChevronDown className="w-4 h-4 text-medical-600" />;
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="medical-table">
          <table className="w-full">
            <thead>
              <tr>
                {['Name', 'Gender', 'Age', 'Address', 'Condition'].map((header, i) => (
                  <th key={i}>
                    <div className="h-4 bg-gray-200 rounded loading-shimmer"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j}>
                      <div className="h-4 bg-gray-100 rounded loading-shimmer"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!results || !patients.length) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12 text-gray-500">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No patient data available</p>
          <p className="text-sm mt-2">Submit a query to see patient information</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Table Header with Controls */}
      <div className="bg-white rounded-t-xl border border-medical-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="w-5 h-5 text-medical-600 mr-2" />
              Patient Data ({sortedPatients.length} patients)
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Healthcare information for query results
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patients..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 text-sm w-full sm:w-64"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="btn-outline flex items-center px-4 py-2 text-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-4">
          {/* Gender Filter */}
          <select
            value={filters.gender}
            onChange={(e) => handleFilterChange('gender', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 text-sm"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          {/* Age Range Filter */}
          <select
            value={filters.ageRange}
            onChange={(e) => handleFilterChange('ageRange', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 text-sm"
          >
            <option value="">All Ages</option>
            <option value="0-30">0-30 years</option>
            <option value="31-50">31-50 years</option>
            <option value="51-65">51-65 years</option>
            <option value="66-120">65+ years</option>
          </select>

          {/* Clear Filters */}
          {(filters.gender || filters.ageRange || searchTerm) && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 flex items-center"
            >
              <X className="w-4 h-4 mr-1" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="medical-table rounded-t-none border-t-0">
        <table className="w-full">
          <thead>
            <tr>
              <th 
                className="cursor-pointer hover:bg-medical-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center justify-between">
                  Name
                  {renderSortIcon('name')}
                </div>
              </th>
              <th 
                className="cursor-pointer hover:bg-medical-100"
                onClick={() => handleSort('gender')}
              >
                <div className="flex items-center justify-between">
                  Gender
                  {renderSortIcon('gender')}
                </div>
              </th>
              <th 
                className="cursor-pointer hover:bg-medical-100"
                onClick={() => handleSort('age')}
              >
                <div className="flex items-center justify-between">
                  Age
                  {renderSortIcon('age')}
                </div>
              </th>
              <th>Address</th>
              <th>Contact</th>
              <th>Primary Condition</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPatients.map((patient, index) => (
              <tr key={patient.id || index}>
                <td>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-medical-100 rounded-full flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-medical-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{patient.name}</div>
                      <div className="text-xs text-gray-500">ID: {patient.id?.slice(0, 8) || 'N/A'}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    patient.gender === 'male' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-pink-100 text-pink-700'
                  }`}>
                    {patient.gender}
                  </span>
                </td>
                <td>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    {patient.age} years
                  </div>
                </td>
                <td>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm">{patient.address}</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm">{patient.phone}</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center">
                    <Heart className="w-4 h-4 text-danger-400 mr-2" />
                    <span className="text-sm">{patient.primaryCondition}</span>
                  </div>
                </td>
                <td>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white border border-medical-100 border-t-0 rounded-b-xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, sortedPatients.length)} to{' '}
              {Math.min(currentPage * itemsPerPage, sortedPatients.length)} of{' '}
              {sortedPatients.length} results
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (page > totalPages) return null;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm border rounded-lg ${
                        currentPage === page
                          ? 'bg-medical-600 text-white border-medical-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
