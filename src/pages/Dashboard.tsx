
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Header from '@/components/Header';
import NavigationBar from '@/components/NavigationBar';
import { useUser } from '@/context/UserContext';
import { Progress } from '@/components/ui/progress';
import ProfileHeader from '@/components/ProfileHeader';
import AIRecommendationCard from '@/components/AIRecommendationCard';
import HealthMetrics from '@/components/HealthMetrics';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const Dashboard = () => {
  const { profile, loggedMeals, totalCaloriesConsumed } = useUser();
  const { dailyCalorieTarget = 2000, age, height, weight, gender, goal } = profile;
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Filter meals for today only
  const todaysMeals = loggedMeals.filter(meal => {
    const mealDate = meal.timestamp.split('T')[0];
    return mealDate === today;
  });
  
  // Calculate macros totals for today only
  const totalProtein = todaysMeals.reduce((total, meal) => total + meal.protein, 0);
  const totalCarbs = todaysMeals.reduce((total, meal) => total + meal.carbs, 0);
  const totalFat = todaysMeals.reduce((total, meal) => total + meal.fat, 0);
  
  // Calculate percentage for progress bar using filtered totalCaloriesConsumed
  const caloriePercentage = Math.min(100, (totalCaloriesConsumed / dailyCalorieTarget) * 100);
  
  // Data for macro pie chart
  const macroData = [
    { name: 'Protein', value: totalProtein, color: '#4F46E5' },
    { name: 'Carbs', value: totalCarbs, color: '#10B981' },
    { name: 'Fat', value: totalFat, color: '#F59E0B' },
  ].filter(item => item.value > 0);
  
  // Calculate calorie percentage in a human-readable format
  const caloriePercentageFormatted = Math.round(caloriePercentage);
  
  // Calculate ideal weight range based on height, age and gender using BMI
  const calculateIdealWeightRange = () => {
    if (!height || !age) return null;
    
    // Convert height from cm to m for BMI calculation
    const heightInMeters = height / 100;
    
    // Calculate ideal BMI range (slightly adjusted by age)
    let minBMI = 18.5;
    let maxBMI = 24.9;
    
    // Adjust BMI range slightly based on age
    if (age > 65) {
      minBMI = 22; // Slightly higher minimum for older adults
      maxBMI = 27; // Allow slightly higher BMI for older adults
    } else if (age < 18) {
      // BMI calculations differ for children/teens, simplifying here
      minBMI = 17;
      maxBMI = 23;
    }
    
    // Calculate weight range based on BMI formula: weight = BMI * height²
    const minIdealWeight = Math.round(minBMI * heightInMeters * heightInMeters);
    const maxIdealWeight = Math.round(maxBMI * heightInMeters * heightInMeters);
    
    return { minIdealWeight, maxIdealWeight };
  };
  
  const idealWeightRange = calculateIdealWeightRange();
  
  // Determine weight status
  const getWeightStatus = () => {
    if (!weight || !idealWeightRange) return null;
    
    const { minIdealWeight, maxIdealWeight } = idealWeightRange;
    
    if (weight < minIdealWeight) {
      return "below";
    } else if (weight > maxIdealWeight) {
      return "above";
    } else {
      return "within";
    }
  };
  
  const weightStatus = getWeightStatus();
  
  // Generate weight recommendation text
  const getWeightRecommendation = () => {
    if (!idealWeightRange || !weightStatus || !weight) {
      return null;
    }
    
    const { minIdealWeight, maxIdealWeight } = idealWeightRange;
    
    let recommendationText = `Based on your height (${height} cm) and age (${age}), your ideal weight range is ${minIdealWeight}-${maxIdealWeight} kg.`;
    
    if (weightStatus === "below") {
      const weightToGain = minIdealWeight - weight;
      recommendationText += ` You are currently ${weightToGain} kg below this range. Consider focusing on healthy weight gain strategies.`;
    } else if (weightStatus === "above") {
      const weightToLose = weight - maxIdealWeight;
      recommendationText += ` You are currently ${weightToLose} kg above this range. Gradual weight loss may benefit your health.`;
    } else {
      recommendationText += ` Your current weight of ${weight} kg is within this healthy range. Focus on maintaining your weight with balanced nutrition.`;
    }
    
    return recommendationText;
  };
  
  const weightRecommendation = getWeightRecommendation();
  
  // Calculate ideal daily calorie intake based on user profile
  const calculateIdealCalories = () => {
    if (!age || !weight || !height || !gender) return null;
    
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'Male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    // Apply activity multiplier (assuming moderate activity)
    const maintainCalories = Math.round(bmr * 1.55);
    
    // Adjust based on goal
    let goalCalories = maintainCalories;
    
    if (goal === 'Increase Weight') {
      goalCalories = maintainCalories + 500;
    } else if (goal === 'Lose Weight') {
      goalCalories = maintainCalories - 500;
    } else if (goal === 'Build Muscle') {
      goalCalories = maintainCalories + 300;
    }
    
    return {
      maintain: maintainCalories,
      goal: goalCalories
    };
  };
  
  const idealCalories = calculateIdealCalories();
  
  return (
    <div className="min-h-screen gradient-background pb-20">
      <Header />
      <ProfileHeader/>
      
      <main className="px-6 py-4 max-w-md mx-auto">
        <div className="mb-6 animate-fade-in">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">
            Daily Dashboard
          </h2>
          <p className="text-gray-600">
            Track your progress and get personalized recommendations
          </p>
        </div>
        
        {/* Health Metrics Section */}
        <div className="mb-6 animate-scale-in">
          <HealthMetrics 
            height={height}
            weight={weight}
            age={age}
            gender={gender}
          />
        </div>
        
        {/* Calorie Progress Section */}
        <div className="glass-card rounded-xl p-6 mb-6 animate-scale-in">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Daily Calories</h3>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              {totalCaloriesConsumed} of {dailyCalorieTarget} kcal
            </span>
            <span className="text-sm font-medium text-gray-800">
              {caloriePercentageFormatted}%
            </span>
          </div>
          
          <Progress value={caloriePercentage} className="h-3" />
          
          <div className="mt-4 text-sm text-gray-600">
            {dailyCalorieTarget - totalCaloriesConsumed > 0 ? (
              <p>{dailyCalorieTarget - totalCaloriesConsumed} kcal remaining today</p>
            ) : (
              <p>Daily calorie target reached</p>
            )}
          </div>
        </div>

        {/* AI Recommendation Section */}
        <AIRecommendationCard />
        
        {/* Daily Calorie Target Section */}
        {idealCalories && (
          <Card className="mb-6 animate-scale-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Daily Calorie Target</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
                <p className="text-sm text-gray-700 dark:text-gray-200">
                  Based on your age, weight, height, and gender, your maintenance calorie need is approximately {idealCalories.maintain} kcal/day.
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">
                  For your goal to {profile.goal?.toLowerCase() || 'maintain weight'}, we recommend a daily target of {idealCalories.goal} kcal.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Weight Analysis Section */}
        {weightRecommendation && (
          <Card className="mb-6 animate-scale-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Weight Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                <p className="text-sm text-gray-700 dark:text-gray-200">{weightRecommendation}</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Macronutrient Breakdown Section */}
        <div className="glass-card rounded-xl p-6 mb-6 animate-scale-in">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Macronutrient Breakdown</h3>
          
          {macroData.length > 0 ? (
            <div className="flex items-center">
              <div className="w-1/2 h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="w-1/2">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#4F46E5] mr-2"></div>
                    <span className="text-sm text-gray-700">Protein: {totalProtein}g</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#10B981] mr-2"></div>
                    <span className="text-sm text-gray-700">Carbs: {totalCarbs}g</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B] mr-2"></div>
                    <span className="text-sm text-gray-700">Fat: {totalFat}g</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              <p>No meals logged yet today</p>
              <p className="mt-2 text-sm">Log a meal to see your macronutrient breakdown</p>
            </div>
          )}
        </div>
        
        
      </main>
      
      <NavigationBar />
    </div>
  );
};

export default Dashboard;
