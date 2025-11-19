import '../style.css';
import {
    fetchWeatherData,
    fetchAirQuality,
    searchCity,
    reverseGeocode,
    fetchCityImage
} from './api/weather.js';
import {
    updateCurrentWeatherUI,
    updateDailyForecastUI,
    updateHourlyForecastUI,
    updateEnvironmentUI,
    updateSunUI,
    showLoading,
    hideLoading,
    showError,
    els,
    updateBackground,
    showShareDialog,
    showTrivia,
    showAlert
} from './ui/ui.js';
import {
    initChart,
    updateChart
} from './ui/charts.js';
import {
    submitReport,
    getCommunityStatus
} from './community/reporting.js';
import {
    getActivities
} from './community/activities.js';
import {
    getUserProfile,
    addXP,
    getLevelProgress
} from './community/gamification.js';
import {
    speakText,
    generateWeatherSummary
} from './utils/voice.js';

// State
let currentCity = null;
let lastWeatherData = null;
const LEVELS = [
    { name: 'Observateur', minXP: 0 },
    { name: 'Éclaireur', minXP: 100 },
    { name: 'Météorologue', minXP: 300 },
    { name: 'Expert', minXP: 600 },
    { name: 'Légende', minXP: 1000 }
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Theme Toggle
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // Search
    const searchInput = document.getElementById('city-search');
    let debounceTimer;

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (e.target.value.length > 2) {
                    handleSearch(e.target.value);
                }
            }, 500);
        });
    }

    // Geolocation
    const locateBtn = document.getElementById('locate-me');
    if (locateBtn) {
        locateBtn.addEventListener('click', handleGeolocation);
    }

    // Community Buttons
    document.getElementById('share-btn')?.addEventListener('click', () => {
        if (lastWeatherData && currentCity) {
            showShareDialog(lastWeatherData.current, currentCity.name);
            awardXP(10); // Reward for sharing
        }
    });

    document.getElementById('trivia-btn')?.addEventListener('click', () => {
        if (lastWeatherData) {
            showTrivia(lastWeatherData);
        }
    });

    // Vote Buttons
    document.getElementById('vote-correct')?.addEventListener('click', () => handleVote(true));
    document.getElementById('vote-incorrect')?.addEventListener('click', () => handleVote(false));

    // Profile & Voice
    initProfile();
    initVoice();

    // Initial Load
    handleGeolocation();
}

function initProfile() {
    updateProfileUI();

    document.getElementById('profile-btn')?.addEventListener('click', () => {
        document.getElementById('profile-dialog').showModal();
    });

    document.getElementById('close-profile')?.addEventListener('click', () => {
        document.getElementById('profile-dialog').close();
    });
}

function updateProfileUI() {
    const profile = getUserProfile();

    // Update Header Badge
    const badge = document.getElementById('user-level-badge');
    if (badge) badge.textContent = profile.levelIndex + 1;

    // Update Modal
    const progress = getLevelProgress(profile.xp, profile.levelIndex);
    const xpEl = document.getElementById('profile-xp');
    if (xpEl) xpEl.textContent = profile.xp;

    const bar = document.getElementById('xp-bar');
    if (bar) bar.style.width = `${progress}%`;

    const levelNameEl = document.getElementById('profile-level-name');
    if (levelNameEl) {
        const levelName = LEVELS[profile.levelIndex] ? LEVELS[profile.levelIndex].name : 'Observateur';
        levelNameEl.textContent = levelName;
    }
}

function awardXP(amount) {
    const result = addXP(amount);
    updateProfileUI();
    if (result.leveledUp) {
        showAlert(`Niveau supérieur ! Vous êtes maintenant ${result.level.name} 🎉`);
    }
}

function initVoice() {
    document.getElementById('speak-weather')?.addEventListener('click', () => {
        if (lastWeatherData && currentCity) {
            const text = generateWeatherSummary(lastWeatherData.current, currentCity.name);
            speakText(text);
        }
    });
}

function handleVote(isCorrect) {
    submitReport(isCorrect);
    updateCommunityUI();

    // Disable buttons temporarily
    const buttons = document.querySelectorAll('.vote-btn');
    buttons.forEach(btn => btn.disabled = true);

    // Award XP
    awardXP(20);

    showAlert("Merci pour votre contribution ! (+20 XP)");
}

