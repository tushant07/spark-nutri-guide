
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

type Goal = 'Increase Weight' | 'Lose Weight' | 'Build Muscle';
type Gender = 'Male' | 'Female' | 'Other';
type DietaryPreference = 'No Preference' | 'Vegetarian' | 'Non-Vegetarian' | 'Vegan';

export interface UserProfile {
  age?: number;
  weight?: number;
  height?: number;
  gender?: Gender;
  goal?: Goal;
  dailyCalorieTarget?: number;
  allergies?: string[];
  receiveWaterReminders?: boolean;
  waterReminderInterval?: number;
  dietaryPreference?: DietaryPreference;
  created: boolean;
}

export interface LoggedMeal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: Date;
}

export interface DailyData {
  day: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: Date;
}

export interface NutrientTargets {
  protein: number;
  carbs: number;
  fat: number;
}

interface UserContextType {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  loggedMeals: LoggedMeal[];
  addMeal: (meal: LoggedMeal) => void;
  totalCaloriesConsumed: number;
  weeklyData: DailyData[];
  fetchWeeklyData: () => Promise<void>;
  initWaterReminders: () => void;
  getNutrientTargets: () => NutrientTargets;
  getNewMealRecommendation: () => { text: string; suggestion: string; nutritionalBalance: string };
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    created: false,
  });
  
  const [loggedMeals, setLoggedMeals] = useState<LoggedMeal[]>([]);
  const [weeklyData, setWeeklyData] = useState<DailyData[]>([]);

  // Load profile data when user changes
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
          return;
        }

        if (data) {
          setProfile({
            age: data.age,
            weight: data.weight,
            height: data.height,
            gender: data.gender as Gender,
            goal: data.goal as Goal,
            dailyCalorieTarget: data.daily_calorie_target,
            allergies: data.allergies || [],
            receiveWaterReminders: data.receive_water_reminders || false,
            waterReminderInterval: data.water_reminder_interval || 2,
            dietaryPreference: data.dietary_preference as DietaryPreference || 'No Preference',
            created: true,
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);

  // Load today's meals when user changes
  useEffect(() => {
    const loadTodaysMeals = async () => {
      if (!user) return;

      try {
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        
        const { data, error } = await supabase
          .from('meal_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('timestamp', startOfDay.toISOString())
          .order('timestamp', { ascending: false });

        if (error) {
          console.error('Error loading meals:', error);
          return;
        }

        if (data && data.length > 0) {
          const meals: LoggedMeal[] = data.map(meal => ({
            name: meal.name,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            timestamp: new Date(meal.timestamp),
          }));
          
          setLoggedMeals(meals);
        }
      } catch (error) {
        console.error('Error loading meals:', error);
      }
    };

    loadTodaysMeals();
  }, [user]);

  const fetchWeeklyData = async () => {
    if (!user) return;
    
    try {
      // Get date for 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      const fromDate = sevenDaysAgo.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Fetch user's daily logs for the past 7 days
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', fromDate)
        .order('date', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Transform data into the format expected by the chart
        const transformedData = data.map(log => ({
          day: log.day,
          calories: log.calories,
          protein: log.protein,
          carbs: log.carbs,
          fat: log.fat,
          date: new Date(log.date)
        }));
        
        setWeeklyData(transformedData);
      } else {
        // If no data, set empty array
        setWeeklyData([]);
      }
    } catch (error: any) {
      console.error("Error fetching weekly data:", error);
      // Set empty array on error
      setWeeklyData([]);
    }
  };

  const addMeal = (meal: LoggedMeal) => {
    setLoggedMeals((prevMeals) => [...prevMeals, meal]);
    
    // Update today's data in the weekly data when a meal is added
    fetchWeeklyData();
  };

  const totalCaloriesConsumed = loggedMeals.reduce(
    (total, meal) => total + meal.calories,
    0
  );

  // Calculate nutrient targets based on profile data
  const getNutrientTargets = (): NutrientTargets => {
    const { dailyCalorieTarget = 2000, goal, gender, weight } = profile;
    
    let proteinPerKg = 1.6; // Default
    let carbsPercent = 0.45; // Default
    let fatPercent = 0.25; // Default
    
    // Adjust based on goal
    if (goal === 'Lose Weight') {
      proteinPerKg = 2.0;
      carbsPercent = 0.35;
      fatPercent = 0.25;
    } else if (goal === 'Build Muscle') {
      proteinPerKg = 2.2;
      carbsPercent = 0.45;
      fatPercent = 0.25;
    } else if (goal === 'Increase Weight') {
      proteinPerKg = 1.8;
      carbsPercent = 0.55;
      fatPercent = 0.25;
    }
    
    // Calculate targets
    const proteinTarget = weight ? Math.round(weight * proteinPerKg) : Math.round(dailyCalorieTarget * 0.3 / 4);
    const carbsTarget = Math.round((dailyCalorieTarget * carbsPercent) / 4);
    const fatTarget = Math.round((dailyCalorieTarget * fatPercent) / 9);
    
    return {
      protein: proteinTarget,
      carbs: carbsTarget,
      fat: fatTarget
    };
  };

  // Food suggestions based on profile
  const getNewMealRecommendation = () => {
    const { goal, gender, dietaryPreference } = profile;
    const remainingCalories = (profile.dailyCalorieTarget || 2000) - totalCaloriesConsumed;
    
    // Create a pool of suggestions based on dietary preference
    const vegetarianOptions = [
      'Greek yogurt with berries and honey',
      'Lentil soup with whole grain bread',
      'Chickpea curry with brown rice',
      'Vegetable stir-fry with tofu',
      'Quinoa bowl with roasted vegetables',
      'Smoothie with plant protein, spinach and fruits',
      'Cottage cheese with fruits and nuts',
      'Peanut butter toast with banana and seeds'
    ];
    
    const nonVegOptions = [
      'Grilled chicken breast with sweet potato',
      'Salmon with steamed vegetables',
      'Turkey and avocado wrap',
      'Beef stir-fry with broccoli',
      'Protein shake with banana and oats',
      'Tuna salad with mixed greens',
      'Egg white omelet with vegetables',
      'Chicken soup with vegetables'
    ];
    
    const veganOptions = [
      'Tofu scramble with vegetables',
      'Lentil and vegetable soup',
      'Quinoa salad with beans and vegetables',
      'Vegan protein shake with almond milk',
      'Chickpea and vegetable curry',
      'Avocado toast with nutritional yeast',
      'Tempeh stir-fry with brown rice',
      'Overnight oats with chia seeds and fruits'
    ];
    
    let options = [...vegetarianOptions, ...nonVegOptions];
    
    // Filter based on dietary preference
    if (dietaryPreference === 'Vegetarian') {
      options = vegetarianOptions;
    } else if (dietaryPreference === 'Non-Vegetarian') {
      options = nonVegOptions;
    } else if (dietaryPreference === 'Vegan') {
      options = veganOptions;
    }
    
    // Select a random option
    const suggestion = options[Math.floor(Math.random() * options.length)];
    
    let text = `You've had ${totalCaloriesConsumed} kcal today. For your ${profile.dailyCalorieTarget} kcal goal:`;
    let nutritionalBalance = '';
    
    if (goal === 'Increase Weight') {
      nutritionalBalance = "Focus on calorie-dense foods rich in healthy fats and complex carbohydrates.";
    } else if (goal === 'Lose Weight') {
      nutritionalBalance = "Prioritize protein and fiber-rich foods to stay full while maintaining a calorie deficit.";
    } else if (goal === 'Build Muscle') {
      nutritionalBalance = "Ensure you're getting enough protein distributed throughout the day, with adequate carbs for energy.";
    }
    
    return { text, suggestion, nutritionalBalance };
  };

  // Water reminder functionality
  const initWaterReminders = () => {
    if (!profile.receiveWaterReminders) return;
    
    // Clear any existing reminders
    if ('Notification' in window) {
      console.log("Initializing water reminders");
      
      // Request permission
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          scheduleWaterReminders();
        }
      });
    }
  };
  
  const scheduleWaterReminders = () => {
    const hours = profile.waterReminderInterval || 2;
    const intervalMs = hours * 60 * 60 * 1000;
    
    // Schedule the first reminder
    const now = new Date();
    const currentHour = now.getHours();
    
    // Only schedule reminders between 8 AM and 8 PM
    if (currentHour >= 8 && currentHour < 20) {
      console.log(`Setting water reminder interval for every ${hours} hours`);
      
      // Set interval for recurring reminders
      const timerId = setInterval(() => {
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        
        // Only show notification between 8 AM and 8 PM
        if (currentHour >= 8 && currentHour < 20) {
          new Notification('Water Reminder', {
            body: 'Time to drink water! Stay hydrated for optimal health.',
            icon: '/favicon.ico'
          });
        }
      }, intervalMs);
      
      // Store the timer ID to clear it when needed
      localStorage.setItem('waterReminderTimerId', timerId.toString());
    }
  };
  
  // Initialize water reminders when profile is loaded
  useEffect(() => {
    if (profile.created && profile.receiveWaterReminders) {
      initWaterReminders();
    }
    
    // Cleanup function
    return () => {
      const timerId = localStorage.getItem('waterReminderTimerId');
      if (timerId) {
        clearInterval(parseInt(timerId));
        localStorage.removeItem('waterReminderTimerId');
      }
    };
  }, [profile.created, profile.receiveWaterReminders, profile.waterReminderInterval]);

  return (
    <UserContext.Provider
      value={{
        profile,
        setProfile,
        loggedMeals,
        addMeal,
        totalCaloriesConsumed,
        weeklyData,
        fetchWeeklyData,
        initWaterReminders,
        getNutrientTargets,
        getNewMealRecommendation,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
