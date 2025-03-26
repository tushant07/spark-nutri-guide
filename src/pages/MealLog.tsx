
import { useState, useRef } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import NavigationBar from '@/components/NavigationBar';
import MealAnalysis from '@/components/MealAnalysis';
import AIRecommendation from '@/components/AIRecommendation';
import MealCameraPreview from '@/components/MealCameraPreview';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const MealLog = () => {
  const navigate = useNavigate();
  const { profile, totalCaloriesConsumed } = useUser();
  const { toast } = useToast();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [mealDetected, setMealDetected] = useState(false);
  const [mealLogged, setMealLogged] = useState(false);
  const [mealData, setMealData] = useState(null);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [showCameraPreview, setShowCameraPreview] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    await processImage(file);
  };
  
  const handleCameraCapture = (file: File) => {
    setShowCameraPreview(false);
    processImage(file);
  };
  
  const processImage = async (file: File) => {
    setUploadingPhoto(true);
    setAnalysisError(null);
    setMealDetected(false); // Reset meal detection state
    
    try {
      toast({
        title: "Processing image",
        description: "Analyzing your meal photo with AI",
      });
      
      // 1. Upload image to Supabase storage
      const fileName = `meal-${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('meal-images')
        .upload(fileName, file);
      
      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }
      
      // 2. Get the public URL for the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from('meal-images')
        .getPublicUrl(fileName);
      
      const imageUrl = publicUrlData.publicUrl;
      console.log("Image uploaded successfully, URL:", imageUrl);
      
      // 3. Call our edge function to analyze the meal
      try {
        const response = await supabase.functions.invoke('analyze-meal', {
          body: {
            imageUrl,
            userProfile: {
              goal: profile.goal,
              dailyCalorieTarget: profile.dailyCalorieTarget,
              totalCaloriesConsumed,
              gender: profile.gender
            }
          },
        });
        
        console.log("Analysis response:", response);
        
        if (!response.data || !response.data.success) {
          throw new Error(response.error || response.data?.error || 'Failed to analyze meal');
        }
        
        const { mealData: aiMealData, recommendation } = response.data;
        
        if (!aiMealData || !aiMealData.food_name) {
          throw new Error('Unable to detect food in the image. Please try with a clearer photo.');
        }
        
        // Process AI detected meal data
        const detectedMeal = {
          name: aiMealData.food_name || 'Unknown Food',
          calories: aiMealData.nutrition?.calories || 0,
          protein: aiMealData.nutrition?.protein || 0,
          carbs: aiMealData.nutrition?.carbs || 0,
          fat: aiMealData.nutrition?.fat || 0,
        };
        
        setMealData(detectedMeal);
        setAiRecommendation(recommendation);
        setMealDetected(true);
        
        toast({
          title: "Meal detected",
          description: `Detected: ${detectedMeal.name}`,
          duration: 3000,
        });
      } catch (apiError) {
        console.error("API error:", apiError);
        // Handle error from edge function
        throw new Error(apiError.message || 'Error communicating with meal analysis service');
      }
      
    } catch (error: any) {
      console.error("Error processing image:", error);
      setAnalysisError(error.message || "Please try again with a clearer photo of your food");
      toast({
        title: "Error analyzing meal",
        description: error.message || "Please try again with a clearer photo of your food",
        variant: "destructive"
      });
      
      // Important: Don't set any default meal data on error
      setMealData(null);
      setMealDetected(false);
    } finally {
      setUploadingPhoto(false);
    }
  };
  
  const handleLogMeal = () => {
    // Only allow logging if we have valid meal data
    if (!mealData || mealData.calories <= 0) {
      toast({
        title: "Cannot log meal",
        description: "No valid meal data detected",
        variant: "destructive"
      });
      return;
    }
    
    setMealLogged(true);
    
    toast({
      title: "Meal logged successfully",
      description: "Your nutrition data has been updated",
      duration: 3000,
    });
    
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };
  
  const handleRetry = () => {
    setAnalysisError(null);
    setMealDetected(false);
  };
  
  return (
    <div className="min-h-screen gradient-background pb-20">
      <Header />
      
      <main className="px-6 py-4 max-w-md mx-auto">
        {profile.created && (
          <div className="glass-card rounded-xl p-4 mb-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Daily Target</p>
                <p className="text-xl font-semibold text-gray-800">
                  {profile.dailyCalorieTarget} kcal
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Consumed</p>
                <p className="text-xl font-semibold text-gray-800">
                  {totalCaloriesConsumed} kcal
                </p>
              </div>
            </div>
            <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-spark-500 h-2 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(100, (totalCaloriesConsumed / (profile.dailyCalorieTarget || 2000)) * 100)}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {analysisError ? (
          <div className="glass-card rounded-xl p-6 animate-fade-in">
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Analysis Failed</AlertTitle>
              <AlertDescription>{analysisError}</AlertDescription>
            </Alert>
            <div className="flex flex-col items-center justify-center">
              <p className="text-gray-700 mb-6 text-center">
                Please try again with a clearer photo that shows your food clearly
              </p>
              <Button onClick={handleRetry} className="bg-spark-500 hover:bg-spark-600">
                Try Again
              </Button>
            </div>
          </div>
        ) : !mealDetected ? (
          showCameraPreview ? (
            <div className="glass-card rounded-xl p-0 overflow-hidden">
              <MealCameraPreview 
                onCapture={handleCameraCapture}
                onCancel={() => setShowCameraPreview(false)}
              />
            </div>
          ) : (
            <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center text-center h-64 animate-scale-in">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Log your meal
              </h2>
              
              <p className="text-gray-600 mb-6">
                Take a picture of your meal to get nutritional information
              </p>
              
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="flex gap-4">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {uploadingPhoto ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Upload size={18} />
                      <span>Upload</span>
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => setShowCameraPreview(true)}
                  disabled={uploadingPhoto}
                  variant="default"
                  className="flex items-center gap-2 bg-spark-500 hover:bg-spark-600"
                >
                  {uploadingPhoto ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Camera size={18} />
                      <span>Camera</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )
        ) : (
          <>
            <MealAnalysis 
              mealData={mealData} 
              onLogMeal={handleLogMeal} 
            />
            
            {mealLogged && aiRecommendation && (
              <div className="mt-6">
                <AIRecommendation recommendation={aiRecommendation} />
              </div>
            )}
          </>
        )}
      </main>
      
      <NavigationBar />
    </div>
  );
};

export default MealLog;
