
import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Tag, Info } from 'lucide-react';

interface MealData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  is_packaged?: boolean;
  food_description?: string;
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
  
  // Check if we have valid meal data
  const hasValidMealData = mealData && 
    mealData.name && 
    mealData.calories > 0 && 
    mealData.protein >= 0 && 
    mealData.carbs >= 0 && 
    mealData.fat >= 0;
  
  const handleLogMeal = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to log a meal",
        variant: "destructive"
      });
      return;
    }
    
    if (!hasValidMealData) {
      toast({
        title: "Error",
        description: "Cannot log meal without valid nutritional data",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoggingMeal(true);
    
    try {
      // Save meal to Supabase
      const { error } = await supabase.from('meal_logs').insert({
        user_id: user.id,
        name: mealData.name,
        calories: mealData.calories,
        protein: mealData.protein,
        carbs: mealData.carbs,
        fat: mealData.fat
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
        calories: mealData.calories,
        protein: mealData.protein,
        carbs: mealData.carbs,
        fat: mealData.fat
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
        ...mealData,
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
  
  // If no meal data provided, show a message
  if (!mealData) {
    return (
      <div className="glass-card rounded-xl p-6 animate-scale-in">
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-gray-600 text-center mb-4">No meal data available.</p>
          <p className="text-sm text-gray-500 text-center">
            Take a clearer photo of your food to get nutritional information.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="glass-card rounded-xl p-6 animate-scale-in">
      <div className="flex items-center mb-3">
        <div className="w-2 h-2 rounded-full bg-spark-500 mr-2"></div>
        <h3 className="text-sm font-medium text-gray-500">DETECTED MEAL</h3>
        {mealData.is_packaged && (
          <div className="ml-2 px-2 py-0.5 bg-blue-100 rounded-full flex items-center">
            <Tag className="h-3 w-3 mr-1 text-blue-500" />
            <span className="text-xs text-blue-500 font-medium">Packaged Food</span>
          </div>
        )}
      </div>
      
      <h2 className="text-xl font-semibold mb-2 text-gray-800">
        {mealData.name || "Unknown Food"}
      </h2>
      
      {mealData.food_description && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <Info className="h-4 w-4 mr-1 text-spark-500" />
            <span>About this food</span>
          </div>
          <p className="text-sm text-gray-700">{mealData.food_description}</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-3 border border-spark-100">
          <p className="text-sm text-gray-500 mb-1">Calories</p>
          <p className="text-xl font-medium text-gray-800">{mealData.calories || 0} kcal</p>
        </div>
        
        <div className="bg-white rounded-lg p-3 border border-spark-100">
          <p className="text-sm text-gray-500 mb-1">Protein</p>
          <p className="text-xl font-medium text-gray-800">{mealData.protein || 0}g</p>
        </div>
        
        <div className="bg-white rounded-lg p-3 border border-spark-100">
          <p className="text-sm text-gray-500 mb-1">Carbs</p>
          <p className="text-xl font-medium text-gray-800">{mealData.carbs || 0}g</p>
        </div>
        
        <div className="bg-white rounded-lg p-3 border border-spark-100">
          <p className="text-sm text-gray-500 mb-1">Fat</p>
          <p className="text-xl font-medium text-gray-800">{mealData.fat || 0}g</p>
        </div>
      </div>
      
      <button
        onClick={handleLogMeal}
        disabled={isLoggingMeal || !hasValidMealData}
        className="btn-primary w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoggingMeal ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : !hasValidMealData ? (
          'Unable to log (Invalid data)'
        ) : (
          'Log Meal'
        )}
      </button>
    </div>
  );
};

export default MealAnalysis;
