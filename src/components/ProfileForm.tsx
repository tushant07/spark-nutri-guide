import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';

const ProfileForm = () => {
  const navigate = useNavigate();
  const { profile, setProfile } = useUser();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    gender: '',
    goal: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile.created && user) {
      setFormData({
        age: profile.age?.toString() || '',
        weight: profile.weight?.toString() || '',
        height: profile.height?.toString() || '',
        gender: profile.gender || '',
        goal: profile.goal || '',
      });
    }
  }, [profile, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateCalorieTarget = (goal: string, weight: number, gender: string): number => {
    let baseCalories = gender === 'Male' ? 2200 : 1900;
    
    switch (goal) {
      case 'Increase Weight':
        return baseCalories + 300;
      case 'Lose Weight':
        return baseCalories - 300;
      case 'Build Muscle':
        return baseCalories + 200;
      default:
        return baseCalories;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a profile",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const age = parseInt(formData.age);
      const weight = parseInt(formData.weight);
      const height = parseInt(formData.height);
      const gender = formData.gender as 'Male' | 'Female' | 'Other';
      const goal = formData.goal as 'Increase Weight' | 'Lose Weight' | 'Build Muscle';
      
      const dailyCalorieTarget = calculateCalorieTarget(goal, weight, gender);
      
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        age,
        weight,
        height,
        gender,
        goal,
        daily_calorie_target: dailyCalorieTarget
      });
      
      if (error) {
        throw error;
      }
      
      setProfile({
        age,
        weight,
        height,
        gender,
        goal,
        dailyCalorieTarget,
        created: true,
      });
      
      toast({
        title: profile.created ? "Profile updated" : "Profile created",
        description: profile.created 
          ? "Your profile has been updated successfully" 
          : "Your profile has been created successfully"
      });
      
      navigate('/dashboard');
      
    } catch (error: any) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive"
      });
      console.error("Error saving profile:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const buttonText = profile.created ? "Update Profile" : "Get Started";

  return (
    <div className="w-full max-w-md mx-auto animate-scale-in">
      <div className="glass-card rounded-2xl p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              id="age"
              name="age"
              type="number"
              required
              placeholder="Enter your age"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
              className="form-input"
            />
          </div>
          
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg)
            </label>
            <input
              id="weight"
              name="weight"
              type="number"
              required
              placeholder="Enter your weight in kg"
              value={formData.weight}
              onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
              className="form-input"
            />
          </div>
          
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
              Height (cm)
            </label>
            <input
              id="height"
              name="height"
              type="number"
              required
              placeholder="Enter your height in cm"
              value={formData.height}
              onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
              className="form-input"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
              Gender
            </Label>
            <Select 
              value={formData.gender} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
              required
            >
              <SelectTrigger id="gender" className="form-input">
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">
              Your Goal
            </label>
            <select
              id="goal"
              name="goal"
              required
              value={formData.goal}
              onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
              className="form-input"
            >
              <option value="" disabled>Select your goal</option>
              <option value="Increase Weight">Increase Weight</option>
              <option value="Lose Weight">Lose Weight</option>
              <option value="Build Muscle">Build Muscle</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full flex items-center justify-center"
          >
            {submitting ? (
              <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
            ) : (
              buttonText
            )}
          </button>
        </form>
      </div>
      
      <p className="text-sm text-center text-gray-500 px-4">
        Your data is used to calculate personalized nutritional recommendations. 
        We never share your information with third parties.
      </p>
    </div>
  );
};

export default ProfileForm;
