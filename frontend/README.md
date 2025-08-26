# AI on FHIR Frontend Application

Modern, responsive React frontend for the AI on FHIR healthcare data querying system. Built with Next.js 13, Tailwind CSS, and Chart.js for an optimal user experience.

## 🎨 Overview

The frontend provides an intuitive interface for healthcare professionals to query patient data using natural language. It features real-time query processing, interactive data visualizations, and comprehensive result displays with BioBERT entity extraction transparency.

### Key Features

- **Natural Language Interface**: Simple search input for complex healthcare queries
- **Real-time Processing**: Live query analysis and result updates
- **BioBERT Transparency**: Display raw entity extraction results with confidence scores
- **Interactive Visualizations**: Patient demographics and condition analytics with Chart.js
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI Components**: Tailwind CSS styling with Lucide React icons
- **FHIR Data Display**: Comprehensive patient and condition information

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │  React Components│    │  Backend API    │
│                 │    │                 │    │                 │
│ - Pages Router  │────┤ - Search Input  │────┤ - Query Endpoint│
│ - Static Build  │    │ - Data Display  │    │ - Examples API  │
│ - CSS Framework │    │ - Charts/Tables │    │ - FHIR Data     │
│ - Asset Opt.    │    │ - Raw Entities  │    │ - Health Check  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 8.x or higher
- **Backend API** running on `http://127.0.0.1:5000`

### Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open browser to:**
   ```
   http://localhost:3000
   ```

### Production Build

```bash
npm run build
npm start
```

## 📋 Available Scripts

### Development
```bash
npm run dev          # Start development server with hot reload
npm run lint         # Run ESLint for code quality checks
npm run test         # Run Jest test suite
npm run test:watch   # Run tests in watch mode
```

### Production
```bash
npm run build        # Build optimized production bundle
npm start           # Start production server
npm run export      # Export static files (if configured)
```

## 🧩 Component Architecture

### Core Components

#### `pages/index.js`
Main application page with search interface and results display.

#### `components/SearchInput.jsx`
Primary search interface with query input and submission handling.

**Props:**
- `onSearch(query)`: Callback function for query submission
- `loading`: Boolean to show/hide loading states
- `placeholder`: Custom placeholder text

**Features:**
- Real-time input validation
- Loading states during query processing
- Query history (local storage)
- Auto-complete suggestions (configurable)

#### `components/QueryAnalysis.js`
Comprehensive display of NLP processing results and entity extraction.

**Props:**
- `results`: Complete API response object
- `loading`: Loading state boolean

**Features:**
- Original query display
- Extracted entities with confidence scores
- Raw BioBERT entity visualization
- FHIR parameter transformation
- Color-coded entity categories

#### `components/DataTable.jsx`
Patient data display in tabular format with sorting and filtering.

**Props:**
- `data`: Array of patient records
- `columns`: Table column configuration
- `sortable`: Enable/disable sorting
- `filterable`: Enable/disable filtering

**Features:**
- Sortable columns
- Row selection
- Pagination support
- Export functionality (CSV/JSON)

#### `components/DataCharts.jsx`
Interactive data visualizations using Chart.js.

**Props:**
- `statistics`: Summary statistics from API
- `chartType`: Chart type ('bar', 'pie', 'line')
- `data`: Chart data array

**Chart Types:**
- Age distribution histograms
- Gender distribution pie charts
- Condition frequency bar charts
- Temporal trend line charts

#### `components/BackendStatus.js`
Backend connectivity and health status indicator.

**Features:**
- Real-time health check monitoring
- Connection status indicators
- Error state handling
- Automatic retry logic

### Utility Components

#### `components/ClinicalRiskDashboard.js`
Advanced dashboard for clinical analytics and risk assessment.

**Features:**
- Patient risk scoring
- Population health metrics
- Comparative analytics
- Trend analysis visualizations

## 🎨 Styling and Design

### Tailwind CSS Configuration

