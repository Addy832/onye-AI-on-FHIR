/**
 * Health check API endpoint for the frontend
 * This endpoint is used by Docker health checks and monitoring tools
 */
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Basic health check
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'AI on FHIR Frontend',
      version: '1.0.0',
      environment: process.env.NODE_ENV,
      api_url: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
      uptime: process.uptime(),
    };

    res.status(200).json(healthData);
  } catch (error) {
    console.error('Health check failed:', error);
    
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'AI on FHIR Frontend',
      error: error.message,
    });
  }
}
