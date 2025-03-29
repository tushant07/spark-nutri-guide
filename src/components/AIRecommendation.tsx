
import { useUser } from '@/context/UserContext';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface AIRecommendationProps {
  recommendation?: {
    text: string;
    suggestion: string;
    nutritionalBalance: string;
  };
}

const AIRecommendation = ({ recommendation: initialRecommendation }: AIRecommendationProps) => {
  const { profile, totalCaloriesConsumed, getNewMealRecommendation } = useUser();
  const [recommendation, setRecommendation] = useState(initialRecommendation || getNewMealRecommendation());
  
  const { 
    dailyCalorieTarget = 2000, 
    allergies = [],
    dietaryPreference
  } = profile;
  
  // Handle refresh button click
  const handleRefresh = () => {
    setRecommendation(getNewMealRecommendation());
  };
  
  if (!recommendation.text) return null;
  
  return (
    <div className="glass-card rounded-xl p-6 animate-scale-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-spark-500 mr-2"></div>
          <h3 className="text-sm font-medium text-gray-500">AI RECOMMENDATION</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          className="text-gray-500 hover:text-spark-500"
        >
          <RefreshCw size={16} className="mr-1" />
          New Suggestion
        </Button>
      </div>
      
      <p className="text-gray-800 mb-3">{recommendation.text}</p>
      
      <div className="bg-white rounded-lg p-4 border border-spark-100">
        <p className="font-medium text-spark-800">{recommendation.suggestion}</p>
      </div>
      
      {dietaryPreference && dietaryPreference !== 'No Preference' && (
        <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
          <h4 className="font-medium text-purple-700 mb-1">Dietary Preference</h4>
          <p className="text-sm text-gray-700">
            Your meal suggestions are tailored to your {dietaryPreference.toLowerCase()} diet preference.
          </p>
        </div>
      )}
      
      {allergies.length > 0 && (
        <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
          <div className="flex items-center text-amber-700 mb-1">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <h4 className="font-medium">Your Allergies</h4>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {allergies.map((allergy, index) => (
              <span key={index} className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs">
                {allergy}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-700 mt-2">
            Be careful with these ingredients. We'll alert you if they're detected in your food.
          </p>
        </div>
      )}
      
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-sm text-gray-700">{recommendation.nutritionalBalance}</p>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">Daily Progress</span>
          <span className="text-sm font-medium">
            {totalCaloriesConsumed} / {dailyCalorieTarget} kcal
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div 
            className="bg-spark-500 h-2 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, (totalCaloriesConsumed / dailyCalorieTarget) * 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendation;
