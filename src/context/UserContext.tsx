import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Add DietaryPreference type definition above the Profile interface
export type DietaryPreference = 'No Preference' | 'Vegetarian' | 'Non-Vegetarian' | 'Vegan';

export interface Profile {
  age?: number;
  weight?: number;
  height?: number;
  gender?: 'Male' | 'Female' | 'Other';
  goal?: 'Increase Weight' | 'Lose Weight' | 'Build Muscle';
  dailyCalorieTarget?: number;
  allergies?: string[];
  receiveWaterReminders?: boolean;
  waterReminderInterval?: number;
  dietaryPreference?: DietaryPreference;
  created?: boolean;
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
}

export interface DailyData {
  day: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface UserContextType {
  profile: Profile;
  setProfile: (profile: Profile) => void;
  loggedMeals: Meal[];
  logMeal: (meal: Omit<Meal, 'id'>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  fetchLoggedMeals: () => Promise<void>;
  totalCaloriesConsumed: number;
  weeklyData: DailyData[];
  fetchWeeklyData: () => Promise<void>;
  initWaterReminders: () => void;
  getAIRecommendation: () => string;
  getNutrientTargets: () => { protein: number; carbs: number; fat: number; calories: number };
}

const UserContext = createContext<UserContextType>({
  profile: {},
  setProfile: () => {},
  loggedMeals: [],
  logMeal: async () => {},
  deleteMeal: async () => {},
  fetchLoggedMeals: async () => {},
  totalCaloriesConsumed: 0,
  weeklyData: [],
  fetchWeeklyData: async () => {},
  initWaterReminders: () => {},
  getAIRecommendation: () => "",
  getNutrientTargets: () => ({ protein: 0, carbs: 0, fat: 0, calories: 0 }),
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile>({});
  const [loggedMeals, setLoggedMeals] = useState<Meal[]>([]);
  const [weeklyData, setWeeklyData] = useState<DailyData[]>([]);
  const [totalCaloriesConsumed, setTotalCaloriesConsumed] = useState(0);
  
  useEffect(() => {
    const fetchProfile = async () => {
      const user = supabase.auth.getSession();
      if (!user) {
        console.log("No user session found");
        return;
      }
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', (await user).data?.session?.user.id)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
      } else if (profileData) {
        setProfile({
          age: profileData.age,
          weight: profileData.weight,
          height: profileData.height,
          gender: profileData.gender,
          goal: profileData.goal,
          dailyCalorieTarget: profileData.daily_calorie_target,
          allergies: profileData.allergies,
          receiveWaterReminders: profileData.receive_water_reminders,
          waterReminderInterval: profileData.water_reminder_interval,
          dietaryPreference: profileData.dietary_preference,
          created: true,
        });
      }
    };
    
    fetchProfile();
  }, []);
  
  useEffect(() => {
    fetchLoggedMeals();
    fetchWeeklyData();
  }, []);
  
  useEffect(() => {
    const total = loggedMeals.reduce((sum, meal) => sum + meal.calories, 0);
    setTotalCaloriesConsumed(total);
  }, [loggedMeals]);
  
  const logMeal = async (meal: Omit<Meal, 'id'>) => {
    const user = supabase.auth.getSession();
    if (!user) {
      console.error("No user session found");
      return;
    }
    
    const { data, error } = await supabase.from('meals').insert([
      {
        ...meal,
        user_id: (await user).data?.session?.user.id,
      },
    ]);
    
    if (error) {
      console.error("Error logging meal:", error);
    } else {
      console.log("Meal logged successfully:", data);
      fetchLoggedMeals();
      fetchWeeklyData();
    }
  };
  
  const deleteMeal = async (id: string) => {
    const { error } = await supabase.from('meals').delete().eq('id', id);
    
    if (error) {
      console.error("Error deleting meal:", error);
    } else {
      console.log("Meal deleted successfully:", id);
      fetchLoggedMeals();
      fetchWeeklyData();
    }
  };
  
  const fetchLoggedMeals = async () => {
    const user = supabase.auth.getSession();
    if (!user) {
      console.log("No user session found");
      return;
    }
    
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', (await user).data?.session?.user.id)
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error("Error fetching logged meals:", error);
    } else if (data) {
      const mealsWithCorrectTypes = data.map(meal => ({
        ...meal,
        calories: Number(meal.calories),
        protein: Number(meal.protein),
        carbs: Number(meal.carbs),
        fat: Number(meal.fat),
      }));
      setLoggedMeals(mealsWithCorrectTypes);
    }
  };
  
  const fetchWeeklyData = async () => {
    const user = supabase.auth.getSession();
    if (!user) {
      console.log("No user session found");
      return;
    }
    
    const today = new Date();
    const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7));
    
