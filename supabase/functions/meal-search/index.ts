
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const calorieNinjasApiKey = Deno.env.get('CALORIE_NINJAS_API_KEY');

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
    // Get the query from the request
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Query parameter is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Searching for nutrition info: "${query}"`);
    
    // Call CalorieNinjas API
    const response = await fetch(`https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': calorieNinjasApiKey
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('CalorieNinjas API error:', error);
      throw new Error(`CalorieNinjas API returned ${response.status}: ${error}`);
    }
    
    const data = await response.json();
    console.log('API response:', JSON.stringify(data));
    
    if (data && data.items && data.items.length > 0) {
      const item = data.items[0];
      const mealData = {
        name: query,
        calories: item.calories,
        protein: item.protein_g,
        carbs: item.carbohydrates_total_g,
        fat: item.fat_total_g
      };
      
      return new Response(
        JSON.stringify({ success: true, mealData }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, message: 'No nutrition data found for this food' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
  } catch (error) {
    console.error('Error in meal-search function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
