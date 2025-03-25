
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarCheck, TrendingUp, List, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import NavigationBar from '@/components/NavigationBar';
import { useUser } from '@/context/UserContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface DailyLog {
  day: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: Date;
}

const WeeklyInsights = () => {
  const { profile } = useUser();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<DailyLog[]>([]);
  
  // Fallback to local state if no profile data yet
  const dailyCalorieTarget = profile.dailyCalorieTarget || 2000;
  
  useEffect(() => {
    const fetchWeeklyData = async () => {
      if (!user) return;
      
      setLoading(true);
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
          // If no data, create placeholder data
          generatePlaceholderData();
        }
      } catch (error: any) {
        console.error("Error fetching weekly data:", error);
        toast({
          title: "Error loading data",
          description: error.message,
          variant: "destructive"
        });
        generatePlaceholderData();
      } finally {
        setLoading(false);
      }
    };
    
    const generatePlaceholderData = () => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const today = new Date();
      
      const placeholderData = days.map((day, index) => {
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
      
      setWeeklyData(placeholderData);
    };
    
    fetchWeeklyData();
  }, [user, toast]);
  
  // Calculate days on target
  const daysOnTarget = weeklyData.filter(day => 
    Math.abs(day.calories - dailyCalorieTarget) < dailyCalorieTarget * 0.1
  ).length;
  
  // Calculate nutrient averages
  const avgProtein = Math.round(weeklyData.reduce((sum, day) => sum + day.protein, 0) / 7);
  const avgCarbs = Math.round(weeklyData.reduce((sum, day) => sum + day.carbs, 0) / 7);
  const avgFat = Math.round(weeklyData.reduce((sum, day) => sum + day.fat, 0) / 7);
  const avgCalories = Math.round(weeklyData.reduce((sum, day) => sum + day.calories, 0) / 7);
  
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
          <h2 className="text-2xl font-bold mb-2 text-gray-800">
            Weekly Insights
          </h2>
          <p className="text-gray-600">
            Track your weekly progress and get personalized insights
          </p>
        </div>
        
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
                <h3 className="text-xl font-bold">{daysOnTarget}/7</h3>
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
      </main>
      
      <NavigationBar />
    </div>
  );
};

export default WeeklyInsights;
