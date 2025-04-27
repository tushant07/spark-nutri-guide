
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const ProfileHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div className="fixed top-0 right-0 p-4 z-10">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => navigate('/profile')}
        className="mr-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm dark:text-gray-200"
      >
        <User size={20} className="text-spark-500" />
      </Button>
    </div>
  );
};

export default ProfileHeader;
