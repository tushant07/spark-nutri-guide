
import { useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import NavigationBar from '@/components/NavigationBar';
import MealAnalysis from '@/components/MealAnalysis';
import AIRecommendation from '@/components/AIRecommendation';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';

const MealLog = () => {
  const navigate = useNavigate();
  const { profile, totalCaloriesConsumed } = useUser();
  const { toast } = useToast();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [mealDetected, setMealDetected] = useState(false);
  const [mealLogged, setMealLogged] = useState(false);
  
  const handleUploadPhoto = () => {
    setUploadingPhoto(true);
    
    // Simulate photo upload and processing
    setTimeout(() => {
      setUploadingPhoto(false);
      setMealDetected(true);
      
      toast({
        title: "Meal detected",
        description: "We've analyzed your meal photo",
        duration: 3000,
      });
    }, 1500);
  };
  
  const handleLogMeal = () => {
    setMealLogged(true);
    
    toast({
      title: "Meal logged successfully",
      description: "Your nutrition data has been updated",
      duration: 3000,
    });
    
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };
  
  return (
    <div className="min-h-screen gradient-background pb-20">
      <Header />
      
      <main className="px-6 py-4 max-w-md mx-auto">
        {profile.created && (
          <div className="glass-card rounded-xl p-4 mb-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Daily Target</p>
                <p className="text-xl font-semibold text-gray-800">
                  {profile.dailyCalorieTarget} kcal
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Consumed</p>
                <p className="text-xl font-semibold text-gray-800">
                  {totalCaloriesConsumed} kcal
                </p>
              </div>
            </div>
            <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-spark-500 h-2 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(100, (totalCaloriesConsumed / (profile.dailyCalorieTarget || 2000)) * 100)}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {!mealDetected ? (
          <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center text-center h-64 animate-scale-in">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Log your meal
            </h2>
            
            <p className="text-gray-600 mb-6">
              Upload a photo of your meal or take a picture to get nutritional information
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={handleUploadPhoto}
                disabled={uploadingPhoto}
                className="btn-primary flex items-center gap-2"
              >
                {uploadingPhoto ? (
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Upload size={18} />
                    <span>Upload</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleUploadPhoto}
                disabled={uploadingPhoto}
                className="btn-secondary flex items-center gap-2"
              >
                {uploadingPhoto ? (
                  <div className="w-5 h-5 border-t-2 border-gray-600 rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Camera size={18} />
                    <span>Take Photo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            <MealAnalysis onLogMeal={handleLogMeal} />
            
            {mealLogged && (
              <div className="mt-6">
                <AIRecommendation />
              </div>
            )}
          </>
        )}
      </main>
      
      <NavigationBar />
    </div>
  );
};

export default MealLog;
