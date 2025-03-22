
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Goal = 'Increase Weight' | 'Lose Weight' | 'Build Muscle';

export interface UserProfile {
  age?: number;
  weight?: number;
  height?: number;
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

interface UserContextType {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  loggedMeals: LoggedMeal[];
  addMeal: (meal: LoggedMeal) => void;
  totalCaloriesConsumed: number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile>({
    created: false,
  });
  
  const [loggedMeals, setLoggedMeals] = useState<LoggedMeal[]>([]);

  const addMeal = (meal: LoggedMeal) => {
    setLoggedMeals((prevMeals) => [...prevMeals, meal]);
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
