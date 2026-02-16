// Weather Widget Component
// Displays weather forecast for trip dates using OpenWeatherMap API

async function loadWeather(trip) {
    const container = document.getElementById('weather-widget');
    if (!container || !WEATHER_CONFIG.enabled) return;

    if (!trip?.base_location || !trip.base_location.lat || !trip.base_location.lng) {
        container.innerHTML = '';
        return;
    }

    if (!WEATHER_CONFIG.apiKey) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <div class="weather-summary">Loading weather forecast...</div>
    `;

    if (!trip.start_date) {
        container.innerHTML = '';
        return;
    }

    try {
        const { lat, lng } = trip.base_location;

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${WEATHER_CONFIG.apiKey}&units=metric&lang=en`
        );

        if (!response.ok) throw new Error('Weather API request failed');

        const data = await response.json();

        const startDate = new Date(trip.start_date);
        const endDate = trip.end_date ? new Date(trip.end_date) : startDate;

        const forecasts = data.list.filter(item => {
            const date = new Date(item.dt * 1000);
            return date >= startDate && date <= endDate && item.dt_txt.includes('12:00:00');
        });

        if (forecasts.length === 0) {
            container.innerHTML = '';
            return;
        }

        let weatherHTML = '<div class="weather-summary">';
        weatherHTML += '<div style="font-weight: 700; margin-bottom: 10px; color: #1d4d8f;">Weather Forecast</div>';
        weatherHTML += '<div class="weather-row">';

        forecasts.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
            const temp = Math.round(forecast.main.temp);
            const icon = getWeatherEmoji(forecast.weather[0].main);
            const desc = forecast.weather[0].description;

            weatherHTML += `
                <div class="weather-day">
                    <div class="weather-day-icon">${icon}</div>
                    <div style="font-size: 0.85rem; color: #666; margin: 5px 0;">${dateStr}</div>
                    <div class="weather-day-temp">${temp}°C</div>
                    <div style="font-size: 0.8rem; color: #888; text-transform: capitalize;">${desc}</div>
                </div>
            `;
        });

        weatherHTML += '</div>';

        const avgTemp = forecasts.reduce((sum, forecast) => sum + forecast.main.temp, 0) / forecasts.length;
        const hasRain = forecasts.some(forecast => forecast.weather[0].main.includes('Rain'));

        let tips = '<div style="margin-top: 12px; padding: 10px; background: rgba(255,255,255,0.55); border-radius: 6px; font-size: 0.9rem;">';
        tips += '<strong>Tip:</strong> ';

        if (hasRain) {
            tips += 'Bring an umbrella.';
        } else if (avgTemp < 5) {
            tips += 'Wear warm layers.';
        } else if (avgTemp > 25) {
            tips += 'Dress light and use sunscreen.';
        } else {
            tips += 'Great weather for a date day.';
        }

        tips += '</div>';
        weatherHTML += tips;
        weatherHTML += '</div>';

        container.innerHTML = weatherHTML;
    } catch (error) {
        console.error('Weather loading error:', error);
        container.innerHTML = `
            <div class="weather-summary" style="background: #fff3cd; color: #856404; text-align: center;">
                Could not load weather data. Please check your API key.
            </div>
        `;
    }
}

function getWeatherEmoji(condition) {
    const emojiMap = {
        Clear: 'SUN',
        Clouds: 'CLOUD',
        Rain: 'RAIN',
        Drizzle: 'DRIZZLE',
        Thunderstorm: 'STORM',
        Snow: 'SNOW',
        Mist: 'MIST',
        Fog: 'FOG'
    };

    return emojiMap[condition] || 'WEATHER';
}
