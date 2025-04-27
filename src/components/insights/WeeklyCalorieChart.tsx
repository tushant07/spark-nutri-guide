
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip, TooltipProps } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { DailyData } from '@/context/UserContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { format, subDays, addDays, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

interface WeeklyCalorieChartProps {
  weeklyData: DailyData[];
}

const WeeklyCalorieChart = ({ weeklyData }: WeeklyCalorieChartProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get the earliest date from the data for navigation boundary
  const earliestDate = useMemo(() => {
    if (!weeklyData.length) return new Date();
    return parseISO(weeklyData.reduce((earliest, current) => 
      current.day < earliest ? current.day : earliest, 
      weeklyData[0].day
    ));
  }, [weeklyData]);

  const handlePreviousWeek = () => {
    setCurrentDate(prev => subDays(prev, 7));
  };

  const handleNextWeek = () => {
    const nextWeek = addDays(currentDate, 7);
    if (nextWeek <= new Date()) {
      setCurrentDate(nextWeek);
    }
  };

  // Format the week range
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekRange = `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`;

  // Format data for display with day names
  const currentWeekData = useMemo(() => {
    return weeklyData
      .filter(dayData => {
        const date = parseISO(dayData.day);
        return isWithinInterval(date, { start: startDate, end: endDate });
      })
      .map(dayData => {
        const date = parseISO(dayData.day);
        return {
          ...dayData,
          formattedDay: format(date, 'EEE'),
          fullDate: format(date, 'MMM d')
        };
      })
      // Sort by date
      .sort((a, b) => {
        return parseISO(a.day).getTime() - parseISO(b.day).getTime();
      });
  }, [weeklyData, startDate, endDate]);

  const hasValidData = weeklyData && weeklyData.some(day => day.calories !== undefined && day.calories > 0);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as (DailyData & { formattedDay: string, fullDate: string });
      return (
        <div className="p-2 bg-white dark:bg-gray-800 shadow-md rounded-md border border-gray-200 dark:border-gray-700">
          <p className="font-medium">{data.fullDate}</p>
          <p className="text-spark-500 font-bold">{data.calories} kcal</p>
        </div>
      );
    }
    return null;
  };

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
          <Alert variant="default" className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
            <AlertCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <AlertDescription className="dark:text-gray-300">
              Not enough calorie data available yet. Log more meals to see your trend.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Get today's date formatted for comparison
  const today = format(new Date(), 'yyyy-MM-dd');

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
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentWeekData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#6B728033" />
              <XAxis 
                dataKey="formattedDay" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                domain={[0, 'dataMax + 200']}
                tickFormatter={(value) => value === 0 ? '' : `${value}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar 
                dataKey="calories"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              >
                {currentWeekData.map((entry, index) => {
                  // Highlight today's data
                  const isToday = entry.day === today;
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={isToday ? '#22C55E' : '#8B5CF6'} 
                      className="opacity-80 hover:opacity-100 transition-opacity"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePreviousWeek}
            disabled={startDate <= earliestDate}
            className="dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium dark:text-gray-200">
            {weekRange}
          </span>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNextWeek}
            disabled={endDate >= new Date()}
            className="dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyCalorieChart;
