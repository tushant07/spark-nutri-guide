
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NoDataCard = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="p-6 text-center animate-scale-in">
      <p className="text-gray-500 mb-4">No data available for the past week.</p>
      <p className="text-sm mb-6">Start logging your meals to see insights here.</p>
      <Button 
        onClick={() => navigate('/meal-log')} 
        className="bg-spark-500 hover:bg-spark-600 flex items-center gap-2"
      >
        <PlusCircle size={16} />
        <span>Log a Meal</span>
      </Button>
    </Card>
  );
};

export default NoDataCard;
