
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, LineChart, Home, BarChart } from 'lucide-react';

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-xl border-t border-border p-2 animate-slide-up z-10">
      <div className="max-w-md mx-auto flex justify-around items-center">
        <button 
          onClick={() => navigate('/dashboard')}
          className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
        >
          <Home size={22} className={isActive('/dashboard') ? 'text-spark-500' : 'text-gray-600'} />
          <span className="nav-text">Dashboard</span>
        </button>
        
        <button 
          onClick={() => navigate('/meal-log')}
          className={`nav-item ${isActive('/meal-log') ? 'active' : ''}`}
        >
          <Camera size={22} className={isActive('/meal-log') ? 'text-spark-500' : 'text-gray-600'} />
          <span className="nav-text">Log Meal</span>
        </button>
        
        <button 
          onClick={() => navigate('/weekly-insights')}
          className={`nav-item ${isActive('/weekly-insights') ? 'active' : ''}`}
        >
          <BarChart size={22} className={isActive('/weekly-insights') ? 'text-spark-500' : 'text-gray-600'} />
          <span className="nav-text">Insights</span>
        </button>
      </div>
    </div>
  );
};

export default NavigationBar;
