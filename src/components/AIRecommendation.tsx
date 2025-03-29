
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
    age, 
    height, 
    weight, 
    gender,
    allergies = [],
    dietaryPreference
  } = profile;
  
  // Calculate ideal weight range based on height, age and gender using BMI
  const calculateIdealWeightRange = () => {
    if (!height || !age) return null;
    
    // Convert height from cm to m for BMI calculation
    const heightInMeters = height / 100;
    
    // Calculate ideal BMI range (slightly adjusted by age)
    let minBMI = 18.5;
    let maxBMI = 24.9;
    
    // Adjust BMI range slightly based on age
    if (age > 65) {
      minBMI = 22; // Slightly higher minimum for older adults
      maxBMI = 27; // Allow slightly higher BMI for older adults
    } else if (age < 18) {
      // BMI calculations differ for children/teens, simplifying here
      minBMI = 17;
      maxBMI = 23;
    }
    
    // Calculate weight range based on BMI formula: weight = BMI * height²
    const minIdealWeight = Math.round(minBMI * heightInMeters * heightInMeters);
    const maxIdealWeight = Math.round(maxBMI * heightInMeters * heightInMeters);
    
    return { minIdealWeight, maxIdealWeight };
  };
  
  const idealWeightRange = calculateIdealWeightRange();
  
  // Determine weight status
  const getWeightStatus = () => {
    if (!weight || !idealWeightRange) return null;
    
    const { minIdealWeight, maxIdealWeight } = idealWeightRange;
    
    if (weight < minIdealWeight) {
      return "below";
    } else if (weight > maxIdealWeight) {
      return "above";
    } else {
      return "within";
    }
  };
  
  const weightStatus = getWeightStatus();
  
  // Generate weight recommendation text
  const getWeightRecommendation = () => {
    if (!idealWeightRange || !weightStatus || !weight) {
      return null;
    }
    
    const { minIdealWeight, maxIdealWeight } = idealWeightRange;
    
    let recommendationText = `Based on your height (${height} cm) and age (${age}), your ideal weight range is ${minIdealWeight}-${maxIdealWeight} kg.`;
    
    if (weightStatus === "below") {
      const weightToGain = minIdealWeight - weight;
      recommendationText += ` You are currently ${weightToGain} kg below this range. Consider focusing on healthy weight gain strategies.`;
    } else if (weightStatus === "above") {
      const weightToLose = weight - maxIdealWeight;
      recommendationText += ` You are currently ${weightToLose} kg above this range. Gradual weight loss may benefit your health.`;
    } else {
      recommendationText += ` Your current weight of ${weight} kg is within this healthy range. Focus on maintaining your weight with balanced nutrition.`;
    }
    
    return recommendationText;
  };
  
  const weightRecommendation = getWeightRecommendation();
  
  // Calculate ideal daily calorie intake based on user profile
  const calculateIdealCalories = () => {
    if (!age || !weight || !height || !gender) return null;
    
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'Male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    // Apply activity multiplier (assuming moderate activity)
    const maintainCalories = Math.round(bmr * 1.55);
    
    // Adjust based on goal
    let goalCalories = maintainCalories;
    const { goal } = profile;
    
    if (goal === 'Increase Weight') {
      goalCalories = maintainCalories + 500;
    } else if (goal === 'Lose Weight') {
      goalCalories = maintainCalories - 500;
    } else if (goal === 'Build Muscle') {
      goalCalories = maintainCalories + 300;
    }
    
    return {
      maintain: maintainCalories,
      goal: goalCalories
    };
  };
  
  const idealCalories = calculateIdealCalories();
  
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
      
      {idealCalories && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100">
          <h4 className="font-medium text-green-700 mb-1">Daily Calorie Target</h4>
          <p className="text-sm text-gray-700">
            Based on your age, weight, height, and gender, your maintenance calorie need is approximately {idealCalories.maintain} kcal/day.
          </p>
          <p className="text-sm text-gray-700 mt-1">
            For your goal to {profile.goal?.toLowerCase()}, we recommend a daily target of {idealCalories.goal} kcal.
          </p>
        </div>
      )}
      
      {weightRecommendation && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h4 className="font-medium text-blue-700 mb-1">Weight Analysis</h4>
          <p className="text-sm text-gray-700">{weightRecommendation}</p>
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
