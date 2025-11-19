import { getWeatherDescription, getWeatherIcon } from '../utils/utils';

export const els = {
    get searchInput() { return document.getElementById('city-search'); },
    get suggestionsList() { return document.getElementById('suggestions-list'); },
    get locateBtn() { return document.getElementById('locate-me'); },
    get themeToggle() { return document.getElementById('theme-toggle'); },
    get favoritesToggle() { return document.getElementById('favorites-toggle'); },
    get favoritesDialog() { return document.getElementById('favorites-dialog'); },
    get closeFavoritesBtn() { return document.getElementById('close-favorites'); },
    get favoritesList() { return document.getElementById('favorites-list'); },
    get mapSection() { return document.getElementById('map-section'); },
    get weatherDashboard() { return document.getElementById('weather-dashboard'); },
    get mapMessage() { return document.getElementById('map-message'); },

    // Weather Card
    get cityName() { return document.getElementById('current-city-name'); },
    get addFavoriteBtn() { return document.getElementById('add-favorite'); },
    get currentTemp() { return document.getElementById('current-temp'); },
    get currentDesc() { return document.getElementById('current-desc'); },
    get currentIcon() { return document.getElementById('current-weather-icon'); },
    get apparentTemp() { return document.getElementById('apparent-temp'); },
    get windSpeed() { return document.getElementById('wind-speed'); },
    get humidity() { return document.getElementById('humidity'); },
    get pressure() { return document.getElementById('pressure'); },

    // Alerts
    get alertsContainer() { return document.getElementById('alerts-container'); },

    // Sun
    get sunrise() { return document.getElementById('sunrise-time'); },
    get sunset() { return document.getElementById('sunset-time'); },

    // Lists
    get dailyList() { return document.getElementById('daily-list'); },

    // App
    get appWrapper() { return document.getElementById('app-wrapper'); },
    get weatherOverlay() { return document.getElementById('weather-overlay'); },

    // Environment
    get uvIndex() { return document.getElementById('uv-index'); },
    get uvLabel() { return document.getElementById('uv-label'); },
    get airQuality() { return document.getElementById('air-quality'); },
    get airLabel() { return document.getElementById('air-label'); },
    get pollenAlder() { return document.getElementById('pollen-alder'); },
    get pollenBirch() { return document.getElementById('pollen-birch'); },
    get pollenGrass() { return document.getElementById('pollen-grass'); },
    get pollenOlive() { return document.getElementById('pollen-olive'); },
    get pollenRagweed() { return document.getElementById('pollen-ragweed'); }
};

export function updateCurrentWeatherUI(current, cityImage) {
    els.currentTemp.textContent = `${Math.round(current.temperature_2m)}°`;
    els.currentDesc.textContent = getWeatherDescription(current.weather_code);
    els.apparentTemp.textContent = `${Math.round(current.apparent_temperature)}°`;
    els.windSpeed.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    els.humidity.textContent = `${current.relative_humidity_2m}%`;
    els.pressure.textContent = `${Math.round(current.surface_pressure)} hPa`;

    const iconName = getWeatherIcon(current.weather_code, current.is_day);
    els.currentIcon.innerHTML = `<img src="/svg/static/${iconName}.svg" alt="Météo">`;

    updateBackground(current.weather_code, current.is_day);

    // Update City Image if available
    const cardHeader = document.querySelector('.current-weather-card .card-header');
    if (cityImage && cardHeader) {
        cardHeader.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${cityImage}')`;
        cardHeader.style.backgroundSize = 'cover';
        cardHeader.style.backgroundPosition = 'center';
        cardHeader.style.borderRadius = '12px';
        cardHeader.style.padding = '16px';
        cardHeader.style.marginBottom = '16px';
        cardHeader.style.textShadow = '0 2px 4px rgba(0,0,0,0.8)';
    } else if (cardHeader) {
        cardHeader.style.backgroundImage = 'none';
        cardHeader.style.padding = '0';
        cardHeader.style.textShadow = 'none';
    }
}

