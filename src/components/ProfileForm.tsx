
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';

const ProfileForm = () => {
  const navigate = useNavigate();
  const { setProfile } = useUser();
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    goal: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateCalorieTarget = (goal: string, weight: number): number => {
    switch (goal) {
      case 'Increase Weight':
        return 2500;
      case 'Lose Weight':
        return 1800;
      case 'Build Muscle':
        return 2200;
      default:
        return 2000;
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
      const goal = formData.goal as 'Increase Weight' | 'Lose Weight' | 'Build Muscle';
      
      const dailyCalorieTarget = calculateCalorieTarget(goal, weight);
      
      setProfile({
        age,
        weight,
        height,
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
