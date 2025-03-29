
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ProfileForm from '@/components/ProfileForm';
import { Button } from '@/components/ui/button';
import { LogOut, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import NavigationBar from '@/components/NavigationBar';

const Profile = () => {
  const { signOut } = useAuth();
  const { profile, initWaterReminders } = useUser();
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
  
  // Request notification permission if water reminders are enabled
  useEffect(() => {
    if (profile.receiveWaterReminders && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        toast({
          title: "Enable Notifications",
          description: "Allow notifications to receive water reminders",
          action: (
            <Button 
              onClick={() => {
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    initWaterReminders();
                    toast({
                      title: "Notifications enabled",
                      description: "You will receive water reminders during the day"
                    });
                  }
                });
              }}
              size="sm"
              className="bg-spark-500 hover:bg-spark-600"
            >
              <Bell className="h-4 w-4 mr-1" />
              Enable
            </Button>
          )
        });
      } else if (Notification.permission === 'granted') {
        // If permission is already granted, initialize reminders
        initWaterReminders();
      }
    }
  }, [profile.receiveWaterReminders, profile.waterReminderInterval]);
  
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
      
      <NavigationBar />
    </div>
  );
};

export default Profile;
