
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Header from '@/components/Header';
import NavigationBar from '@/components/NavigationBar';
import { useUser } from '@/context/UserContext';
import { Progress } from '@/components/ui/progress';
import AIRecommendation from '@/components/AIRecommendation';
import ProfileHeader from '@/components/ProfileHeader';


const Dashboard = () => {
  const { profile, loggedMeals, totalCaloriesConsumed } = useUser();
  const { dailyCalorieTarget = 2000 } = profile;
  
  // Calculate macros totals
  const totalProtein = loggedMeals.reduce((total, meal) => total + meal.protein, 0);
  const totalCarbs = loggedMeals.reduce((total, meal) => total + meal.carbs, 0);
  const totalFat = loggedMeals.reduce((total, meal) => total + meal.fat, 0);
  
  // Calculate percentage for progress bar
  const caloriePercentage = Math.min(100, (totalCaloriesConsumed / dailyCalorieTarget) * 100);
  
  // Data for macro pie chart
  const macroData = [
    { name: 'Protein', value: totalProtein, color: '#4F46E5' },
    { name: 'Carbs', value: totalCarbs, color: '#10B981' },
    { name: 'Fat', value: totalFat, color: '#F59E0B' },
  ].filter(item => item.value > 0);
  
  // Calculate calorie percentage in a human-readable format
  const caloriePercentageFormatted = Math.round(caloriePercentage);
  
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
              <p>No meals logged yet</p>
              <p className="mt-2 text-sm">Log a meal to see your macronutrient breakdown</p>
            </div>
          )}
        </div>
        
        {/* AI Recommendation Section */}
        <AIRecommendation />
      </main>
      
      <NavigationBar />
    </div>
  );
};

export default Dashboard;
