import { NextResponse } from 'next/server';

// Ethiopian cities coordinates
const ETHIOPIAN_CITIES = [
  { name: 'Addis Ababa', lat: 9.03, lon: 38.74, region: 'Addis Ababa' },
  { name: 'Bahir Dar', lat: 11.59, lon: 37.39, region: 'Amhara Region' },
  { name: 'Mekelle', lat: 13.50, lon: 39.47, region: 'Tigray Region' },
  { name: 'Hawassa', lat: 7.06, lon: 38.48, region: 'Sidama Region' },
  { name: 'Dire Dawa', lat: 9.59, lon: 41.87, region: 'Dire Dawa' },
  { name: 'Gondar', lat: 12.60, lon: 37.47, region: 'Amhara Region' },
  { name: 'Jimma', lat: 7.67, lon: 36.83, region: 'Oromia Region' },
  { name: 'Adama', lat: 8.54, lon: 39.27, region: 'Oromia Region' },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'Addis Ababa';
    
    // Find city coordinates
    const cityData = ETHIOPIAN_CITIES.find(c => c.name === city) || ETHIOPIAN_CITIES[0];
    
    // Use OpenWeatherMap API (free tier)
    const apiKey = process.env.OPENWEATHER_API_KEY || 'demo'; // Add your API key
    
    // If no API key, return simulated real-time data
    if (apiKey === 'demo' || !apiKey) {
      return NextResponse.json(generateSimulatedWeather(cityData));
    }
    
    // Fetch real weather data
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${cityData.lat}&lon=${cityData.lon}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${cityData.lat}&lon=${cityData.lon}&appid=${apiKey}&units=metric`;
    
    const [weatherRes, forecastRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(forecastUrl)
    ]);
    
    if (!weatherRes.ok || !forecastRes.ok) {
      return NextResponse.json(generateSimulatedWeather(cityData));
    }
    
    const weather = await weatherRes.json();
    const forecast = await forecastRes.json();
    
    return NextResponse.json({
      city: cityData.name,
      region: cityData.region,
      current: {
        temp: Math.round(weather.main.temp),
        feels_like: Math.round(weather.main.feels_like),
        humidity: weather.main.humidity,
        pressure: weather.main.pressure,
        wind_speed: Math.round(weather.wind.speed * 3.6), // Convert m/s to km/h
        wind_direction: weather.wind.deg,
        description: weather.weather[0].description,
        icon: weather.weather[0].icon,
        clouds: weather.clouds.all,
        visibility: weather.visibility / 1000, // Convert to km
        sunrise: new Date(weather.sys.sunrise * 1000).toLocaleTimeString(),
        sunset: new Date(weather.sys.sunset * 1000).toLocaleTimeString(),
      },
      forecast: forecast.list.slice(0, 8).map((item: any) => ({
        time: new Date(item.dt * 1000).toLocaleString(),
        temp: Math.round(item.main.temp),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        rain: item.rain?.['3h'] || 0,
      })),
      alerts: generateWeatherAlerts(weather, cityData.region),
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Weather API error:', err);
    // Return simulated data on error
    const cityData = ETHIOPIAN_CITIES[0];
    return NextResponse.json(generateSimulatedWeather(cityData));
  }
}

function generateSimulatedWeather(cityData: any) {
  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 18;
  const season = getEthiopianSeason();
  
  // Simulate realistic Ethiopian weather
  let baseTemp = 20;
  let humidity = 50;
  let rainChance = 0;
  
  if (season === 'Kiremt') {
    baseTemp = 18;
    humidity = 75;
    rainChance = 0.7;
  } else if (season === 'Bega') {
    baseTemp = 22;
    humidity = 40;
    rainChance = 0.1;
  } else if (season === 'Belg') {
    baseTemp = 20;
    humidity = 60;
    rainChance = 0.4;
  }
  
  const temp = baseTemp + Math.random() * 8 - 4;
  const willRain = Math.random() < rainChance;
  
  return {
    city: cityData.name,
    region: cityData.region,
    current: {
      temp: Math.round(temp),
      feels_like: Math.round(temp + (Math.random() * 4 - 2)),
      humidity: Math.round(humidity + Math.random() * 20 - 10),
      pressure: Math.round(1013 + Math.random() * 20 - 10),
      wind_speed: Math.round(5 + Math.random() * 15),
      wind_direction: Math.round(Math.random() * 360),
      description: willRain ? 'light rain' : (isDay ? 'partly cloudy' : 'clear sky'),
      icon: willRain ? '10d' : (isDay ? '02d' : '01n'),
      clouds: Math.round(willRain ? 70 + Math.random() * 30 : Math.random() * 40),
      visibility: Math.round(8 + Math.random() * 4),
      sunrise: '06:15 AM',
      sunset: '06:30 PM',
    },
    forecast: Array.from({ length: 8 }, (_, i) => ({
      time: new Date(Date.now() + i * 3 * 60 * 60 * 1000).toLocaleString(),
      temp: Math.round(temp + Math.random() * 6 - 3),
      description: Math.random() > 0.5 ? 'partly cloudy' : 'clear sky',
      icon: '02d',
      rain: willRain ? Math.random() * 5 : 0,
    })),
    alerts: generateWeatherAlerts({ main: { temp, humidity } }, cityData.region),
    timestamp: new Date().toISOString(),
    simulated: true,
    season,
  };
}

function getEthiopianSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 9) return 'Kiremt'; // Main rainy season
  if (month >= 10 || month <= 2) return 'Bega'; // Dry season
  return 'Belg'; // Short rainy season
}

function generateWeatherAlerts(weather: any, region: string) {
  const alerts = [];
  const temp = weather.main.temp;
  const humidity = weather.main.humidity;
  const season = getEthiopianSeason();
  
  // Temperature alerts
  if (temp > 30) {
    alerts.push({
      type: 'Heat Warning',
      severity: 'High',
      message: `High temperature of ${Math.round(temp)}°C in ${region}. Ensure adequate irrigation and protect sensitive crops.`,
      icon: 'Thermometer',
    });
  } else if (temp < 10) {
    alerts.push({
      type: 'Frost Warning',
      severity: 'High',
      message: `Low temperature of ${Math.round(temp)}°C expected. Protect crops from frost damage.`,
      icon: 'CloudSnow',
    });
  }
  
  // Humidity alerts
  if (humidity > 80) {
    alerts.push({
      type: 'High Humidity Alert',
      severity: 'Medium',
      message: `Humidity at ${humidity}%. Monitor for fungal diseases and ensure proper ventilation.`,
      icon: 'CloudRain',
    });
  } else if (humidity < 30) {
    alerts.push({
      type: 'Dry Conditions',
      severity: 'Medium',
      message: `Low humidity at ${humidity}%. Increase irrigation frequency.`,
      icon: 'CloudSun',
    });
  }
  
  // Seasonal alerts
  if (season === 'Kiremt') {
    alerts.push({
      type: 'Kiremt Season Active',
      severity: 'None',
      message: 'Main rainy season (Kiremt) is active. Optimal time for planting major crops like teff and maize.',
      icon: 'CloudRain',
    });
  } else if (season === 'Belg') {
    alerts.push({
      type: 'Belg Rains Expected',
      severity: 'Medium',
      message: 'Short rainy season (Belg). Good for quick-maturing crops and land preparation.',
      icon: 'CloudRain',
    });
  } else if (season === 'Bega') {
    alerts.push({
      type: 'Dry Season (Bega)',
      severity: 'Medium',
      message: 'Dry season active. Focus on irrigation-dependent crops and harvesting.',
      icon: 'CloudSun',
    });
  }
  
  return alerts;
}
