
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Activity, BarChart } from 'lucide-react';

interface HealthMetricsProps {
  height?: number; // in cm
  weight?: number; // in kg
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
}

const HealthMetrics: React.FC<HealthMetricsProps> = ({ height, weight, age, gender }) => {
  const calculateBMI = () => {
    if (!height || !weight) return null;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return Math.round(bmi * 10) / 10;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-yellow-500' };
    if (bmi < 25) return { category: 'Normal weight', color: 'text-green-500' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-500' };
    return { category: 'Obese', color: 'text-red-500' };
  };

  const calculateBMR = () => {
    if (!weight || !height || !age || !gender) return null;
    
    // Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'Male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
    return Math.round(bmr);
  };

  const bmi = calculateBMI();
  const bmr = calculateBMR();
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">BMI</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {bmi ? (
            <>
              <div className="text-2xl font-bold">{bmi}</div>
              <p className={`text-sm mt-1 ${bmiCategory?.color}`}>
                {bmiCategory?.category}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Body Mass Index (BMI) is a measure of body fat based on height and weight
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Complete your profile to see your BMI
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">BMR</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {bmr ? (
            <>
              <div className="text-2xl font-bold">{bmr}</div>
              <p className="text-sm text-muted-foreground mt-1">
                calories/day
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Basal Metabolic Rate (BMR) is the number of calories your body burns at rest
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Complete your profile to see your BMR
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthMetrics;
