import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Tag, Info, AlertTriangle, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

// New type for health score
type HealthScoreType = {
  score: number;
  label: string;
  color: string;
  description: string;
};

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
  
  // Calculate a health score based on the meal data
  const calculateHealthScore = (): HealthScoreType => {
    if (!hasValidMealData || !mealData) {
      return { 
        score: 0, 
        label: 'Unavailable', 
        color: 'bg-gray-300', 
        description: 'Health score unavailable for this meal.' 
      };
    }
    
    // Initialize score variables
    let baseScore = 70; // Start with a neutral score
    let nutritionBalance = 0;
    let redFlags = 0;
    
    // Calculate nutrition balance (protein vs carbs vs fat)
    const totalNutrients = mealData.protein + mealData.carbs + mealData.fat;
    
    if (totalNutrients > 0) {
      const proteinPercentage = mealData.protein / totalNutrients;
      const carbsPercentage = mealData.carbs / totalNutrients;
      const fatPercentage = mealData.fat / totalNutrients;
      
      // Ideal macronutrient ratios depend on goals, but we'll use general guidelines
      // For balanced diet: ~30% protein, ~40% carbs, ~30% fat
      
      // Add points for balanced macros (simplified calculation)
      if (proteinPercentage >= 0.2 && proteinPercentage <= 0.4) {
        nutritionBalance += 10;
      }
      
      if (carbsPercentage >= 0.3 && carbsPercentage <= 0.5) {
        nutritionBalance += 10;
      }
      
      if (fatPercentage >= 0.2 && fatPercentage <= 0.4) {
        nutritionBalance += 10;
      }
    }
    
    // Consider calorie density
    if (mealData.calories > 600) {
      // High calorie meal - could be good or bad depending on goals
      if (goal === 'Lose Weight') {
        redFlags += 15;
      } else if (goal === 'Increase Weight' || goal === 'Build Muscle') {
        nutritionBalance += 10;
      }
    }
    
    // Consider protein content for muscle building
    if (goal === 'Build Muscle' && mealData.protein < 20) {
      redFlags += 10;
    }
    
    // Packaged food generally scores lower due to potential additives, preservatives
    if (mealData.is_packaged) {
      redFlags += 10;
    }
    
    // Allergen presence is a major red flag
    if (matchedAllergens.length > 0) {
      redFlags += 25;
    }
    
    // Calculate final score
    const finalScore = Math.max(0, Math.min(100, baseScore + nutritionBalance - redFlags));
    
    // Determine score category
    if (finalScore >= 70) {
      return {
        score: finalScore,
        label: 'Healthy Choice',
        color: 'bg-green-500',
        description: 'This meal aligns well with your nutritional goals.'
      };
    } else if (finalScore >= 40) {
      return {
        score: finalScore,
        label: 'Moderate Choice',
        color: 'bg-amber-400',
        description: 'This meal has some nutritional benefits but could be improved.'
      };
    } else {
      return {
        score: finalScore,
        label: 'Cautious Choice',
        color: 'bg-red-500',
        description: 'This meal may not support your nutritional goals well.'
      };
    }
  };
  
  const healthScore = calculateHealthScore();
  
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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-spark-500 mr-2"></div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {mealData.is_packaged && (
            <div className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center">
              <Tag className="h-3 w-3 mr-1 text-blue-500 dark:text-blue-300" />
              <span className="text-xs text-blue-500 dark:text-blue-200 font-medium">Packaged Food</span>
            </div>
          )}
        </div>
        
        {/* Health Score Badge */}
        <Badge 
          className={`${healthScore.color} text-white px-3 py-1 flex items-center gap-1`}
          variant="default"
        >
          <Award className="h-3 w-3" />
          <span className="font-medium">{healthScore.score}/100</span>
        </Badge>
      </div>
      
      <h2 className="text-xl font-semibold mb-2 text-foreground">
        {mealData.name || "Unknown Food"}
      </h2>
      
      {/* Health Score Details */}
      <div className={`mb-4 p-3 rounded-lg border 
        ${healthScore.color === 'bg-green-500' ? 'bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-700' :
          healthScore.color === 'bg-amber-400' ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-100 dark:border-amber-700' :
          'bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-700'}
      `}>
        <div className="flex items-center text-sm mb-1">
          <Award className={`h-4 w-4 mr-1 
            ${healthScore.color === 'bg-green-500' ? 'text-green-500 dark:text-green-300' :
              healthScore.color === 'bg-amber-400' ? 'text-amber-500 dark:text-amber-300' :
              'text-red-500 dark:text-red-300'}
          `} />
          <span className="font-semibold text-foreground">{healthScore.label}</span>
        </div>
        <p className="text-sm text-muted-foreground">{healthScore.description}</p>
      </div>
      
      {mealData.food_description && (
        <div className="mb-4 p-3 bg-card border border-border rounded-lg">
          <div className="flex items-center text-sm text-muted-foreground mb-1">
            <Info className="h-4 w-4 mr-1 text-spark-500" />
            <span>About this food</span>
          </div>
          <p className="text-sm text-foreground">{mealData.food_description}</p>
        </div>
      )}
      
      {matchedAllergens.length > 0 && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-lg">
          <div className="flex items-center text-sm text-destructive mb-1">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span className="font-semibold">Allergy Alert!</span>
          </div>
          <p className="text-sm text-destructive dark:text-red-200">
            This food may contain {matchedAllergens.join(', ')}, which you've listed as allergens.
          </p>
        </div>
      )}
      
      {mealData.allergens && mealData.allergens.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-100 dark:border-yellow-700 rounded-lg">
          <div className="flex items-center text-sm text-yellow-600 dark:text-yellow-300 mb-1">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span>Allergen Information</span>
          </div>
          <p className="text-sm text-foreground">
            Contains: {mealData.allergens.join(', ')}
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-sm text-muted-foreground mb-1">Calories</p>
          <p className="text-xl font-medium text-foreground">{mealData.calories || 0} kcal</p>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-sm text-muted-foreground mb-1">Protein</p>
          <p className="text-xl font-medium text-foreground">{mealData.protein || 0}g</p>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-sm text-muted-foreground mb-1">Carbs</p>
          <p className="text-xl font-medium text-foreground">{mealData.carbs || 0}g</p>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-3">
          <p className="text-sm text-muted-foreground mb-1">Fat</p>
          <p className="text-xl font-medium text-foreground">{mealData.fat || 0}g</p>
        </div>
      </div>
      
      {(enhancedHealthInsight || mealData.health_insights) && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-700 rounded-lg">
          <div className="flex items-center text-sm text-green-600 dark:text-green-300 mb-1">
            <Info className="h-4 w-4 mr-1" />
            <span>Health Insights</span>
          </div>
          <p className="text-sm text-foreground">{enhancedHealthInsight || mealData.health_insights}</p>
        </div>
      )}
      
      {mealData.ingredients && mealData.ingredients.length > 0 && (
        <div className="mb-4 p-3 bg-card border border-border rounded-lg">
          <div className="flex items-center text-sm text-muted-foreground mb-1">
            <Info className="h-4 w-4 mr-1 text-spark-500" />
            <span>Ingredients</span>
          </div>
          <p className="text-sm text-foreground">
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
