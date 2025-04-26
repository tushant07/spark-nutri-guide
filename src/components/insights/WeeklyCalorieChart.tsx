
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { DailyData } from '@/context/UserContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { format, subDays, addDays, startOfWeek, endOfWeek } from 'date-fns';

interface WeeklyCalorieChartProps {
  weeklyData: DailyData[];
}

const WeeklyCalorieChart = ({ weeklyData }: WeeklyCalorieChartProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const hasValidData = weeklyData && weeklyData.some(day => day.calories !== undefined && day.calories > 0);
  
  const handlePreviousWeek = () => {
    setCurrentDate(prev => subDays(prev, 7));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addDays(prev, 7));
  };

  // Format the week range
  const startDate = startOfWeek(currentDate);
  const endDate = endOfWeek(currentDate);
  const weekRange = `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`;

  if (!hasValidData) {
    return (
      <Card className="mb-6 animate-scale-in">
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-spark-500" />
            <CardTitle className="text-lg">Calorie Trend</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="bg-gray-50 border-gray-200">
            <AlertCircle className="h-4 w-4 text-gray-500" />
            <AlertDescription>
              Not enough calorie data available yet. Log more meals to see your trend.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 animate-scale-in">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-spark-500" />
            <CardTitle className="text-lg">Calorie Trend</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                domain={[0, 'dataMax + 100']}
              />
              <Bar 
                dataKey="calories"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
                fill={(entry: DailyData) => 
                  format(new Date(), 'EEE').toLowerCase() === entry.day.toLowerCase() 
                    ? '#22C55E' 
                    : '#8B5CF6'
                }
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between mt-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePreviousWeek}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {weekRange}
          </span>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNextWeek}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyCalorieChart;
