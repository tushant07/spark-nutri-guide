import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { useAuth } from '@clerk/clerk-react';

const Index = () => {
  const navigate = useNavigate();
  const { profile } = useUser();
  const { isSignedIn } = useAuth();
  
  useEffect(() => {
    if (isSignedIn) {
      // If profile is already created, redirect to meal-log page
      if (profile.created) {
        navigate('/meal-log');
      } else {
        // Otherwise redirect to profile creation
        navigate('/profile');
      }
    } else {
      // If not signed in, redirect to sign-in after a short delay
      const timer = setTimeout(() => {
        navigate('/sign-in');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [navigate, profile.created, isSignedIn]);
  
  return (
    <div className="min-h-screen gradient-background flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md w-full mx-auto animate-scale-in">
        <div className="w-20 h-20 bg-spark-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <div className="w-5 h-5 bg-spark-500 rounded-full animate-pulse-subtle"></div>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-3 text-spark-800">
          Spark<span className="text-spark-500">.</span>
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Your smart diet companion
        </p>
        
        <div className="flex justify-center">
          <div className="w-12 h-1 bg-spark-200 rounded-full">
            <div className="w-4 h-1 bg-spark-500 rounded-full animate-pulse shimmer"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
