
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck } from 'lucide-react';
import { DailyData } from '@/context/UserContext';
import { Progress } from '@/components/ui/progress';

interface GoalConsistencyProps {
  weeklyData: DailyData[];
  dailyCalorieTarget: number;
}

const GoalConsistency = ({ weeklyData, dailyCalorieTarget }: GoalConsistencyProps) => {
  // Calculate days on target
  const daysOnTarget = weeklyData.filter(day => 
    Math.abs(day.calories - dailyCalorieTarget) < dailyCalorieTarget * 0.1
  ).length;
  
  // Calculate consistency percentage
  const consistencyPercentage = weeklyData.length > 0 
    ? Math.round((daysOnTarget / weeklyData.length) * 100) 
    : 0;
  
  return (
    <Card className="mb-6 animate-scale-in bg-card dark:bg-gray-800/95 border dark:border-gray-700">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <CalendarCheck className="mr-2 h-5 w-5 text-spark-500" />
          <CardTitle className="text-lg text-foreground dark:text-white">Daily Calorie Target</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-foreground dark:text-white">{daysOnTarget}/{weeklyData.length}</h3>
            <p className="text-gray-600 dark:text-gray-300">days met your calorie goal</p>
          </div>
          
          <div className="text-right">
            <div className="text-xl font-bold text-foreground dark:text-white">{dailyCalorieTarget.toLocaleString()}</div>
            <p className="text-gray-600 dark:text-gray-300">daily target (kcal)</p>
          </div>
        </div>
        
        <Progress value={consistencyPercentage} className="h-2 mb-1" />
        
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-300">{consistencyPercentage}% consistency</span>
          <Badge variant={consistencyPercentage >= 70 ? "default" : "secondary"} 
                className={`text-xs px-2 py-0.5 ${consistencyPercentage >= 70 ? 'bg-spark-500 dark:bg-spark-500 text-white' : 'dark:bg-gray-700 dark:text-gray-300'}`}>
            {consistencyPercentage >= 70 ? 'On Track' : 'Needs Focus'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalConsistency;
