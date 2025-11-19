export function getWeatherDescription(code) {
    const codes = {
        0: 'Ensoleillé',
        1: 'Quelques nuages', 2: 'Nuageux', 3: 'Très nuageux',
        45: 'Brouillard', 48: 'Brouillard givrant',
        51: 'Bruine', 53: 'Bruine', 55: 'Bruine',
        61: 'Pluie faible', 63: 'Pluie', 65: 'Forte pluie',
        71: 'Neige faible', 73: 'Neige', 75: 'Forte neige',
        80: 'Averses', 81: 'Averses', 82: 'Fortes averses',
        95: 'Orage', 96: 'Orage et grêle', 99: 'Orage violent'
    };
    return codes[code] || 'Inconnu';
}

export function getWeatherIcon(code, isDay = 1) {
    // Clear
    if (code === 0) return isDay ? 'day' : 'night';

    // Cloudy
    if (code === 1) return isDay ? 'cloudy-day-1' : 'cloudy-night-1';
    if (code === 2) return isDay ? 'cloudy-day-2' : 'cloudy-night-2';
    if (code === 3) return isDay ? 'cloudy-day-3' : 'cloudy-night-3';

    // Fog
    if (code >= 45 && code <= 48) return 'cloudy';

    // Drizzle/Rain
    if (code >= 51 && code <= 55) return 'rainy-4';
    if (code >= 61 && code <= 65) return 'rainy-6';
    if (code >= 80 && code <= 82) return 'rainy-7';

    // Snow
    if (code >= 71 && code <= 77) return 'snowy-6';
    if (code >= 85 && code <= 86) return 'snowy-5';

    // Thunder
    if (code >= 95) return 'thunder';

    return 'weather';
}
