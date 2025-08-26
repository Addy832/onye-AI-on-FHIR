import '../styles/globals.css';
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  // Initialize app-level configurations
  useEffect(() => {
    // Set up global error handling
    const handleError = (error) => {
      console.error('Global error:', error);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  return <Component {...pageProps} />;
}
//8/26/2025