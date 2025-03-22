
import React from 'react';
import { useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  
  const getTitle = () => {
    switch (path) {
      case '/':
        return 'Spark';
      case '/profile':
        return 'Create Profile';
      case '/meal-log':
        return 'Log Meal';
      default:
        return 'Spark';
    }
  };

  return (
    <header className="w-full py-6 px-6 flex items-center justify-center animate-fade-in relative">
      <div className="absolute top-0 left-0 w-full h-full bg-white/60 backdrop-blur-md -z-10"></div>
      <h1 className="text-2xl font-bold text-center text-spark-800">
        {getTitle()}
        <span className="text-spark-500">.</span>
      </h1>
    </header>
  );
};

export default Header;
