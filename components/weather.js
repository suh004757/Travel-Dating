// Weather Widget Component
// Displays weather forecast for trip dates using OpenWeatherMap API

async function loadWeather(trip) {
    const container = document.getElementById('weather-widget');
    if (!container || !WEATHER_CONFIG.enabled) return;

    // Show loading
    container.innerHTML = `
        <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); 
                    padding: 15px; margin: 20px 0; border-radius: 10px; text-align: center;">
            <div style="color: #1976d2;">☁️ 날씨 정보 불러오는 중...</div>
        </div>
    `;

    if (!trip.start_date) {
        container.innerHTML = '';
        return;
    }

    try {
        // Get coordinates from base location
        const { lat, lng } = trip.base_location;

        // Call OpenWeatherMap API
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${WEATHER_CONFIG.apiKey}&units=metric&lang=kr`
        );

        if (!response.ok) throw new Error('날씨 API 호출 실패');

        const data = await response.json();

        // Filter forecasts for trip dates
        const startDate = new Date(trip.start_date);
        const endDate = new Date(trip.end_date);

        const forecasts = data.list.filter(item => {
            const date = new Date(item.dt * 1000);
            return date >= startDate && date <= endDate && item.dt_txt.includes('12:00:00');
        });

        if (forecasts.length === 0) {
            container.innerHTML = '';
            return;
        }

        // Render weather widget
        let weatherHTML = '<div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 20px; margin: 20px 0; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">';
        weatherHTML += '<h3 style="margin: 0 0 15px 0; color: #1976d2; font-size: 1.1rem;">🌤️ 날씨 예보</h3>';
        weatherHTML += '<div style="display: flex; gap: 15px; flex-wrap: wrap;">';

        forecasts.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const dateStr = date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
            const temp = Math.round(forecast.main.temp);
            const icon = getWeatherEmoji(forecast.weather[0].main);
            const desc = forecast.weather[0].description;

            weatherHTML += `
                <div style="flex: 1; min-width: 120px; background: white; padding: 12px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem;">${icon}</div>
                    <div style="font-size: 0.85rem; color: #666; margin: 5px 0;">${dateStr}</div>
                    <div style="font-size: 1.3rem; font-weight: bold; color: #1976d2;">${temp}°C</div>
                    <div style="font-size: 0.8rem; color: #888;">${desc}</div>
                </div>
            `;
        });

        weatherHTML += '</div>';

        // Add weather tips
        const avgTemp = forecasts.reduce((sum, f) => sum + f.main.temp, 0) / forecasts.length;
        const hasRain = forecasts.some(f => f.weather[0].main.includes('Rain'));

        let tips = '<div style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.5); border-radius: 5px; font-size: 0.9rem;">';
        tips += '<strong>💡 Tip:</strong> ';

        if (hasRain) {
            tips += '우산을 꼭 챙기세요! ☔';
        } else if (avgTemp < 5) {
            tips += '따뜻하게 입으세요! 🧥';
        } else if (avgTemp > 25) {
            tips += '가볍게 입고 선크림 챙기세요! ☀️';
        } else {
            tips += '날씨가 좋네요! 즐거운 시간 되세요! 😊';
        }

        tips += '</div>';
        weatherHTML += tips;
        weatherHTML += '</div>';

        container.innerHTML = weatherHTML;

    } catch (error) {
        console.error('Weather loading error:', error);
        container.innerHTML = `
            <div style="background: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 10px; text-align: center; color: #856404;">
                ⚠️ 날씨 정보를 불러올 수 없습니다. API 키를 확인하세요.
            </div>
        `;
    }
}

function getWeatherEmoji(condition) {
    const emojiMap = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Drizzle': '🌦️',
        'Thunderstorm': '⛈️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Fog': '🌫️'
    };
    return emojiMap[condition] || '🌤️';
}