export function updateBackground(code, isDay) {
    const wrapper = els.appWrapper;
    const overlay = els.weatherOverlay;

    if (!wrapper || !overlay) return;

    // Remove all possible bg classes
    wrapper.classList.remove('bg-sunny', 'bg-night-clear', 'bg-cloudy', 'bg-night-cloudy', 'bg-rainy', 'bg-snowy', 'bg-stormy', 'bg-foggy');
    overlay.className = 'weather-overlay'; // Reset

    // Clear/Sunny
    if (code === 0 || code === 1) {
        wrapper.classList.add(isDay ? 'bg-sunny' : 'bg-night-clear');
    }
    // Cloudy
    else if (code === 2 || code === 3) {
        wrapper.classList.add(isDay ? 'bg-cloudy' : 'bg-night-cloudy');
    }
    // Fog
    else if (code >= 45 && code <= 48) {
        wrapper.classList.add('bg-foggy');
    }
    // Rain/Drizzle
    else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
        wrapper.classList.add('bg-rainy');
        overlay.classList.add('rain-effect');
    }
    // Snow
    else if (code >= 71 && code <= 77) {
        wrapper.classList.add('bg-snowy');
    }
    // Storm
    else if (code >= 95) {
        wrapper.classList.add('bg-stormy');
    }
    // Fallback
    else {
        wrapper.classList.add(isDay ? 'bg-cloudy' : 'bg-night-cloudy');
    }
}

export function updateDailyForecastUI(daily) {
    els.dailyList.innerHTML = '';

    // Handle up to 14 days if available, otherwise fallback to length
    const daysToShow = daily.time.length;

    for (let i = 0; i < daysToShow; i++) {
        const date = new Date(daily.time[i]);
        const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });
        const max = Math.round(daily.temperature_2m_max[i]);
        const min = Math.round(daily.temperature_2m_min[i]);
        const code = daily.weather_code[i];
        const icon = getWeatherIcon(code);

        const div = document.createElement('div');
        div.className = 'daily-item animate-slide-up';
        div.style.animationDelay = `${i * 50}ms`; // Faster stagger for more items
        div.innerHTML = `
            <span class="day-name">${dayName}</span>
            <div class="day-icon"><img src="/svg/static/${icon}.svg" width="24" height="24" alt="${getWeatherDescription(code)}"></div>
            <div class="day-temps">
                <span class="temp-max">${max}°</span>
                <span class="temp-min">${min}°</span>
            </div>
        `;
        els.dailyList.appendChild(div);
    }
}

