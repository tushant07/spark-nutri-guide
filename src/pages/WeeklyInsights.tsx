
import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import { useUser } from '@/context/UserContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import WeeklyCalorieChart from '@/components/insights/WeeklyCalorieChart';
import GoalConsistency from '@/components/insights/GoalConsistency';
import NutrientHighlights from '@/components/insights/NutrientHighlights';
import NoDataCard from '@/components/insights/NoDataCard';
import NavigationBar from '@/components/NavigationBar';
import ProfileHeader from '@/components/ProfileHeader';
import ThemeToggle from '@/components/ThemeToggle';

const WeeklyInsights = () => {
  const { profile, weeklyData, fetchWeeklyData } = useUser();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  
  // Fallback to default target if no profile data yet
  const dailyCalorieTarget = profile.dailyCalorieTarget || 2000;
  
  const loadData = useCallback(async () => {
    if (!user) {
      console.log("No user found, skipping data fetch.");
      setLoading(false);
      return;
    }
    
    try {
      console.log("Fetching weekly data for insights page...");
      await fetchWeeklyData();
      console.log("Weekly data fetched:", weeklyData);
    } catch (error: any) {
      console.error("Error loading weekly data:", error);
      toast({
        title: "Error loading data",
        description: error.message || "Failed to load weekly insights",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setHasAttemptedFetch(true);
      console.log("Loading state set to false");
    }
  }, [user, fetchWeeklyData, toast]);
  
  useEffect(() => {
    // Only fetch data if we haven't attempted to yet or if we have a user
    if (!hasAttemptedFetch || user) {
      loadData();
    } else {
      // If we've already attempted to fetch but still don't have a user, stop loading
      setLoading(false);
    }
  }, [loadData, user, hasAttemptedFetch]);
  
  const handleRefresh = async () => {
    setLoading(true);
    try {
      await fetchWeeklyData();
      toast({
        title: "Data refreshed",
        description: "Your weekly data has been updated"
      });
    } catch (error: any) {
      toast({
        title: "Error refreshing data",
        description: error.message || "Failed to refresh data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen gradient-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-spark-500" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen gradient-background pb-20">
      <Header />
      <ProfileHeader/>
      <ThemeToggle />
      
      <main className="px-6 py-4 max-w-md mx-auto">
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
              Weekly Insights
            </h2>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh} 
              className="mb-2 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:border-gray-600"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Track your weekly progress and get personalized insights
          </p>
        </div>
        
        {(!weeklyData || weeklyData.length === 0) ? (
          <NoDataCard />
        ) : (
          <>
            <WeeklyCalorieChart weeklyData={weeklyData} />
            <GoalConsistency weeklyData={weeklyData} dailyCalorieTarget={dailyCalorieTarget} />
            <NutrientHighlights weeklyData={weeklyData} goalType={profile.goal} />
          </>
        )}
      </main>
      
      <NavigationBar />
    </div>
  );
};

export default WeeklyInsights;
