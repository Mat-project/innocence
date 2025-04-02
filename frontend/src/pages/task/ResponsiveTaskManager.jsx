import { useEffect, useState } from 'react';
import TaskPage from './TaskPage'; 
import MobileTaskPage from './MobileTaskPage'; // Import the new mobile component

function ResponsiveTaskManager() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check if screen is mobile on initial load
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typical tablet breakpoint
    };
    
    // Set initial value
    checkMobile();
    
    // Update on resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile ? <MobileTaskPage /> : <TaskPage />;
}

export default ResponsiveTaskManager;