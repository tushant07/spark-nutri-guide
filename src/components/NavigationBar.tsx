
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, LineChart, Home, BarChart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const buttonVariants = {
    hover: { 
      scale: 1.1,
      transition: { duration: 0.3 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };
  
  const iconVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.1,
      transition: { 
        duration: 0.3,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-0 left-0 right-0 bg-white/60 dark:bg-gray-900/70 backdrop-blur-xl border-t border-border dark:border-gray-700 py-2 px-4 z-10"
    >
      <div className="max-w-md mx-auto flex justify-around items-center relative">
        {/* Magical highlight under active item */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-spark-200 to-transparent opacity-50"></div>
        
        <motion.button 
          onClick={() => navigate('/dashboard')}
          className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.div variants={iconVariants} whileHover="hover">
            <Home 
              size={22} 
              className={isActive('/dashboard') ? 'text-spark-500' : 'text-gray-600 dark:text-gray-300'} 
            />
            {isActive('/dashboard') && (
              <motion.div 
                className="absolute inset-0 bg-spark-100 dark:bg-spark-900/30 rounded-lg -z-10 opacity-30"
                layoutId="navHighlight"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
          </motion.div>
          <span className="nav-text">Dashboard</span>
          {isActive('/dashboard') && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles size={12} className="text-spark-500" />
            </motion.div>
          )}
        </motion.button>
        
        <motion.button 
          onClick={() => navigate('/meal-log')}
          className={`nav-item ${isActive('/meal-log') ? 'active' : ''}`}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.div variants={iconVariants} whileHover="hover">
            <Camera 
              size={22} 
              className={isActive('/meal-log') ? 'text-spark-500' : 'text-gray-600 dark:text-gray-300'} 
            />
            {isActive('/meal-log') && (
              <motion.div 
                className="absolute inset-0 bg-spark-100 dark:bg-spark-900/30 rounded-lg -z-10 opacity-30" 
                layoutId="navHighlight"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
          </motion.div>
          <span className="nav-text">Log Meal</span>
          {isActive('/meal-log') && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles size={12} className="text-spark-500" />
            </motion.div>
          )}
        </motion.button>
        
        <motion.button 
          onClick={() => navigate('/weekly-insights')}
          className={`nav-item ${isActive('/weekly-insights') ? 'active' : ''}`}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.div variants={iconVariants} whileHover="hover">
            <BarChart 
              size={22} 
              className={isActive('/weekly-insights') ? 'text-spark-500' : 'text-gray-600 dark:text-gray-300'} 
            />
            {isActive('/weekly-insights') && (
              <motion.div 
                className="absolute inset-0 bg-spark-100 dark:bg-spark-900/30 rounded-lg -z-10 opacity-30" 
                layoutId="navHighlight"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
          </motion.div>
          <span className="nav-text">Insights</span>
          {isActive('/weekly-insights') && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles size={12} className="text-spark-500" />
            </motion.div>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default NavigationBar;
