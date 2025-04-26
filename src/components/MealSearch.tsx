
import { Construction } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const MealSearch = () => {
  return (
    <div className="mb-6">
      <Alert variant="default" className="bg-amber-50 border-amber-200">
        <Construction className="h-4 w-4 text-amber-500" />
        <AlertTitle className="text-amber-700">Under Construction</AlertTitle>
        <AlertDescription className="text-amber-600">
          The meal search feature is currently under development. We apologize for any inconvenience.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default MealSearch;
