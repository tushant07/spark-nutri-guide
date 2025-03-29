
import { useUser } from '@/context/UserContext';
import { AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface AIRecommendationProps {
  recommendation?: {
    text: string;
    suggestion: string;
    nutritionalBalance: string;
  };
}

const AIRecommendation = ({ recommendation: initialRecommendation }: AIRecommendationProps) => {
  const { profile, totalCaloriesConsumed, getNewMealRecommendation } = useUser();
  const [recommendation, setRecommendation] = useState(initialRecommendation || getNewMealRecommendation());
  
  const { 
    dailyCalorieTarget = 2000, 
    allergies = [],
    dietaryPreference
  } = profile;
  
  // Handle refresh button click
  const handleRefresh = () => {
    setRecommendation(getNewMealRecommendation());
  };
  
  if (!recommendation.text) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-xl p-6 relative overflow-hidden"
    >
      {/* Magical sparkle effect in the corner */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-50">
        <Sparkles className="absolute top-4 right-4 text-spark-500 animate-pulse-subtle" size={18} />
        <div className="absolute top-8 right-8 w-3 h-3 rounded-full bg-spark-200 animate-pulse-subtle"></div>
        <div className="absolute top-6 right-12 w-2 h-2 rounded-full bg-spark-300 animate-pulse-subtle"></div>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            className="w-2 h-2 rounded-full bg-spark-500 mr-2"
          ></motion.div>
          <h3 className="text-sm font-medium text-gray-500">AI RECOMMENDATION</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          className="text-gray-500 hover:text-spark-500 transition-all duration-300 hover:scale-105"
        >
          <RefreshCw size={16} className="mr-1 transition-transform duration-300 hover:rotate-180" />
          New Suggestion
        </Button>
      </div>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-800 mb-3"
      >
        {recommendation.text}
      </motion.p>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-spark-100 shadow-md transition-all duration-300 hover:shadow-lg"
      >
        <p className="font-medium text-spark-800">{recommendation.suggestion}</p>
      </motion.div>
      
      {dietaryPreference && dietaryPreference !== 'No Preference' && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 p-4 bg-purple-50/80 backdrop-blur-sm rounded-lg border border-purple-100 shadow-sm transition-all duration-300 hover:shadow-md"
        >
          <h4 className="font-medium text-purple-700 mb-1">Dietary Preference</h4>
          <p className="text-sm text-gray-700">
            Your meal suggestions are tailored to your {dietaryPreference.toLowerCase()} diet preference.
          </p>
        </motion.div>
      )}
      
      {allergies.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 p-4 bg-amber-50/80 backdrop-blur-sm rounded-lg border border-amber-100 shadow-sm transition-all duration-300 hover:shadow-md"
        >
          <div className="flex items-center text-amber-700 mb-1">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <h4 className="font-medium">Your Allergies</h4>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {allergies.map((allergy, index) => (
              <motion.span 
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + (index * 0.1) }}
                className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs transition-all duration-300 hover:bg-amber-200"
              >
                {allergy}
              </motion.span>
            ))}
          </div>
          <p className="text-xs text-gray-700 mt-2">
            Be careful with these ingredients. We'll alert you if they're detected in your food.
          </p>
        </motion.div>
      )}
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-4 p-4 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md"
      >
        <p className="text-sm text-gray-700">{recommendation.nutritionalBalance}</p>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-4 pt-4 border-t border-gray-100"
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">Daily Progress</span>
          <span className="text-sm font-medium">
            {totalCaloriesConsumed} / {dailyCalorieTarget} kcal
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (totalCaloriesConsumed / dailyCalorieTarget) * 100)}%` }}
            transition={{ duration: 1, delay: 0.8 }}
            className="bg-spark-500 h-2 rounded-full"
          ></motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AIRecommendation;
