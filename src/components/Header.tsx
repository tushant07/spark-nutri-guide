
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  
  const getTitle = () => {
    switch (path) {
      case '/':
        return 'Spark';
      case '/profile':
        return 'Profile';
      case '/meal-log':
        return 'Log Meal';
      case '/dashboard':
        return 'Dashboard';
      case '/weekly-insights':
        return 'Weekly Insights';
      case '/reset-password':
        return 'Reset Password';
      case '/update-password':
        return 'Update Password';
      default:
        return 'Spark';
    }
  };

  const showBackButton = path !== '/' && path !== '/dashboard';

  return (
    <header className="w-full py-6 px-6 flex items-center justify-center animate-fade-in relative">
      <div className="absolute top-0 left-0 w-full h-full bg-white/60 dark:bg-gray-900/60 backdrop-blur-md -z-10"></div>
      
      {showBackButton && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="absolute left-4 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <ArrowLeft size={20} className="text-spark-500" />
        </Button>
      )}
      
      {!showBackButton && path !== '/' && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/')}
          className="absolute left-4 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <Home size={20} className="text-spark-500" />
        </Button>
      )}
      
      <h1 className="text-2xl font-bold text-center text-spark-800 dark:text-white">
        {getTitle()}
        <span className="text-spark-500">.</span>
      </h1>
    </header>
  );
};

export default Header;
