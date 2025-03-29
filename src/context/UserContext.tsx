
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
  allergies?: string[];
  receiveWaterReminders?: boolean;
  waterReminderInterval?: number;
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
  fetchWeeklyData: () => Promise<void>;
  initWaterReminders: () => void;
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
