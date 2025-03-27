
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { DailyData } from '@/context/UserContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WeeklyCalorieChartProps {
  weeklyData: DailyData[];
}

const WeeklyCalorieChart = ({ weeklyData }: WeeklyCalorieChartProps) => {
  // Check if we have any valid data with calories
  const hasValidData = weeklyData.some(day => day.calories !== undefined && day.calories > 0);

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
  );
};

export default WeeklyCalorieChart;
