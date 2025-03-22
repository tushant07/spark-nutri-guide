
import { SignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const SignInPage = () => {
  const navigate = useNavigate();

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
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          redirectUrl="/dashboard"
          appearance={{
            elements: {
              formButtonPrimary: "bg-spark-500 hover:bg-spark-600 text-white",
              card: "shadow-none bg-transparent",
              headerTitle: "text-spark-800",
              headerSubtitle: "text-gray-600",
            }
          }}
        />
      </div>
    </div>
  );
};

export default SignInPage;
