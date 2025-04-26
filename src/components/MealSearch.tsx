
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const MealSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast({
        title: "Please enter a meal",
        description: "Type what you'd like to eat to get nutritional information",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Use our dedicated meal-search edge function
      const { data, error } = await supabase.functions.invoke('meal-search', {
        body: {
          query: searchQuery
        },
      });
      
      if (error) throw new Error(error.message);
      
      if (data && data.success && data.mealData) {
        toast({
          title: "Meal Information",
          description: `${data.mealData.name}: ${Math.round(data.mealData.calories)} calories`,
        });
      } else {
        toast({
          title: "No Information Found",
          description: "Couldn't find nutritional information for this meal",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error searching meal:', error);
      toast({
        title: "Error",
        description: "Unable to get meal information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-xl p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Search Meal Information</h3>
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="What would you like to eat? (e.g., pizza)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading} className="bg-spark-500 hover:bg-spark-600">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>
    </div>
  );
};

export default MealSearch;
