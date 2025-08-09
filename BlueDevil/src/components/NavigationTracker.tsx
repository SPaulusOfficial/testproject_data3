import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';

const NavigationTracker: React.FC = () => {
  const { addVisitedPage, setBreadcrumbs, updateLastActivity } = useSession();
  const location = useLocation();

  useEffect(() => {
    // Track page visit
    addVisitedPage(location.pathname);
    
    // Update breadcrumbs
    const breadcrumbs = location.pathname
      .split('/')
      .filter(Boolean)
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1));
    
    setBreadcrumbs(breadcrumbs);
  }, [location.pathname, addVisitedPage, setBreadcrumbs]);

  // Activity updates only when component mounts, not on every render
  useEffect(() => {
    // Initial activity update
    updateLastActivity();
    
    // Set up periodic activity updates (every 30 seconds)
    const intervalId = setInterval(() => {
      updateLastActivity();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []); // Empty dependency array - only run on mount

  // This component doesn't render anything
  return null;
};

export default NavigationTracker;
