
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // This is a temporary authentication solution
    // It will be replaced with Supabase auth later
    setTimeout(() => {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/profile');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen gradient-background flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md w-full mx-auto mb-8 animate-scale-in">
        <div className="w-20 h-20 bg-spark-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <div className="w-5 h-5 bg-spark-500 rounded-full animate-pulse-subtle"></div>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-3 text-spark-800">
          Spark<span className="text-spark-500">.</span>
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Your smart diet companion
        </p>
      </div>

      <div className="w-full max-w-md glass-card rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-semibold text-center mb-6 text-spark-800">Sign Up</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input w-full"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input w-full"
              placeholder="Create a password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/sign-in')}
              className="text-spark-500 hover:text-spark-600"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
