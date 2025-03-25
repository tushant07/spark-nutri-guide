
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

type Goal = 'Increase Weight' | 'Lose Weight' | 'Build Muscle';
type Gender = 'Male' | 'Female' | 'Other';

export interface UserProfile {
  age?: number;
  weight?: number;
  height?: number;
  gender?: Gender;
  goal?: Goal;
  dailyCalorieTarget?: number;
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

interface UserContextType {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  loggedMeals: LoggedMeal[];
  addMeal: (meal: LoggedMeal) => void;
  totalCaloriesConsumed: number;
  weeklyData: DailyData[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Generate mock weekly data
const generateMockWeeklyData = (): DailyData[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  
  return days.map((day, index) => {
    // Set the date to be "index" days ago from today
    const date = new Date();
    date.setDate(today.getDate() - (6 - index));
    
    // Generate somewhat random but realistic values
    const baseCalories = 1500 + Math.floor(Math.random() * 500);
    const baseProtein = 20 + Math.floor(Math.random() * 40);
    const baseCarbs = 40 + Math.floor(Math.random() * 80);
    const baseFat = 15 + Math.floor(Math.random() * 30);
    
    return {
      day,
      calories: baseCalories,
      protein: baseProtein,
      carbs: baseCarbs,
      fat: baseFat,
      date
    };
  });
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    created: false,
  });
  
  const [loggedMeals, setLoggedMeals] = useState<LoggedMeal[]>([]);
  const [weeklyData, setWeeklyData] = useState<DailyData[]>(generateMockWeeklyData());

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

  const addMeal = (meal: LoggedMeal) => {
    setLoggedMeals((prevMeals) => [...prevMeals, meal]);
    
    // Update today's data in the weekly data when a meal is added
    setWeeklyData(prevData => {
      const today = new Date();
      const todayStr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][today.getDay()];
      
      return prevData.map(day => {
        // Check if this is today's entry
        if (day.day === todayStr) {
          return {
            ...day,
            calories: day.calories + meal.calories,
            protein: day.protein + meal.protein,
            carbs: day.carbs + meal.carbs,
            fat: day.fat + meal.fat
          };
        }
        return day;
      });
    });
  };

  const totalCaloriesConsumed = loggedMeals.reduce(
    (total, meal) => total + meal.calories,
    0
  );

  return (
    <UserContext.Provider
      value={{
        profile,
        setProfile,
        loggedMeals,
        addMeal,
        totalCaloriesConsumed,
        weeklyData,
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
