
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
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
        className="mr-2 bg-white/80 backdrop-blur-sm shadow-sm"
      >
        <User size={20} className="text-spark-500" />
      </Button>
    </div>
  );
};

export default ProfileHeader;
