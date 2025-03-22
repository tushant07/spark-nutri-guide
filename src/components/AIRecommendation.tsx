
import { useUser } from '@/context/UserContext';

const AIRecommendation = () => {
  const { profile, totalCaloriesConsumed } = useUser();
  const { goal, gender, dailyCalorieTarget = 2000 } = profile;
  
  const getRecommendation = (): {text: string, snack: string} => {
    const remainingCalories = dailyCalorieTarget - totalCaloriesConsumed;
    
    if (!goal) return { text: "", snack: "" };
    
    // Personalized recommendations based on gender and goal
    if (goal === 'Increase Weight') {
      return {
        text: `You've had ${totalCaloriesConsumed} kcal today. For your ${dailyCalorieTarget} kcal goal, try a 500 kcal snack:`,
        snack: gender === 'Male' ? 'Peanut butter toast with banana and a protein shake' : 'Avocado toast with eggs and a fruit smoothie'
      };
    } else if (goal === 'Lose Weight') {
      return {
        text: `You've had ${totalCaloriesConsumed} kcal today. For your ${dailyCalorieTarget} kcal goal, try a 200 kcal snack:`,
        snack: gender === 'Male' ? 'Apple with a few almonds' : 'Greek yogurt with berries'
      };
    } else if (goal === 'Build Muscle') {
      return {
        text: `You've had ${totalCaloriesConsumed} kcal today. For your ${dailyCalorieTarget} kcal goal, try a 300 kcal high-protein snack:`,
        snack: gender === 'Male' ? 'Protein shake with oats' : 'Cottage cheese with fruits and nuts'
      };
    }
    
    return { text: "", snack: "" };
  };
  
  const recommendation = getRecommendation();
  
  if (!recommendation.text) return null;
  
  return (
    <div className="glass-card rounded-xl p-6 animate-scale-in">
      <div className="flex items-center mb-3">
        <div className="w-2 h-2 rounded-full bg-spark-500 mr-2"></div>
        <h3 className="text-sm font-medium text-gray-500">AI RECOMMENDATION</h3>
      </div>
      
      <p className="text-gray-800 mb-3">{recommendation.text}</p>
      
      <div className="bg-white rounded-lg p-4 border border-spark-100">
        <p className="font-medium text-spark-800">{recommendation.snack}</p>
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
