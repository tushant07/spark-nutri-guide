
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck } from 'lucide-react';
import { DailyData } from '@/context/UserContext';

interface GoalConsistencyProps {
  weeklyData: DailyData[];
  dailyCalorieTarget: number;
}

const GoalConsistency = ({ weeklyData, dailyCalorieTarget }: GoalConsistencyProps) => {
  // Calculate days on target
  const daysOnTarget = weeklyData.filter(day => 
    Math.abs(day.calories - dailyCalorieTarget) < dailyCalorieTarget * 0.1
  ).length;
  
  return (
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
  );
};

export default GoalConsistency;
