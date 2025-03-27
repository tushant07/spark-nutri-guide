
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';

const NoDataCard = () => {
  const navigate = useNavigate();
  const { fetchWeeklyData } = useUser();
  const { toast } = useToast();
  
  const handleRefresh = async () => {
    try {
      await fetchWeeklyData();
      toast({
        title: "Data refreshed",
        description: "We've checked for new data."
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };
  
  return (
    <Card className="p-6 text-center animate-scale-in">
      <p className="text-gray-500 mb-4">No data available for the past week.</p>
      <p className="text-sm mb-6">Start logging your meals to see insights here.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button 
          onClick={() => navigate('/meal-log')} 
          className="bg-spark-500 hover:bg-spark-600 flex items-center gap-2"
        >
          <PlusCircle size={16} />
          <span>Log a Meal</span>
        </Button>
        <Button 
          onClick={handleRefresh} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} />
          <span>Refresh Data</span>
        </Button>
      </div>
    </Card>
  );
};

export default NoDataCard;
