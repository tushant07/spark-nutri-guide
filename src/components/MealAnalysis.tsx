
import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface MealData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealAnalysisProps {
  mealData?: MealData;
  onLogMeal: () => void;
}

const MealAnalysis = ({ mealData, onLogMeal }: MealAnalysisProps) => {
  const { addMeal } = useUser();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoggingMeal, setIsLoggingMeal] = useState(false);
  
  // Use provided meal data or fallback to default values
  const currentMealData = mealData || {
    name: 'Unknown Meal',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };
  
  const handleLogMeal = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to log a meal",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoggingMeal(true);
    
    try {
      // Save meal to Supabase
      const { error } = await supabase.from('meal_logs').insert({
        user_id: user.id,
        name: currentMealData.name,
        calories: currentMealData.calories,
        protein: currentMealData.protein,
        carbs: currentMealData.carbs,
        fat: currentMealData.fat
      });
      
      if (error) {
        throw error;
      }
      
      // Update day's totals in daily_logs
      const today = new Date();
      const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD
      const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][today.getDay()];
      
      // Get existing daily log or create new one with upsert
      const { error: upsertError } = await supabase.from('daily_logs').upsert({
        user_id: user.id,
        date: dateString,
        day: dayOfWeek,
        calories: currentMealData.calories,
        protein: currentMealData.protein,
        carbs: currentMealData.carbs,
        fat: currentMealData.fat
      }, {
        onConflict: 'user_id,date',
        ignoreDuplicates: false
      });
      
      if (upsertError) {
        console.error("Error updating daily log:", upsertError);
        // Don't throw here, still consider the meal logged
      }
      
      // Update local state
      addMeal({
        ...currentMealData,
        timestamp: new Date(),
      });
      
      toast({
        title: "Meal logged",
        description: "Your meal has been saved successfully"
      });
      
      onLogMeal();
    } catch (error: any) {
      toast({
        title: "Error logging meal",
        description: error.message,
        variant: "destructive"
      });
      console.error("Error logging meal:", error);
    } finally {
      setIsLoggingMeal(false);
    }
  };
  
  return (
    <div className="glass-card rounded-xl p-6 animate-scale-in">
      <div className="flex items-center mb-3">
        <div className="w-2 h-2 rounded-full bg-spark-500 mr-2"></div>
        <h3 className="text-sm font-medium text-gray-500">DETECTED MEAL</h3>
      </div>
      
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {currentMealData.name}
      </h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-3 border border-spark-100">
          <p className="text-sm text-gray-500 mb-1">Calories</p>
          <p className="text-xl font-medium text-gray-800">{currentMealData.calories} kcal</p>
        </div>
        
        <div className="bg-white rounded-lg p-3 border border-spark-100">
          <p className="text-sm text-gray-500 mb-1">Protein</p>
          <p className="text-xl font-medium text-gray-800">{currentMealData.protein}g</p>
        </div>
        
        <div className="bg-white rounded-lg p-3 border border-spark-100">
          <p className="text-sm text-gray-500 mb-1">Carbs</p>
          <p className="text-xl font-medium text-gray-800">{currentMealData.carbs}g</p>
        </div>
        
        <div className="bg-white rounded-lg p-3 border border-spark-100">
          <p className="text-sm text-gray-500 mb-1">Fat</p>
          <p className="text-xl font-medium text-gray-800">{currentMealData.fat}g</p>
        </div>
      </div>
      
      <button
        onClick={handleLogMeal}
        disabled={isLoggingMeal || currentMealData.calories === 0}
        className="btn-primary w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoggingMeal ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : currentMealData.calories === 0 ? (
          'Unable to log (No data)'
        ) : (
          'Log Meal'
        )}
      </button>
    </div>
  );
};

export default MealAnalysis;