The application uses Tailwind CSS for styling with a custom configuration:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        healthcare: {
          blue: '#0066cc',
          green: '#28a745',
          red: '#dc3545',
          purple: '#6f42c1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

### Design System

#### Color Palette
- **Primary Blue**: Medical/healthcare theme
- **Success Green**: Positive indicators and confirmations
- **Warning Yellow**: Caution states and attention items
- **Error Red**: Error states and critical information
- **Purple**: BioBERT entity highlighting
- **Gray Scale**: Text hierarchy and backgrounds

#### Typography
- **Headers**: Inter font family, semi-bold weights
- **Body Text**: Inter font family, regular weights
- **Code/Data**: Fira Code monospace font
- **Responsive Scale**: Mobile-first responsive typography

#### Component Styling
- **Cards**: Rounded corners, subtle shadows, border accents
- **Buttons**: Consistent padding, hover states, focus indicators
- **Forms**: Tailwind Forms plugin for consistent input styling
- **Tables**: Zebra striping, sortable headers, responsive scrolling

### Responsive Design

#### Breakpoints
- **Mobile**: `< 640px`
- **Tablet**: `640px - 1024px`
- **Desktop**: `> 1024px`

#### Layout Strategy
- Mobile-first CSS approach
- Flexbox and CSS Grid for layouts
- Responsive navigation patterns
- Touch-friendly interactive elements

## 📊 Data Visualization

### Chart.js Integration

The application uses Chart.js for interactive data visualizations:

```javascript
// Example chart configuration
const chartConfig = {
  type: 'bar',
  data: {
    labels: ['Male', 'Female'],
    datasets: [{
      label: 'Patient Count',
      data: [45, 38],
      backgroundColor: ['#3b82f6', '#ec4899'],
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Gender Distribution'
      }
    }
  }
}
```

### Available Chart Types

#### Demographics Charts
- **Age Distribution**: Histogram of patient ages
- **Gender Split**: Pie chart of gender distribution
- **Geographic Distribution**: Bar chart by location (if available)

#### Clinical Charts
- **Condition Frequency**: Bar chart of most common conditions
- **Severity Distribution**: Pie chart of condition severity
- **Treatment Timelines**: Line charts for temporal analysis

#### Custom Visualizations
- **BioBERT Confidence**: Scatter plots of entity confidence scores
- **Query Complexity**: Visual representation of query parsing
- **Response Time Trends**: Performance monitoring charts

## 🔧 Configuration

### Environment Variables

Create `.env.local` for local development:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000/api
NEXT_PUBLIC_API_TIMEOUT=10000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_EXPORT=true
NEXT_PUBLIC_DEBUG_MODE=false

# Chart Configuration
NEXT_PUBLIC_DEFAULT_CHART_TYPE=bar
NEXT_PUBLIC_MAX_CHART_DATA_POINTS=50
```

### Next.js Configuration

```javascript
// next.config.js
module.exports = {
  env: {
    BACKEND_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000',
  },
  images: {
    domains: ['localhost'],
  },
  experimental: {
    optimizeCss: true,
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
}
```

## 🧪 Testing

### Testing Strategy

#### Unit Tests with Jest
```bash
npm test                 # Run all tests
npm run test:watch      # Watch mode for development
npm run test:coverage   # Generate coverage report
```

#### Component Testing
```javascript
// Example test for SearchInput component
import { render, screen, fireEvent } from '@testing-library/react';
import SearchInput from '../components/SearchInput';

test('renders search input with placeholder', () => {
  render(<SearchInput placeholder="Enter query..." />);
  expect(screen.getByPlaceholderText('Enter query...')).toBeInTheDocument();
});

test('calls onSearch when form is submitted', () => {
  const mockOnSearch = jest.fn();
  render(<SearchInput onSearch={mockOnSearch} />);
  
  const input = screen.getByRole('textbox');
  const button = screen.getByRole('button', { name: /search/i });
  
  fireEvent.change(input, { target: { value: 'diabetic patients' } });
  fireEvent.click(button);
  
  expect(mockOnSearch).toHaveBeenCalledWith('diabetic patients');
});
```

#### Integration Tests
- API integration testing
- End-to-end query workflows
- Cross-browser compatibility
- Responsive design validation

### Testing Tools

- **Jest**: JavaScript testing framework
- **React Testing Library**: Component testing utilities
- **MSW (Mock Service Worker)**: API mocking for tests
- **Cypress**: End-to-end testing (optional)

## 🔒 Security Considerations

### Client-Side Security

#### Input Sanitization
- XSS prevention for user inputs
- HTML encoding for display data
- URL validation for external links

#### Data Handling
- No sensitive data storage in localStorage
- Secure API communication
- HTTPS enforcement in production

#### Access Control
- No client-side authentication required (public demo)
- Rate limiting handled by backend
- CORS compliance for cross-origin requests

## 📈 Performance Optimization

### Bundle Optimization

#### Next.js Built-in Features
- Automatic code splitting
- Image optimization
- Static site generation (SSG) where applicable
- Tree shaking for unused code

#### Custom Optimizations
```javascript
// Dynamic imports for large components
const DataCharts = dynamic(() => import('../components/DataCharts'), {
  loading: () => <p>Loading charts...</p>,
  ssr: false
});

// Lazy loading for non-critical components
const ClinicalRiskDashboard = lazy(() => import('../components/ClinicalRiskDashboard'));
```

### Runtime Performance

#### State Management
- Efficient React state updates
- Memoization for expensive calculations
- Debounced search inputs
- Optimized re-rendering patterns

#### API Interaction
- Request deduplication
- Caching strategies
- Error boundaries for graceful failures
- Loading states for better UX

### Performance Monitoring

#### Web Vitals
- Core Web Vitals tracking
- Lighthouse score optimization
- Bundle size monitoring
- Runtime performance profiling

## 🚀 Deployment

### Development Deployment
```bash
npm run dev
# Server runs on http://localhost:3000
```

### Production Deployment

#### Static Export
```bash
npm run build
npm run export
# Creates 'out' directory with static files
```

#### Node.js Server
```bash
npm run build
npm start
# Production server on configured port
```

### Platform-Specific Deployment

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

#### Netlify
```bash
npm run build
# Upload 'build' directory to Netlify
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📱 Mobile Experience

### Responsive Features
- Touch-friendly interface elements
- Optimized chart interactions
- Swipe gestures for table navigation
- Responsive typography scaling

### Mobile-Specific Optimizations
- Reduced bundle size for mobile networks
- Touch-optimized button sizes
- Simplified navigation patterns
- Performance optimization for mobile devices

## 🔄 State Management

### Local State
- React hooks for component state
- Context API for shared state
- Custom hooks for reusable logic

### API State
- SWR or React Query for server state (optional)
- Optimistic updates for better UX
- Error boundaries for API failures

## 🎯 Accessibility

### WCAG 2.1 AA Compliance
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Color contrast compliance
- Screen reader compatibility

### Accessibility Features
- Focus management
- Alternative text for images
- Descriptive link text
- Form validation feedback

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow code style guidelines
4. Write comprehensive tests
5. Submit pull request with detailed description

### Code Style Guidelines
- ESLint configuration for consistency
- Prettier for code formatting
- Component naming conventions
- File organization patterns

### Component Development Guidelines
- Functional components with hooks
- PropTypes or TypeScript for type checking
- Comprehensive JSDoc comments
- Reusable and composable design

---

*Frontend application designed for optimal user experience in healthcare data querying with modern web technologies.*
