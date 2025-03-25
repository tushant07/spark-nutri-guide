
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ProfileForm from '@/components/ProfileForm';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account"
      });
      navigate('/sign-in');
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "There was a problem logging you out",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="min-h-screen gradient-background pb-20">
      <Header />
      
      <main className="px-6 py-4 max-w-md mx-auto">
        <div className="mb-6 animate-fade-in">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">
            Your Profile
          </h2>
          <p className="text-gray-600">
            We use this information to personalize your nutrition plan
          </p>
        </div>
        
        <ProfileForm />
        
        <div className="mt-8">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2 text-gray-700 border-gray-300"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
