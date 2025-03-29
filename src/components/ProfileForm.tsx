
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
    allergies: [],
    receiveWaterReminders: false,
    waterReminderInterval: '2',
  });
  const [submitting, setSubmitting] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');

  useEffect(() => {
    if (profile.created && user) {
      setFormData({
        age: profile.age?.toString() || '',
        weight: profile.weight?.toString() || '',
        height: profile.height?.toString() || '',
        gender: profile.gender || '',
        goal: profile.goal || '',
        allergies: profile.allergies || [],
        receiveWaterReminders: profile.receiveWaterReminders || false,
        waterReminderInterval: profile.waterReminderInterval?.toString() || '2',
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

  const calculateCalorieTarget = (goal: string, weight: number, height: number, age: number, gender: string): number => {
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'Male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    // Apply activity multiplier (assuming moderate activity)
    const tdee = bmr * 1.55;
    
    // Adjust based on goal
    switch (goal) {
      case 'Increase Weight':
        return Math.round(tdee + 500);
      case 'Lose Weight':
        return Math.round(tdee - 500);
      case 'Build Muscle':
        return Math.round(tdee + 300);
      default:
        return Math.round(tdee);
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !formData.allergies.includes(newAllergy.trim())) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  const removeAllergy = (allergyToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter(allergy => allergy !== allergyToRemove)
    }));
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
      const allergies = formData.allergies;
      const receiveWaterReminders = formData.receiveWaterReminders;
      const waterReminderInterval = parseInt(formData.waterReminderInterval);
      
      const dailyCalorieTarget = calculateCalorieTarget(goal, weight, height, age, gender);
      
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        age,
        weight,
        height,
        gender,
        goal,
        daily_calorie_target: dailyCalorieTarget,
        allergies,
        receive_water_reminders: receiveWaterReminders,
        water_reminder_interval: waterReminderInterval
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
        allergies,
        receiveWaterReminders,
        waterReminderInterval,
        created: true,
      });
      
      toast({
        title: profile.created ? "Profile updated" : "Profile created",
        description: profile.created 
          ? "Your profile has been updated successfully" 
          : "Your profile has been created successfully"
      });
      
      console.log("Profile saved successfully, redirecting to dashboard");
      setTimeout(() => navigate('/dashboard'), 100);
      
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
              className="form-input"
            >
              <option value="" disabled>Select your goal</option>
              <option value="Increase Weight">Increase Weight</option>
              <option value="Lose Weight">Lose Weight</option>
              <option value="Build Muscle">Build Muscle</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allergies
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.allergies.map((allergy, index) => (
                <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center text-sm">
                  <span>{allergy}</span>
                  <button 
                    type="button" 
                    className="ml-1 text-blue-600 hover:text-blue-800"
                    onClick={() => removeAllergy(allergy)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="Add allergy (e.g., peanuts)"
                className="form-input flex-grow"
              />
              <button 
                type="button" 
                onClick={addAllergy}
                className="px-3 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
              >
                Add
              </button>
            </div>
          </div>
          
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <label htmlFor="receiveWaterReminders" className="text-sm font-medium text-gray-700">
                Water Reminders
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="receiveWaterReminders"
                  checked={formData.receiveWaterReminders}
                  onChange={(e) => setFormData(prev => ({ ...prev, receiveWaterReminders: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-spark-500"></div>
              </label>
            </div>
            
            {formData.receiveWaterReminders && (
              <div className="mt-2">
                <label htmlFor="waterReminderInterval" className="block text-sm font-medium text-gray-700 mb-1">
                  Reminder Interval (hours)
                </label>
                <select
                  id="waterReminderInterval"
                  name="waterReminderInterval"
                  value={formData.waterReminderInterval}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="1">Every 1 hour</option>
                  <option value="2">Every 2 hours</option>
                  <option value="3">Every 3 hours</option>
                  <option value="4">Every 4 hours</option>
                </select>
              </div>
            )}
            <p className="text-xs text-gray-500">Receive reminders to drink water during the day</p>
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
