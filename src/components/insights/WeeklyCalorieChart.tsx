
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { DailyData } from '@/context/UserContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';

interface WeeklyCalorieChartProps {
  weeklyData: DailyData[];
}

const WeeklyCalorieChart = ({ weeklyData }: WeeklyCalorieChartProps) => {
  const hasValidData = weeklyData && weeklyData.some(day => day.calories !== undefined && day.calories > 0);
  
  const formatChartData = (data: DailyData[]) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return data.map(item => {
      const date = new Date(item.day);
      const isYesterday = date.toDateString() === yesterday.toDateString();
      const isToday = date.toDateString() === today.toDateString();
      
      return {
        ...item,
        day: days[date.getDay()],
        calories: item.calories || 0,
        fill: isToday ? '#10B981' : '#E2FCF3',
        isYesterday
      };
    });
  };
  
  if (!hasValidData) {
    return (
      <Card className="mb-6 animate-scale-in bg-[#1A1F2C] border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-gray-200">Calorie History</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="bg-gray-800 border-gray-700">
            <AlertCircle className="h-4 w-4 text-gray-400" />
            <AlertDescription className="text-gray-300">
              Not enough calorie data available yet. Log more meals to see your trend.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  const chartData = formatChartData(weeklyData);
  const yesterdayData = chartData.find(d => d.isYesterday);
  
  return (
    <Card className="mb-6 animate-scale-in bg-[#1A1F2C] border-gray-800">
      <CardHeader className="pb-2">
        <div className="space-y-2">
          {yesterdayData && (
            <>
              <div className="text-4xl font-bold text-gray-200">
                {Math.floor(yesterdayData.calories / 60)} hr, {Math.round(yesterdayData.calories % 60)} min
              </div>
              <div className="text-gray-400">Yesterday</div>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <BarChart width={400} height={200} data={chartData} margin={{ top: 20, right: 0, left: -30, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#333" />
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#999' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#999' }}
              ticks={[0, 4, 8]}
              tickFormatter={(value) => `${value}h`}
            />
            <Bar 
              dataKey="calories" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyCalorieChart;

