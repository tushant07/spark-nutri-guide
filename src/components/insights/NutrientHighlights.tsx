
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { List } from 'lucide-react';
import { DailyData } from '@/context/UserContext';

interface NutrientHighlightsProps {
  weeklyData: DailyData[];
  goalType?: string;
}

const NutrientHighlights = ({ weeklyData, goalType }: NutrientHighlightsProps) => {
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
    if (!goalType) return "";
    
    switch(goalType) {
      case 'Increase Weight':
        return avgCalories < 2000 
          ? "Try increasing your overall calorie intake to meet your weight gain goals."
          : "Great job meeting your calorie goals! Keep it up!";
      case 'Lose Weight':
        return avgCarbs > 200 
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
  
  return (
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
  );
};

export default NutrientHighlights;
