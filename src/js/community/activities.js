import { getWeatherDescription } from '../utils/utils.js';

export function getActivities(weatherCode, temperature) {
    const activities = [];
    const isNice = (weatherCode === 0 || weatherCode === 1 || weatherCode === 2) && temperature >= 15 && temperature <= 30;
    const isCold = temperature < 10;
    const isRainy = weatherCode >= 51;

    if (isNice) {
        activities.push({ icon: '🏃', text: 'Footing', type: 'outdoor' });
        activities.push({ icon: '🧺', text: 'Pique-nique', type: 'outdoor' });
        activities.push({ icon: '📷', text: 'Photographie', type: 'outdoor' });
    } else if (isRainy) {
        activities.push({ icon: '🏛️', text: 'Musée', type: 'indoor' });
        activities.push({ icon: '📚', text: 'Lecture', type: 'indoor' });
        activities.push({ icon: '🍿', text: 'Cinéma', type: 'indoor' });
    } else if (isCold) {
        activities.push({ icon: '☕', text: 'Café chaud', type: 'indoor' });
        activities.push({ icon: '🍲', text: 'Cuisine', type: 'indoor' });
    } else {
        activities.push({ icon: '🎵', text: 'Musique', type: 'indoor' });
        activities.push({ icon: '🧘', text: 'Yoga', type: 'indoor' });
    }

    // Shuffle and take 3
    return activities.sort(() => 0.5 - Math.random()).slice(0, 3);
}