    const { data, error } = await supabase
      .from('meals')
      .select('timestamp, calories, protein, carbs, fat')
      .eq('user_id', (await user).data?.session?.user.id)
      .gte('timestamp', sevenDaysAgo.toISOString())
      .lte('timestamp', new Date().toISOString());
    
    if (error) {
      console.error("Error fetching weekly data:", error);
      return;
    }
    
    // Aggregate data by day
    const aggregatedData: { [key: string]: DailyData } = {};
    data.forEach(meal => {
      const day = meal.timestamp.split('T')[0];
      if (!aggregatedData[day]) {
        aggregatedData[day] = {
          day: day,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        };
      }
      aggregatedData[day].calories += meal.calories;
      aggregatedData[day].protein += meal.protein;
      aggregatedData[day].carbs += meal.carbs;
      aggregatedData[day].fat += meal.fat;
    });
    
    // Convert aggregated data to array
    const weeklyDataArray: DailyData[] = Object.values(aggregatedData);
    
    // Sort by date
    weeklyDataArray.sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
    
    setWeeklyData(weeklyDataArray);
  };
  
  const initWaterReminders = () => {
    if (!profile.receiveWaterReminders) return;
    
    const interval = profile.waterReminderInterval || 2;
    
    // Clear any existing intervals
    clearInterval(window.waterReminderIntervalId);
    
    // Set a new interval
    window.waterReminderIntervalId = setInterval(() => {
      if (Notification.permission === 'granted') {
        new Notification("Time to Hydrate!", {
          body: "Don't forget to drink some water!",
          icon: "/icon.png",
        });
      }
    }, interval * 60 * 60 * 1000);
  };
  
  const getAIRecommendation = () => {
    const recommendations = [
      "Try a Mediterranean Quinoa Salad with grilled chicken for a protein-packed lunch.",
      "Consider adding a handful of almonds to your breakfast for a healthy fat boost.",
      "How about a post-workout smoothie with spinach, banana, and protein powder?",
      "For dinner, a baked salmon with roasted vegetables could be a great choice.",
      "Snack on a Greek yogurt with berries to satisfy your sweet tooth healthily."
    ];
    
    // Return a random recommendation
    return recommendations[Math.floor(Math.random() * recommendations.length)];
  };
  
  const getNutrientTargets = () => {
    // Define default targets
    let proteinTarget = 70;
    let carbTarget = 250;
    let fatTarget = 60;
    let calorieTarget = profile.dailyCalorieTarget || 2000;
    
    // Adjust targets based on goal
    switch (profile.goal) {
      case 'Increase Weight':
        proteinTarget = 80;
        carbTarget = 300;
        fatTarget = 70;
        calorieTarget = profile.dailyCalorieTarget ? profile.dailyCalorieTarget + 500 : 2500;
        break;
      case 'Lose Weight':
        proteinTarget = 90;
        carbTarget = 200;
        fatTarget = 50;
        calorieTarget = profile.dailyCalorieTarget ? profile.dailyCalorieTarget - 500 : 1500;
        break;
      case 'Build Muscle':
        proteinTarget = 120;
        carbTarget = 280;
        fatTarget = 70;
        calorieTarget = profile.dailyCalorieTarget ? profile.dailyCalorieTarget + 300 : 2300;
        break;
      default:
        break;
    }
    
    return {
      protein: proteinTarget,
      carbs: carbTarget,
      fat: fatTarget,
      calories: calorieTarget,
    };
  };

  const value = {
    profile,
    setProfile,
    loggedMeals,
    logMeal,
    deleteMeal,
    fetchLoggedMeals,
    totalCaloriesConsumed,
    weeklyData,
    fetchWeeklyData,
    initWaterReminders,
    getAIRecommendation,
    getNutrientTargets,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
