import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Users, Activity, Heart, TrendingUp } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

// Chart configuration
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: 'rgba(14, 165, 233, 0.8)',
      borderWidth: 1,
    },
  },
};

// Age Distribution Chart
export const AgeDistributionChart = ({ data, title = "Age Distribution" }) => {
  if (!data || Object.keys(data).length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-500">No age data available</div>;
  }

  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: 'Number of Patients',
        data: Object.values(data),
        backgroundColor: [
          'rgba(14, 165, 233, 0.6)',
          'rgba(34, 197, 94, 0.6)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(239, 68, 68, 0.6)',
          'rgba(147, 51, 234, 0.6)',
          'rgba(236, 72, 153, 0.6)',
        ],
        borderColor: [
          'rgba(14, 165, 233, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(147, 51, 234, 1)',
          'rgba(236, 72, 153, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <div className="flex items-center mb-4">
        <Users className="w-5 h-5 text-medical-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

// Gender Distribution Chart
export const GenderDistributionChart = ({ data, title = "Gender Distribution" }) => {
  if (!data || Object.keys(data).length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-500">No gender data available</div>;
  }

  const chartData = {
    labels: Object.keys(data).map(key => key.charAt(0).toUpperCase() + key.slice(1)),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(14, 165, 233, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(14, 165, 233, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <div className="flex items-center mb-4">
        <Activity className="w-5 h-5 text-medical-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="h-64">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

// Condition Distribution Chart
export const ConditionDistributionChart = ({ data, title = "Medical Conditions" }) => {
  if (!data || Object.keys(data).length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-500">No condition data available</div>;
  }

  // Truncate long condition names for display
  const truncateLabel = (label, maxLength = 30) => {
    if (label.length <= maxLength) return label;
    return label.substring(0, maxLength) + '...';
  };

  const chartData = {
    labels: Object.keys(data).map(label => truncateLabel(label)),
    datasets: [
      {
        label: 'Number of Cases',
        data: Object.values(data),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    ...chartOptions,
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <div className="flex items-center mb-4">
        <Heart className="w-5 h-5 text-medical-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

// Statistics Summary Cards
export const StatsSummary = ({ statistics }) => {
  if (!statistics) {
    return <div className="text-center text-gray-500">No statistics available</div>;
  }

  const stats = [
    {
      label: 'Total Patients',
      value: statistics.total_patients || 0,
      icon: Users,
      color: 'text-medical-600',
      bgColor: 'bg-medical-50',
    },
    {
      label: 'Medical Conditions',
      value: statistics.total_conditions || 0,
      icon: Heart,
      color: 'text-danger-600',
      bgColor: 'bg-danger-50',
    },
    {
      label: 'Average Age',
      value: statistics.average_age ? `${Math.round(statistics.average_age)} years` : 'N/A',
      icon: TrendingUp,
      color: 'text-health-600',
      bgColor: 'bg-health-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        
        return (
          <div key={index} className="medical-card p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor} mr-4`}>
                <IconComponent className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Combined Charts Dashboard
export const ChartsDashboard = ({ statistics, className = '' }) => {
  if (!statistics) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No data to visualize</p>
          <p className="text-sm mt-2">Submit a query to see charts and statistics</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Statistics Summary */}
      <StatsSummary statistics={statistics} />
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Age Distribution */}
        {statistics.age_distribution && (
          <AgeDistributionChart 
            data={statistics.age_distribution}
            title="Patient Age Distribution"
          />
        )}
        
        {/* Gender Distribution */}
        {statistics.gender_distribution && (
          <GenderDistributionChart 
            data={statistics.gender_distribution}
            title="Patient Gender Distribution"
          />
        )}
      </div>
      
      {/* Condition Distribution - Full Width */}
      {statistics.condition_distribution && Object.keys(statistics.condition_distribution).length > 0 && (
        <div className="mt-8">
          <ConditionDistributionChart 
            data={statistics.condition_distribution}
            title="Medical Conditions Distribution"
          />
        </div>
      )}
    </div>
  );
};

// Loading state for charts
export const ChartsLoading = () => {
  return (
    <div className="space-y-8">
      {/* Stats Loading */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="medical-card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg loading-shimmer mr-4"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded loading-shimmer mb-2"></div>
                <div className="h-4 bg-gray-200 rounded loading-shimmer w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Charts Loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="chart-container">
            <div className="h-6 bg-gray-200 rounded loading-shimmer mb-4 w-48"></div>
            <div className="h-64 bg-gray-100 rounded loading-shimmer"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartsDashboard;
