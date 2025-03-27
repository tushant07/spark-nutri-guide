
import { Card } from '@/components/ui/card';

const NoDataCard = () => {
  return (
    <Card className="p-6 text-center animate-scale-in">
      <p className="text-gray-500 mb-4">No data available for the past week.</p>
      <p className="text-sm">Start logging your meals to see insights here.</p>
    </Card>
  );
};

export default NoDataCard;
