
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const ProfileForm = () => {
  const navigate = useNavigate();
  const { setProfile } = useUser();
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    gender: '',
    goal: '',
  });
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate form processing
    setTimeout(() => {
      const age = parseInt(formData.age);
      const weight = parseInt(formData.weight);
      const height = parseInt(formData.height);
      const gender = formData.gender as 'Male' | 'Female' | 'Other';
      const goal = formData.goal as 'Increase Weight' | 'Lose Weight' | 'Build Muscle';
      
      const dailyCalorieTarget = calculateCalorieTarget(goal, weight, gender);
      
      setProfile({
        age,
        weight,
        height,
        gender,
        goal,
        dailyCalorieTarget,
        created: true,
      });
      
      navigate('/meal-log');
      setSubmitting(false);
    }, 800);
  };

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
              onValueChange={(value) => handleSelectChange('gender', value)}
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
          
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full flex items-center justify-center"
          >
            {submitting ? (
              <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
            ) : (
              'Get Started'
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
