
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarCheck, TrendingUp, List, Loader2, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import NavigationBar from '@/components/NavigationBar';
import { useUser } from '@/context/UserContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

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
  
  // Calculate days on target
  const daysOnTarget = weeklyData.filter(day => 
    Math.abs(day.calories - dailyCalorieTarget) < dailyCalorieTarget * 0.1
  ).length;
  
  // Calculate nutrient averages only if data exists
  const avgProtein = weeklyData.length > 0 
    ? Math.round(weeklyData.reduce((sum, day) => sum + day.protein, 0) / weeklyData.length) 
    : 0;
    
  const avgCarbs = weeklyData.length > 0
    ? Math.round(weeklyData.reduce((sum, day) => sum + day.carbs, 0) / weeklyData.length)
    : 0;
    
  const avgFat = weeklyData.length > 0
    ? Math.round(weeklyData.reduce((sum, day) => sum + day.fat, 0) / weeklyData.length)
    : 0;
    
  const avgCalories = weeklyData.length > 0
    ? Math.round(weeklyData.reduce((sum, day) => sum + day.calories, 0) / weeklyData.length)
    : 0;
  
  // Get nutrient tip based on goal
  const getNutrientTip = () => {
    if (!profile.goal) return "";
    
    switch(profile.goal) {
      case 'Increase Weight':
        return avgCalories < dailyCalorieTarget 
          ? "Try increasing your overall calorie intake to meet your weight gain goals."
          : "Great job meeting your calorie goals! Keep it up!";
      case 'Lose Weight':
        return avgCalories > dailyCalorieTarget 
          ? "Consider reducing your carb intake to help meet your weight loss goals."
          : "You're doing great staying within your calorie target!";
      case 'Build Muscle':
        return avgProtein < 100 
          ? "Increase your protein intake to support muscle growth and recovery."
          : "Good protein intake! Keep it up for optimal muscle building.";
      default:
        return "";
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
          <Card className="p-6 text-center animate-scale-in">
            <p className="text-gray-500 mb-4">No data available for the past week.</p>
            <p className="text-sm">Start logging your meals to see insights here.</p>
          </Card>
        ) : (
          <>
            {/* Calorie Trend Graph */}
            <Card className="mb-6 animate-scale-in">
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-spark-500" />
                  <CardTitle className="text-lg">Calorie Trend</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis domain={['dataMin - 100', 'dataMax + 100']} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="calories"
                        stroke="#F97316"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Goal Consistency */}
            <Card className="mb-6 animate-scale-in">
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <CalendarCheck className="mr-2 h-5 w-5 text-spark-500" />
                  <CardTitle className="text-lg">Goal Consistency</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{daysOnTarget}/{weeklyData.length}</h3>
                    <p className="text-gray-600">days met your {dailyCalorieTarget} kcal goal</p>
                  </div>
                  
                  <Badge variant={daysOnTarget >= 5 ? "default" : "secondary"} className="text-sm px-2 py-1">
                    {daysOnTarget >= 5 ? 'On Track' : 'Needs Focus'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            {/* Nutrient Highlights */}
            <Card className="mb-6 animate-scale-in">
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <List className="mr-2 h-5 w-5 text-spark-500" />
                  <CardTitle className="text-lg">Nutrient Highlights</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nutrient</TableHead>
                      <TableHead className="text-right">Daily Average</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Protein</TableCell>
                      <TableCell className="text-right">{avgProtein}g</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Carbs</TableCell>
                      <TableCell className="text-right">{avgCarbs}g</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Fat</TableCell>
                      <TableCell className="text-right">{avgFat}g</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-spark-800">{getNutrientTip()}</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
      
      <NavigationBar />
    </div>
  );
};

export default WeeklyInsights;
