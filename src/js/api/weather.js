import axios from 'axios';

const METEO_API_URL = 'https://api.open-meteo.com/v1/forecast';
const AIR_QUALITY_API_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const GOUV_API_URL = 'https://api-adresse.data.gouv.fr/search/';

export async function fetchWeatherData(lat, lon) {
    const params = {
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m',
        hourly: 'temperature_2m,weather_code,uv_index,precipitation_probability,precipitation',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset',
        timezone: 'auto',
        forecast_days: 14
    };
    const response = await axios.get(METEO_API_URL, { params });
    return response.data;
}

export async function fetchAirQuality(lat, lon) {
    const params = {
        latitude: lat,
        longitude: lon,
        current: 'european_aqi,pm10,pm2_5,nitrogen_dioxide,ozone,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen',
        timezone: 'auto'
    };
    try {
        const response = await axios.get(AIR_QUALITY_API_URL, { params });
        return response.data;
    } catch (e) {
        console.warn('Air quality data unavailable', e);
        return null;
    }
}

export async function searchCity(query) {
    if (query.length < 3) return [];
    try {
        const response = await axios.get(`${GOUV_API_URL}?q=${query}&type=municipality&limit=5`);
        return response.data.features;
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

export async function reverseGeocode(lat, lon) {
    try {
        const response = await axios.get(`https://api-adresse.data.gouv.fr/reverse/?lon=${lon}&lat=${lat}`);
        return response.data.features[0]?.properties?.city || 'Ma position';
    } catch (e) {
        return 'Ma position';
    }
}

export async function fetchCityImage(cityName) {
    try {
        const url = `https://fr.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${cityName}&origin=*`;
        const response = await axios.get(url);
        const pages = response.data.query.pages;
        const pageId = Object.keys(pages)[0];
        if (pages[pageId]?.original?.source) {
            return pages[pageId].original.source;
        }
        return null;
    } catch (error) {
        console.warn('City image not found:', error);
        return null;
    }
}
