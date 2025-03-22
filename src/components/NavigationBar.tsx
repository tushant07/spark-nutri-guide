
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Camera, LineChart } from 'lucide-react';
import { useUser } from '@/context/UserContext';

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useUser();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-xl border-t border-border p-2 animate-slide-up">
      <div className="max-w-md mx-auto flex justify-around items-center">
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
            onClick={() => navigate('/plan')}
            className={`nav-item ${isActive('/plan') ? 'active' : ''}`}
          >
            <LineChart size={22} className={isActive('/plan') ? 'text-spark-500' : 'text-gray-600'} />
            <span className="nav-text">Plan</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default NavigationBar;
