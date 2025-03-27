
import React, { useEffect, useState } from 'react';
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

const WeeklyInsights = () => {
  const { profile, weeklyData, fetchWeeklyData } = useUser();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // Fallback to default target if no profile data yet
  const dailyCalorieTarget = profile.dailyCalorieTarget || 2000;
  
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        await fetchWeeklyData();
      } catch (error: any) {
        console.error("Error loading data:", error);
        toast({
          title: "Error loading data",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, fetchWeeklyData, toast]);
  
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
        description: error.message,
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
      
      <main className="px-6 py-4 max-w-md mx-auto">
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              Weekly Insights
            </h2>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh} 
              className="mb-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-gray-600">
            Track your weekly progress and get personalized insights
          </p>
        </div>
        
        {weeklyData.length === 0 ? (
          <NoDataCard />
        ) : (
          <>
            <WeeklyCalorieChart weeklyData={weeklyData} />
            <GoalConsistency weeklyData={weeklyData} dailyCalorieTarget={dailyCalorieTarget} />
            <NutrientHighlights weeklyData={weeklyData} goalType={profile.goal} />
          </>
        )}
      </main>
    </div>
  );
};

export default WeeklyInsights;
