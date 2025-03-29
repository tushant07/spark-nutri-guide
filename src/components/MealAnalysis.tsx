import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Tag, Info, AlertTriangle } from 'lucide-react';

interface MealData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  is_packaged?: boolean;
  food_description?: string;
  allergens?: string[];
  health_insights?: string;
  ingredients?: string[];
}

interface MealAnalysisProps {
  mealData?: MealData;
  onLogMeal: () => void;
}

const MealAnalysis = ({ mealData, onLogMeal }: MealAnalysisProps) => {
  const { addMeal, profile } = useUser();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoggingMeal, setIsLoggingMeal] = useState(false);
  
  const { age, height, weight, goal, allergies = [] } = profile;
  
  const hasValidMealData = mealData && 
    mealData.name && 
    mealData.calories > 0 && 
    mealData.protein >= 0 && 
    mealData.carbs >= 0 && 
    mealData.fat >= 0;
  
  const detectAllergens = () => {
    if (!hasValidMealData || !mealData || allergies.length === 0) return [];
    
    const detectedAllergens: string[] = [];
    
    if (mealData.allergens && mealData.allergens.length > 0) {
      for (const allergen of allergies) {
        const allergenLower = allergen.toLowerCase();
        if (mealData.allergens.some(a => a.toLowerCase().includes(allergenLower))) {
          detectedAllergens.push(allergen);
        }
      }
    }
    
    if (mealData.ingredients && mealData.ingredients.length > 0) {
      for (const allergen of allergies) {
        const allergenLower = allergen.toLowerCase();
        if (mealData.ingredients.some(i => i.toLowerCase().includes(allergenLower))) {
          if (!detectedAllergens.includes(allergen)) {
            detectedAllergens.push(allergen);
          }
        }
      }
    }
    
    for (const allergen of allergies) {
      const allergenLower = allergen.toLowerCase();
      if (mealData.name.toLowerCase().includes(allergenLower)) {
        if (!detectedAllergens.includes(allergen)) {
          detectedAllergens.push(allergen);
        }
      }
      
      if (mealData.food_description && mealData.food_description.toLowerCase().includes(allergenLower)) {
        if (!detectedAllergens.includes(allergen)) {
          detectedAllergens.push(allergen);
        }
      }
    }
    
    return detectedAllergens;
  };
  
  const matchedAllergens = detectAllergens();
  
  const generateHealthInsight = () => {
    if (!hasValidMealData || !mealData) return null;
    
    let insight = mealData.health_insights || "";
    
    if (height && weight && age) {
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      
      if (goal === 'Lose Weight' && bmi > 25) {
        if (mealData.calories > 600) {
          insight += " This meal is relatively high in calories. Consider portion control or lighter alternatives to support your weight loss goals.";
        } else if (mealData.protein > mealData.fat && mealData.protein > mealData.carbs) {
          insight += " This meal is high in protein, which is great for satiety and supporting your weight loss journey.";
        }
      } else if (goal === 'Increase Weight' && bmi < 18.5) {
        if (mealData.calories < 400) {
          insight += " To support healthy weight gain, consider adding nutritious calorie-dense foods like nuts, avocados, or a side of whole grains to this meal.";
        }
      } else if (goal === 'Build Muscle') {
        if (mealData.protein < 20) {
          insight += " For muscle building, consider adding a protein source to complement this meal and support muscle recovery and growth.";
        }
      }
    }
    
    return insight.trim();
  };
  
  const enhancedHealthInsight = generateHealthInsight();
  
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
      
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];
      const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][today.getDay()];
      
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
      }
      
      addMeal({
        name: mealData.name,
        calories: mealData.calories,
        protein: mealData.protein,
        carbs: mealData.carbs,
        fat: mealData.fat,
        timestamp: new Date().toISOString(),
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
  
  const title = mealData.is_packaged ? "FOOD LABEL DETECTED" : "DETECTED MEAL";
  
  return (
    <div className="glass-card rounded-xl p-6 animate-scale-in">
      <div className="flex items-center mb-3">
        <div className="w-2 h-2 rounded-full bg-spark-500 mr-2"></div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
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
      
      {matchedAllergens.length > 0 && (
        <div className="mb-4 p-3 bg-red-100 rounded-lg border border-red-200">
          <div className="flex items-center text-sm text-red-600 mb-1">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span className="font-semibold">Allergy Alert!</span>
          </div>
          <p className="text-sm text-red-700">
            This food may contain {matchedAllergens.join(', ')}, which you've listed as allergens.
          </p>
        </div>
      )}
      
      {mealData.allergens && mealData.allergens.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
          <div className="flex items-center text-sm text-amber-500 mb-1">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span>Allergen Information</span>
          </div>
          <p className="text-sm text-gray-700">
            Contains: {mealData.allergens.join(', ')}
          </p>
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
      
      {(enhancedHealthInsight || mealData.health_insights) && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
          <div className="flex items-center text-sm text-green-600 mb-1">
            <Info className="h-4 w-4 mr-1" />
            <span>Health Insights</span>
          </div>
          <p className="text-sm text-gray-700">{enhancedHealthInsight || mealData.health_insights}</p>
        </div>
      )}
      
      {mealData.ingredients && mealData.ingredients.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <Info className="h-4 w-4 mr-1 text-spark-500" />
            <span>Ingredients</span>
          </div>
          <p className="text-sm text-gray-700">
            {mealData.ingredients.join(', ')}
          </p>
        </div>
      )}
      
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
