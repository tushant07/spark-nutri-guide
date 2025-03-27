
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const grokApiKey = Deno.env.get('GROK_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Safely parse request JSON
    let requestData;
    try {
      requestData = await req.json();
      console.log('Request data received:', JSON.stringify(requestData, null, 2));
    } catch (parseError) {
      console.error('Error parsing request JSON:', parseError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid JSON in request body' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { imageUrl, userProfile } = requestData;

    if (!imageUrl) {
      console.error('Missing image URL in request');
      return new Response(JSON.stringify({
        success: false,
        error: 'Image URL is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing image:', imageUrl);
    console.log('User profile:', userProfile);

    // Request to Grok API for food detection and analysis
    try {
      if (!grokApiKey) {
        throw new Error('GROK_API_KEY environment variable is not set');
      }

      const grokResponse = await fetch('https://api.grok.ai/v1/vision/analyze-food', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${grokApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "grok-2-vision-latest",
          image_url: imageUrl,
          include_nutrition: true,
        }),
      });

      // Check if the request was successful
      if (!grokResponse.ok) {
        let errorText = '';
        try {
          const errorJson = await grokResponse.json();
          errorText = JSON.stringify(errorJson);
        } catch {
          errorText = await grokResponse.text();
        }
        
        console.error('Grok API Error:', errorText);
        throw new Error(`Grok API error: ${grokResponse.status} - ${errorText}`);
      }

      // Parse the response
      let foodData;
      try {
        foodData = await grokResponse.json();
        console.log('Food data from Grok:', JSON.stringify(foodData, null, 2));
      } catch (parseError) {
        console.error('Error parsing Grok API response:', parseError);
        throw new Error('Invalid response from Grok API');
      }
      
      // Validate the food data
      if (!foodData.food_name || !foodData.nutrition) {
        throw new Error('Unable to identify food in the image. Please try again with a clearer photo.');
      }
      
      // Generate personalized recommendation based on the food and user profile
      let recommendation = null;
      
      if (userProfile && foodData) {
        // Use the detected meal data to create a tailored recommendation
        const { goal, dailyCalorieTarget, totalCaloriesConsumed } = userProfile;
        
        const mealCalories = foodData.nutrition?.calories || 0;
        const mealCarbs = foodData.nutrition?.carbs || 0;
        const mealProtein = foodData.nutrition?.protein || 0;
        const mealFat = foodData.nutrition?.fat || 0;
        
        const remainingCalories = (dailyCalorieTarget || 2000) - totalCaloriesConsumed - mealCalories;
        
        // Generate recommendation based on user's goal and current nutritional status
        recommendation = {
          text: `Based on your ${goal} goal and this meal:`,
          suggestion: generateSuggestion(goal, remainingCalories, mealCarbs, mealProtein, mealFat),
          nutritionalBalance: assessNutritionalBalance(mealCarbs, mealProtein, mealFat, goal),
        };
      }

      return new Response(JSON.stringify({ 
        success: true,
        mealData: foodData,
        recommendation
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (grokError) {
      console.error('Error calling Grok API:', grokError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: grokError.message || 'Error analyzing food image' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in analyze-meal function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to generate meal suggestions
function generateSuggestion(goal, remainingCalories, carbs, protein, fat) {
  if (goal === 'Lose Weight') {
    if (remainingCalories < 300) {
      return "You're close to your calorie limit. Consider a light snack like Greek yogurt or vegetables for the rest of the day.";
    } else if (carbs > 60) {
      return "This meal is high in carbs. For your next meal, focus on lean proteins and vegetables to balance your daily intake.";
    } else {
      return "Good job balancing your meal. Keep focusing on nutrient-dense foods with lean protein and vegetables.";
    }
  } else if (goal === 'Build Muscle') {
    if (protein < 20) {
      return "This meal is low in protein. Consider adding a protein shake or high-protein snack to help meet your muscle-building goals.";
    } else {
      return "Good protein intake in this meal. Continue with balanced meals including complex carbs for energy.";
    }
  } else if (goal === 'Increase Weight') {
    if (remainingCalories > 1000) {
      return "You still need more calories today. Consider adding nutrient-dense foods like nuts, avocados, or a protein smoothie with full-fat yogurt.";
    } else {
      return "You're on track with your calorie goals. Keep up the balanced intake of proteins, healthy fats, and carbs.";
    }
  } else {
    return "Maintain a balanced diet with plenty of vegetables, lean proteins, and whole grains.";
  }
}

// Helper function to assess nutritional balance
function assessNutritionalBalance(carbs, protein, fat, goal) {
  // Calculate approximate percentages
  const total = carbs + protein + fat;
  if (total === 0) return "Unable to assess nutritional balance";
  
  const carbPercentage = Math.round((carbs / total) * 100);
  const proteinPercentage = Math.round((protein / total) * 100);
  const fatPercentage = Math.round((fat / total) * 100);
  
  let assessment = `Meal composition: ~${carbPercentage}% carbs, ~${proteinPercentage}% protein, ~${fatPercentage}% fat. `;
  
  if (goal === 'Lose Weight' && carbPercentage > 50) {
    assessment += "For weight loss, consider reducing carbohydrate intake.";
  } else if (goal === 'Build Muscle' && proteinPercentage < 30) {
    assessment += "For muscle building, aim for higher protein intake.";
  } else if (goal === 'Increase Weight' && fatPercentage < 25) {
    assessment += "For weight gain, healthy fats can help increase calorie intake.";
  } else {
    assessment += "This balance aligns well with your goals.";
  }
  
  return assessment;
}
