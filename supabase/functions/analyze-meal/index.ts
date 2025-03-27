import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const xaiApiKey = Deno.env.get('XAI_API_KEY');
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

    // Request to x.ai API for food detection and analysis
    try {
      if (!xaiApiKey) {
        throw new Error('XAI_API_KEY environment variable is not set');
      }

      // First download the image from Supabase storage to check and convert format if needed
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image from URL: ${imageResponse.status} ${imageResponse.statusText}`);
      }

      // Get the content type from the response headers
      const contentType = imageResponse.headers.get('content-type');
      console.log('Original image content type:', contentType);

      // Check if content type is supported
      const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!contentType || !supportedTypes.includes(contentType)) {
        console.log('Converting image to supported format...');
        
        // Get the image as blob
        const imageBlob = await imageResponse.blob();
        
        // Create a new URL from the blob for the API
        const formData = new FormData();
        formData.append('file', imageBlob, 'food_image.jpg');
        
        // Use a temporary URL for the converted image
        const imageArrayBuffer = await imageBlob.arrayBuffer();
        const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageArrayBuffer)));
        const dataUrl = `data:image/jpeg;base64,${base64Image}`;
        
        // Now use the data URL for the vision API
        const xaiResponse = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${xaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "grok-2-vision-latest",
            messages: [
              {
                role: "system",
                content: "You are a nutrition expert that analyzes food images. Respond with ONLY a valid JSON object containing: food_name (string), nutrition: { calories (number), protein (g, number), carbs (g, number), fat (g, number) }. No text before or after the JSON."
              },
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: {
                      url: dataUrl,
                      detail: "high",
                    },
                  },
                  {
                    type: "text",
                    text: "Analyze this food image and provide the food name, calories, protein, carbs, and fat content in JSON format."
                  },
                ],
              },
            ],
          }),
        });
        
        // Rest of processing remains the same
        if (!xaiResponse.ok) {
          let errorText = '';
          try {
            const errorJson = await xaiResponse.json();
            errorText = JSON.stringify(errorJson);
          } catch {
            errorText = await xaiResponse.text();
          }
          
          console.error('x.ai API Error:', errorText);
          throw new Error(`x.ai API error: ${xaiResponse.status} - ${errorText}`);
        }

        // Parse the response
        const xaiData = await xaiResponse.json();
        console.log('Raw response from x.ai:', JSON.stringify(xaiData, null, 2));
        
        // Extract the AI's response content
        const responseContent = xaiData.choices[0].message.content;
        console.log('AI response content:', responseContent);
        
        // Parse the JSON from the response
        let foodData;
        try {
          // Find JSON in the response - sometimes the AI might wrap it in ```json and ```
          let jsonContent = responseContent;
          
          // Remove markdown code blocks if present
          if (jsonContent.includes('```json')) {
            jsonContent = jsonContent.split('```json')[1].split('```')[0].trim();
          } else if (jsonContent.includes('```')) {
            jsonContent = jsonContent.split('```')[1].split('```')[0].trim();
          }
          
          foodData = JSON.parse(jsonContent);
          console.log('Parsed food data:', JSON.stringify(foodData, null, 2));
        } catch (jsonError) {
          console.error('Error parsing food data JSON:', jsonError, 'Raw content:', responseContent);
          throw new Error('Could not parse food data from AI response');
        }
        
        // Validate the food data
        if (!foodData.food_name || !foodData.nutrition) {
          console.error('Invalid food data structure:', foodData);
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
      } else {
        // If content type is already supported, proceed with original URL
        const xaiResponse = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${xaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "grok-2-vision-latest",
            messages: [
              {
                role: "system",
                content: "You are a nutrition expert that analyzes food images. Respond with ONLY a valid JSON object containing: food_name (string), nutrition: { calories (number), protein (g, number), carbs (g, number), fat (g, number) }. No text before or after the JSON."
              },
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: {
                      url: imageUrl,
                      detail: "high",
                    },
                  },
                  {
                    type: "text",
                    text: "Analyze this food image and provide the food name, calories, protein, carbs, and fat content in JSON format."
                  },
                ],
              },
            ],
          }),
        });

        // Check if the request was successful
        if (!xaiResponse.ok) {
          let errorText = '';
          try {
            const errorJson = await xaiResponse.json();
            errorText = JSON.stringify(errorJson);
          } catch {
            errorText = await xaiResponse.text();
          }
          
          console.error('x.ai API Error:', errorText);
          throw new Error(`x.ai API error: ${xaiResponse.status} - ${errorText}`);
        }

        // Parse the response
        const xaiData = await xaiResponse.json();
        console.log('Raw response from x.ai:', JSON.stringify(xaiData, null, 2));
        
        // Extract the AI's response content
        const responseContent = xaiData.choices[0].message.content;
        console.log('AI response content:', responseContent);
        
        // Parse the JSON from the response
        let foodData;
        try {
          // Find JSON in the response - sometimes the AI might wrap it in ```json and ```
          let jsonContent = responseContent;
          
          // Remove markdown code blocks if present
          if (jsonContent.includes('```json')) {
            jsonContent = jsonContent.split('```json')[1].split('```')[0].trim();
          } else if (jsonContent.includes('```')) {
            jsonContent = jsonContent.split('```')[1].split('```')[0].trim();
          }
          
          foodData = JSON.parse(jsonContent);
          console.log('Parsed food data:', JSON.stringify(foodData, null, 2));
        } catch (jsonError) {
          console.error('Error parsing food data JSON:', jsonError, 'Raw content:', responseContent);
          throw new Error('Could not parse food data from AI response');
        }
        
        // Validate the food data
        if (!foodData.food_name || !foodData.nutrition) {
          console.error('Invalid food data structure:', foodData);
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
      }
    } catch (apiError) {
      console.error('Error calling x.ai API:', apiError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: apiError.message || 'Error analyzing food image' 
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