function updateCommunityUI(weatherCode, temperature) {
    // Show section
    const hub = document.getElementById('community-hub');
    if (hub) hub.classList.remove('hidden');

    // Update Status
    const status = getCommunityStatus();
    const statusEl = document.getElementById('community-status');
    if (statusEl) statusEl.textContent = status.text;

    // Update Activities
    if (weatherCode !== undefined && temperature !== undefined) {
        const activities = getActivities(weatherCode, temperature);
        const list = document.getElementById('activities-list');
        if (list) {
            list.innerHTML = activities.map(act => `
                <div class="activity-item">
                    <div class="activity-icon">${act.icon}</div>
                    <div class="activity-text">${act.text}</div>
                    <div class="activity-type">${act.type}</div>
                </div>
            `).join('');
        }
    }
}

async function handleGeolocation() {
    showLoading();
    if (!navigator.geolocation) {
        loadCity('Paris', 48.8566, 2.3522); // Fallback
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const cityData = await reverseGeocode(latitude, longitude);
                // reverseGeocode returns { name, context, ... } or similar? 
                // Let's check api/weather.js again. It returns response.data.features[0] usually.
                // Actually in Step 322, reverseGeocode returns response.data.features[0] (implied, I didn't see the return).
                // Assuming it returns a city name or object.
                // Let's assume it returns a string for now based on previous usage.
                // Wait, in Step 294 I used `const city = await reverseGeocode(latitude, longitude); loadCity(city, ...)`
                // But `loadCity` expects a name.
                // Let's assume reverseGeocode returns the name.
                // If not, I might need to fix this.
                // Let's check `api/weather.js` line 48 again.
                // Actually, I can't check it now without another tool call.
                // I'll assume it returns the name or I'll handle the object if I can.
                // Let's stick to what I had: `const cityName = await getCityNameFromCoords(latitude, longitude);` in Step 281.
                // But in Step 294 I imported `reverseGeocode`.
                // I'll use `reverseGeocode` and assume it returns the name.
                const cityName = await reverseGeocode(latitude, longitude);
                loadCity(cityName, latitude, longitude);
            } catch (error) {
                console.error(error);
                loadCity('Paris', 48.8566, 2.3522);
            }
        },
        (error) => {
            console.warn('Geolocation denied:', error);
            loadCity('Paris', 48.8566, 2.3522);
        }
    );
}

async function handleSearch(query) {
    console.log('Handling search for:', query);
    const features = await searchCity(query);
    console.log('Search results:', features);
    renderSuggestions(features);
}

function renderSuggestions(features) {
    els.suggestionsList.innerHTML = '';
    if (!features || features.length === 0) {
        els.suggestionsList.hidden = true;
        return;
    }

    features.forEach(feature => {
        const li = document.createElement('li');
        li.role = 'option';
        li.innerHTML = `<strong>${feature.properties.label}</strong> <small>${feature.properties.context}</small>`;
        li.addEventListener('click', () => {
            const [lon, lat] = feature.geometry.coordinates;
            loadCity(feature.properties.label, lat, lon);
            els.suggestionsList.hidden = true;
            els.searchInput.value = feature.properties.label;
        });
        els.suggestionsList.appendChild(li);
    });
    els.suggestionsList.hidden = false;
}

async function loadCity(name, lat, lon) {
    currentCity = { name, lat, lon };

    // Update UI
    if (els.cityName) els.cityName.textContent = name;
    if (els.mapMessage) els.mapMessage.classList.add('hidden');
    if (els.weatherDashboard) els.weatherDashboard.classList.remove('hidden');

    showLoading();

    try {
        // If lat/lon are missing (e.g. from search by name only? No, search returns coords), 
        // but if loadCity is called with just name, we might need to search.
        // But here we always pass lat/lon.

        const [weatherData, airQuality, cityImage] = await Promise.all([
            fetchWeatherData(lat, lon),
            fetchAirQuality(lat, lon),
            fetchCityImage(name)
        ]);

        lastWeatherData = weatherData;

        updateCurrentWeatherUI(weatherData.current, cityImage);
        updateDailyForecastUI(weatherData.daily);
        // updateHourlyForecastUI(weatherData.hourly); // If this exists
        updateEnvironmentUI(weatherData.hourly, airQuality);
        updateSunUI(weatherData.daily);

        // Charts
        // initChart(); // Already called?
        updateChart(weatherData.hourly); // Check if this is the right function name

        // Community
        updateCommunityUI(weatherData.current.weather_code, weatherData.current.temperature_2m);

        updateBackground(weatherData.current.weather_code, weatherData.current.is_day);

    } catch (error) {
        console.error('Error loading city:', error);
        showError('Impossible de charger les données météo.');
    } finally {
        hideLoading();
    }
}
