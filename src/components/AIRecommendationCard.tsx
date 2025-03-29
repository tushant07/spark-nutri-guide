
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';

const AIRecommendationCard = () => {
  const { profile, getAIRecommendation } = useUser();
  const [recommendation, setRecommendation] = useState(getAIRecommendation());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      const newRecommendation = getAIRecommendation();
      setRecommendation(newRecommendation);
      setIsLoading(false);
      toast({
        title: "Recommendation updated",
        description: "We've generated a new meal suggestion for you"
      });
    }, 600); // Add a small delay to make the loading state visible
  };

  return (
    <Card className="mb-6 animate-scale-in">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-spark-500" />
            <CardTitle className="text-lg">AI Recommendation</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-gray-500 hover:text-spark-500"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">{recommendation}</p>
        
        <p className="mt-4 text-xs text-gray-500">
          Based on your {profile.dietaryPreference || 'dietary preferences'} and goal to {profile.goal || 'improve health'}
        </p>
      </CardContent>
    </Card>
  );
};

export default AIRecommendationCard;
