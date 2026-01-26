// Supabase Configuration
// IMPORTANT: Replace these values with your actual Supabase project credentials
// You can find these in your Supabase Dashboard > Settings > API

const SUPABASE_CONFIG = {
    url: 'https://ssutdzqexamonhqdbxvd.supabase.co', // e.g., 'https://xxxxx.supabase.co'
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzdXRkenFleGFtb25ocWRieHZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNzg5OTIsImV4cCI6MjA4NDk1NDk5Mn0.I2bokEZAl0pXAxlaEgMXhlvbOhWvqd1ej6pLkPTHLx8' // Your public anon key
};

// Weather API Configuration (Optional - using OpenWeatherMap)
const WEATHER_CONFIG = {
    apiKey: '4f862a24be01f4d5f25e26f5a49dd3ee', // Get free key from openweathermap.org
    enabled: true // Set to false to disable weather features
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SUPABASE_CONFIG, WEATHER_CONFIG };
}
