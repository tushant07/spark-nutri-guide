
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Camera, LineChart, Home, BarChart } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { UserButton } from '@clerk/clerk-react';

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useUser();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-xl border-t border-border p-2 animate-slide-up">
      <div className="max-w-md mx-auto flex justify-around items-center">
        {profile.created && (
          <button 
            onClick={() => navigate('/dashboard')}
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <Home size={22} className={isActive('/dashboard') ? 'text-spark-500' : 'text-gray-600'} />
            <span className="nav-text">Dashboard</span>
          </button>
        )}
        
        <button 
          onClick={() => navigate('/profile')}
          className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
        >
          <User size={22} className={isActive('/profile') ? 'text-spark-500' : 'text-gray-600'} />
          <span className="nav-text">Profile</span>
        </button>
        
        {profile.created && (
          <button 
            onClick={() => navigate('/meal-log')}
            className={`nav-item ${isActive('/meal-log') ? 'active' : ''}`}
          >
            <Camera size={22} className={isActive('/meal-log') ? 'text-spark-500' : 'text-gray-600'} />
            <span className="nav-text">Log Meal</span>
          </button>
        )}
        
        {profile.created && (
          <button 
            onClick={() => navigate('/weekly-insights')}
            className={`nav-item ${isActive('/weekly-insights') ? 'active' : ''}`}
          >
            <BarChart size={22} className={isActive('/weekly-insights') ? 'text-spark-500' : 'text-gray-600'} />
            <span className="nav-text">Insights</span>
          </button>
        )}
        
        <div className="flex items-center justify-center">
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonAvatarBox: "w-6 h-6",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;
