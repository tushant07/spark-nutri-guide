
import { useState } from 'react';
import { useUser } from '@/context/UserContext';

interface MealAnalysisProps {
  onLogMeal: () => void;
}

const MealAnalysis = ({ onLogMeal }: MealAnalysisProps) => {
  const { addMeal } = useUser();
  const [isLoggingMeal, setIsLoggingMeal] = useState(false);
  
  const mockMealData = {
    name: 'Grilled Chicken',
    calories: 400,
    protein: 30,
    carbs: 10,
    fat: 15,
  };
  
  const handleLogMeal = () => {
    setIsLoggingMeal(true);
    
    // Simulate network request
    setTimeout(() => {
      addMeal({
        ...mockMealData,
        timestamp: new Date(),
      });
      setIsLoggingMeal(false);
      onLogMeal();
    }, 800);
  };
  
  return (
    <div className="glass-card rounded-xl p-6 animate-scale-in">
      <div className="flex items-center mb-3">
        <div className="w-2 h-2 rounded-full bg-spark-500 mr-2"></div>
        <h3 className="text-sm font-medium text-gray-500">DETECTED MEAL</h3>
      </div>
      
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {mockMealData.name}
      </h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-3 border border-spark-100">
          <p className="text-sm text-gray-500 mb-1">Calories</p>
          <p className="text-xl font-medium text-gray-800">{mockMealData.calories} kcal</p>
        </div>
        
        <div className="bg-white rounded-lg p-3 border border-spark-100">
          <p className="text-sm text-gray-500 mb-1">Protein</p>
          <p className="text-xl font-medium text-gray-800">{mockMealData.protein}g</p>
        </div>
        
        <div className="bg-white rounded-lg p-3 border border-spark-100">
          <p className="text-sm text-gray-500 mb-1">Carbs</p>
          <p className="text-xl font-medium text-gray-800">{mockMealData.carbs}g</p>
        </div>
        
        <div className="bg-white rounded-lg p-3 border border-spark-100">
          <p className="text-sm text-gray-500 mb-1">Fat</p>
          <p className="text-xl font-medium text-gray-800">{mockMealData.fat}g</p>
        </div>
      </div>
      
      <button
        onClick={handleLogMeal}
        disabled={isLoggingMeal}
        className="btn-primary w-full flex items-center justify-center"
      >
        {isLoggingMeal ? (
          <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
        ) : (
          'Log Meal'
        )}
      </button>
    </div>
  );
};

export default MealAnalysis;