export function updateSunUI(daily) {
    const sunrise = new Date(daily.sunrise[0]);
    const sunset = new Date(daily.sunset[0]);

    els.sunrise.textContent = sunrise.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    els.sunset.textContent = sunset.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function updateEnvironmentUI(hourly, airQuality) {
    // UV
    const currentHour = new Date().getHours();
    const index = hourly.time.findIndex(t => new Date(t).getHours() === currentHour);
    const uv = hourly.uv_index[index] || 0;

    els.uvIndex.textContent = uv.toFixed(0);
    let uvLabel = 'Faible';
    if (uv >= 3) uvLabel = 'Modéré';
    if (uv >= 6) uvLabel = 'Élevé';
    if (uv >= 8) uvLabel = 'Très élevé';
    if (uv >= 11) uvLabel = 'Extrême';
    els.uvLabel.textContent = uvLabel;

    // Air Quality
    if (airQuality && airQuality.current) {
        const aqi = airQuality.current.european_aqi;
        els.airQuality.textContent = aqi;
        let airLabel = 'Bon';
        if (aqi >= 20) airLabel = 'Moyen';
        if (aqi >= 40) airLabel = 'Dégradé';
        if (aqi >= 60) airLabel = 'Mauvais';
        if (aqi >= 80) airLabel = 'Très mauvais';
        if (aqi >= 100) airLabel = 'Extrêmement mauvais';
        els.airLabel.textContent = airLabel;

        // Pollen
        updatePollenBar(els.pollenAlder, airQuality.current.alder_pollen);
        updatePollenBar(els.pollenBirch, airQuality.current.birch_pollen);
        updatePollenBar(els.pollenGrass, airQuality.current.grass_pollen);
        updatePollenBar(els.pollenOlive, airQuality.current.olive_pollen);
        updatePollenBar(els.pollenRagweed, airQuality.current.ragweed_pollen);

    } else {
        els.airQuality.textContent = '--';
        els.airLabel.textContent = 'Indisponible';
    }
}

function updatePollenBar(element, value) {
    if (!element) return;
    // Value is usually count/m3. Normalize roughly: 0-100 low, 100-500 mod, >500 high
    // Let's cap at 500 for 100% width for visualization
    const percentage = Math.min((value / 500) * 100, 100);
    element.style.width = `${percentage}%`;

    // Color based on intensity
    if (value > 400) element.style.backgroundColor = '#ef4444'; // Red
    else if (value > 100) element.style.backgroundColor = '#f97316'; // Orange
    else element.style.backgroundColor = '#22c55e'; // Green
}

export function checkAndShowAlerts(current, hourly, airQuality) {
    els.alertsContainer.innerHTML = ''; // Clear previous alerts

    const alerts = [];

    // Wind
    if (current.wind_speed_10m > 80) {
        alerts.push({ type: 'danger', title: 'Vent Violent', message: `Rafales à ${Math.round(current.wind_speed_10m)} km/h.` });
    } else if (current.wind_speed_10m > 60) {
        alerts.push({ type: 'warning', title: 'Vent Fort', message: `Rafales à ${Math.round(current.wind_speed_10m)} km/h.` });
    }

    // Storm
    if (current.weather_code >= 95) {
        alerts.push({ type: 'danger', title: 'Orage', message: 'Orages en cours ou prévus.' });
    }

    // UV
    const currentHour = new Date().getHours();
    const index = hourly.time.findIndex(t => new Date(t).getHours() === currentHour);
    const uv = hourly.uv_index[index] || 0;
    if (uv >= 8) {
        alerts.push({ type: 'danger', title: 'UV Extrême', message: 'Protégez-vous du soleil.' });
    } else if (uv >= 6) {
        alerts.push({ type: 'warning', title: 'UV Élevé', message: 'Indice UV élevé.' });
    }

    // Air Quality
    if (airQuality && airQuality.current && airQuality.current.european_aqi >= 80) {
        alerts.push({ type: 'danger', title: 'Pollution', message: 'Qualité de l\'air très mauvaise.' });
    }

    alerts.forEach(alert => showAlert(alert));
}

export function showAlert(alert) {
    const div = document.createElement('div');
    div.className = `alert-toast ${alert.type}`;
    div.innerHTML = `
        <div class="alert-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
        <div class="alert-content">
            <span class="alert-title">${alert.title}</span>
            <span class="alert-message">${alert.message}</span>
        </div>
        <button class="alert-close">×</button>
    `;

    div.querySelector('.alert-close').addEventListener('click', () => div.remove());
    els.alertsContainer.appendChild(div);
}

// --- Community Features ---

export function showShareDialog(current, city) {
    const text = `Météo à ${city}: ${Math.round(current.temperature_2m)}°C, ${getWeatherDescription(current.weather_code)}. Découvrez plus sur Meteo-France v3.0 !`;

    if (navigator.share) {
        navigator.share({
            title: `Météo à ${city}`,
            text: text,
            url: window.location.href
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(text).then(() => {
            alert('Météo copiée dans le presse-papier !');
        });
    }
}

export function showTrivia() {
    const facts = [
        "Un éclair peut atteindre 30 000°C, soit 5 fois la température de la surface du soleil.",
        "Il pleut des diamants sur Neptune et Uranus.",
        "La vitesse du vent la plus élevée jamais enregistrée sur Terre est de 408 km/h.",
        "Les nuages peuvent peser plus d'un million de tonnes.",
        "Le désert d'Atacama au Chili est l'endroit le plus aride de la Terre.",
        "La foudre frappe la Terre environ 100 fois par seconde."
    ];
    const fact = facts[Math.floor(Math.random() * facts.length)];

    const container = document.createElement('div');
    container.className = 'trivia-toast animate-slide-up';
    container.innerHTML = `
        <div class="trivia-icon">💡</div>
        <div class="trivia-content">
            <span class="trivia-title">Le saviez-vous ?</span>
            <p>${fact}</p>
        </div>
        <button class="trivia-close">×</button>
    `;

    container.querySelector('.trivia-close').addEventListener('click', () => container.remove());
    els.alertsContainer.appendChild(container);

    // Auto remove after 10s
    setTimeout(() => {
        if (container.parentNode) container.remove();
    }, 10000);
}

export function showLoading() {
    const loader = document.querySelector('.loader');
    if (loader) loader.classList.remove('hidden');
}

export function hideLoading() {
    const loader = document.querySelector('.loader');
    if (loader) loader.classList.add('hidden');
}

export function showError(message) {
    showAlert({ type: 'danger', title: 'Erreur', message: message });
}
