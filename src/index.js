import axios from 'axios';
import L from 'leaflet';
import './style.css'; 

const GOUV_API_URL = 'https://api-adresse.data.gouv.fr/search/';
const METEO_HOURLY_VARIABLES = 'temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,precipitation_probability'; 
const MAX_FORECAST_DAYS = 14; 

const FRANCE_BOUNDS = [
    [41.0, -5.0], 
    [51.5, 9.5]   
];

const FRANCE_CENTER = [46.603354, 1.888334]; 
const FRANCE_ZOOM = 5.5; 

let map;
let marker; 
let lastSelectedLocation = null; 


function fillIconPlaceholders() {
    try {
        document.querySelectorAll('[data-icon], [data-feather]').forEach(el => {
            if (el.querySelector('svg') || el.querySelector('img')) return;
            const name = el.getAttribute('data-icon') || el.getAttribute('data-feather');
            if (!name) return;
            const img = document.createElement('img');
            img.alt = name;
            img.src = `/svg/static/${name}.svg`;
            img.style.width = el.style.width || '20px';
            img.style.height = el.style.height || '20px';
            img.onerror = function() { this.onerror = null; this.src = '/svg/static/weather.svg'; };
            el.appendChild(img);
            el.removeAttribute('data-icon');
            el.removeAttribute('data-feather');
        });
    } catch (e) {
        console.warn('[meteo] fillIconPlaceholders failed', e);
    }
}

function getWeatherIconFileName(code) {
  if (code === 0) return 'day';
  if (code >= 1 && code <= 3) return 'cloudy-day-1'; 
  if (code >= 45 && code <= 48) return 'cloudy-day-3'; 
  if (code >= 51 && code <= 65) return 'rainy-1'; 
  if (code >= 71 && code <= 75) return 'snowy-1'; 
  if (code >= 95) return 'thunder'; 
  return 'weather-sprite'; 
}

function getWeatherDescription(code) {
  if (code === 0) return 'Ciel Dégagé';
  if (code === 1 || code === 2) return 'Partiellement nuageux';
  if (code === 3) return 'Couvert';
  if (code === 45 || code === 48) return 'Brouillard';
  if (code >= 51 && code <= 65) return 'Pluie';
  if (code >= 71 && code <= 75) return 'Neige';
  if (code >= 95) return 'Orage';
  return 'Météo Inconnue'; 
}

function generateWeatherPopupHtml(hourlyData, cityName) {
    const currentCode = hourlyData.weather_code[0];
    const currentTemp = hourlyData.temperature_2m[0];
    
    const desc = getWeatherDescription(currentCode);
    const temp = currentTemp.toFixed(1);
    const iconFile = getWeatherIconFileName(currentCode);

        return `
        <div class="weather-popup">
            <div class="popup-header">
                <span>${cityName}</span>
                        <button class="popup-close" aria-label="Fermer la popup">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 L6 18 M6 6 L18 18" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
            </div>
            <div class="popup-body">
                <img src="/svg/static/${iconFile}.svg" alt="${desc}" style="width: 35px; height: 35px;" title="${desc}" onerror="this.onerror=null;this.src='/svg/static/weather.svg'">
                <span class="temp-val">${temp}°C</span>
            </div>
            <p class="popup-desc">${desc}</p>
        </div>
    `;
}


function initMap() {
    const dialog = document.getElementById('weather-dialog');
    const initialWelcomeScreen = document.getElementById('welcome-screen');
    
    if (dialog) dialog.classList.add('hidden');
    if (initialWelcomeScreen) initialWelcomeScreen.classList.remove('hidden');

    map = L.map('map', {
        maxBounds: FRANCE_BOUNDS, 
        minZoom: FRANCE_ZOOM      
    }).setView(FRANCE_CENTER, FRANCE_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
    }).addTo(map);

    const html = document.documentElement;
    const initialTheme = html.getAttribute('data-theme') || 'dark';
    const toggleButtonIcon = document.querySelector('#theme-toggle i');
    if (toggleButtonIcon) {
        toggleButtonIcon.setAttribute('data-feather', initialTheme === 'dark' ? 'sun' : 'moon');
    }
    
    if (window.feather) {
        window.feather.replace();
    }
}

async function fetchWeatherAndDisplay(lat, lon, cityName, centerMap = true) {
    const dialog = document.getElementById('weather-dialog');
    const initialWelcomeScreen = document.getElementById('welcome-screen');

    if (initialWelcomeScreen) {
        initialWelcomeScreen.classList.add('hidden');
    }
    dialog.classList.remove('hidden');
    document.getElementById('forecast-7days').classList.add('hidden');

    document.getElementById('dialog-city').textContent = `Chargement de ${cityName}...`;

    const newLatLng = [lat, lon];
    if (marker) {
        marker.setLatLng(newLatLng);
    } else {
        marker = L.marker(newLatLng).addTo(map);
    }

    if (marker && marker.isPopupOpen()) {
        marker.closePopup(); 
    }

    if (centerMap) {
        map.setView(newLatLng, 8); 
    }

    const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=${METEO_HOURLY_VARIABLES}&forecast_days=${MAX_FORECAST_DAYS}&timezone=auto&temperature_unit=celsius&wind_speed_unit=kmh`;

    try {
        const response = await axios.get(API_URL);
        const hourlyData = response.data.hourly;
        
        if (!hourlyData || hourlyData.temperature_2m.length === 0) {
             throw new Error("Données horaires vides ou incomplètes.");
        }
        
        lastSelectedLocation = { lat, lon, cityName, hourlyData };

        const popupContent = generateWeatherPopupHtml(hourlyData, cityName);
        marker.bindPopup(popupContent, { closeButton: false, className: 'custom-popup' });
        try {
            const popup = marker.getPopup && marker.getPopup();
            if (popup && popup.on) {
                popup.on('add', () => {
                    try {
                        const el = popup.getElement();
                        if (el) {
                            const btn = el.querySelector('.popup-close');
                            if (btn) {
                                btn.addEventListener('click', () => {
                                    if (marker && typeof marker.closePopup === 'function') {
                                        marker.closePopup();
                                    } else if (map && typeof map.closePopup === 'function') {
                                        map.closePopup();
                                    }
                                });
                            }
                        }
                    } catch (e) {
                        console.warn('[meteo] popup close attach failed', e);
                    }
                });
            }
        } catch (e) {
            console.warn('[meteo] popup handler registration failed', e);
        }

        setTimeout(fillIconPlaceholders, 50);
        
        updateDetailsPanel(hourlyData, cityName);
        
        if (window.feather) {
            window.feather.replace();
        }

        fillIconPlaceholders();

    } catch (error) {
        console.error("Erreur lors de la récupération des données météo:", error);
        
        document.getElementById('dialog-city').textContent = cityName;
        
        document.getElementById('temp-value').innerHTML = '<abbr title="Température Actuelle">ERR</abbr>';
        document.getElementById('desc-value').innerHTML = '<abbr title="Conditions Météo">API Échec</abbr>';
        document.getElementById('humidity-value').innerHTML = '<abbr title="Humidité Relative">--%</abbr>';
        document.getElementById('wind-value').innerHTML = '<abbr title="Vitesse du Vent">-- km/h</abbr>';

        if (marker) marker.unbindPopup();
        
        if (window.feather) {
            window.feather.replace();
        }
    }
}


async function fetchDailyForecasts() {
    if (!lastSelectedLocation) return;
    
    const { lat, lon, cityName } = lastSelectedLocation;
    const forecastPanel = document.getElementById('forecast-7days');
    const forecastList = document.getElementById('forecast-list');
    
    document.getElementById('weather-dialog').classList.add('hidden'); 
    forecastPanel.classList.remove('hidden'); 
    
    document.querySelector('.forecast-header h3').textContent = `PRÉVISIONS POUR ${cityName.toUpperCase()}`;
    forecastList.innerHTML = '<span style="font-style: italic;">Chargement des jours...</span>';
    
    const DAILY_VARIABLES = 'weather_code,temperature_2m_max,temperature_2m_min';
    const DAILY_API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=${DAILY_VARIABLES}&forecast_days=${MAX_FORECAST_DAYS}&timezone=auto&temperature_unit=celsius`;
    
    try {
        const response = await axios.get(DAILY_API_URL);
        const dailyData = response.data.daily;
        forecastList.innerHTML = ''; 
        
        document.getElementById('hourly-details').classList.add('hidden'); 
        document.getElementById('forecast-list').classList.remove('hidden'); 

        dailyData.time.forEach((dateString, i) => {
            const date = new Date(dateString);
            const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
            const dayNumMonth = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });

            const tempMax = dailyData.temperature_2m_max[i].toFixed(0);
            const tempMin = dailyData.temperature_2m_min[i].toFixed(0);
            const code = dailyData.weather_code[i];
            const description = getWeatherDescription(code);
            const iconFile = getWeatherIconFileName(code);

            const entry = document.createElement('div');
            entry.classList.add('day-entry');
            entry.setAttribute('data-day-index', i);
            entry.innerHTML = `
                <span class="day-label">${dayName}. ${dayNumMonth}</span>
                <img src="/svg/static/${iconFile}.svg" alt="${description}" style="width: 25px; height: 25px; margin-right: 15px;" title="${description}" onerror="this.onerror=null;this.src='/svg/static/weather.svg'">
                <span class="temp-range">${tempMin}°C / ${tempMax}°C</span>
            `;
            
            entry.addEventListener('click', () => showHourlyDetails(i, date));
            
            forecastList.appendChild(entry);
        });
                
        if (window.feather) {
            window.feather.replace();
        }

    } catch (error) {
        console.error("Erreur lors de la récupération des 14 jours:", error);
        forecastList.innerHTML = 'Impossible de charger les prévisions à 14 jours.';
        
        document.getElementById('forecast-7days').classList.add('hidden');
        document.getElementById('weather-dialog').classList.remove('hidden');
    }
}


function showHourlyDetails(dayIndex, date) {
    if (!lastSelectedLocation || !lastSelectedLocation.hourlyData) return;

    const hourlyData = lastSelectedLocation.hourlyData;
    const hourlyList = document.getElementById('hourly-list');
    hourlyList.innerHTML = '';
    
    const targetDateString = date.toISOString().substring(0, 10);
    const dateOptions = { weekday: 'long', day: 'numeric', month: 'long' };

    document.getElementById('hourly-day-name').textContent = date.toLocaleDateString('fr-FR', dateOptions);

    const startIndex = hourlyData.time.findIndex(time => time.startsWith(targetDateString));
    
    let startHourIndex = startIndex;
    if (dayIndex === 0) { 
        const now = new Date();
        const currentHourString = now.toISOString().substring(0, 13); 
        startHourIndex = hourlyData.time.findIndex(time => time.startsWith(currentHourString));
        if (startHourIndex === -1) {
             startHourIndex = startIndex; 
        }
    }

    if (startIndex === -1) {
        hourlyList.innerHTML = '<p>Données horaires non disponibles pour cette journée.</p>';
        return;
    }

    const scrollContainer = document.createElement('div');
    scrollContainer.classList.add('hourly-scroll-container');

    const wrapper = document.createElement('div');
    wrapper.classList.add('hourly-scroll-wrapper');

    const leftBtn = document.createElement('button');
    leftBtn.classList.add('scroll-btn', 'left');
    leftBtn.setAttribute('aria-label', 'Faire défiler à gauche');
    leftBtn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18 L9 12 L15 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    leftBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: -260, behavior: 'smooth' });
    });

    const rightBtn = document.createElement('button');
    rightBtn.classList.add('scroll-btn', 'right');
    rightBtn.setAttribute('aria-label', 'Faire défiler à droite');
    rightBtn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6 L15 12 L9 18" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    rightBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: 260, behavior: 'smooth' });
    });

    for (let i = startHourIndex; i < hourlyData.time.length && (i - startIndex) < 24; i++) {
        const time = new Date(hourlyData.time[i]);
        
        if (!hourlyData.time[i].startsWith(targetDateString) && time.getHours() !== 0) {
            break; 
        }

        const temp = hourlyData.temperature_2m[i] !== null ? hourlyData.temperature_2m[i].toFixed(0) : '--';
        const code = hourlyData.weather_code[i];
        const description = getWeatherDescription(code);

        const iconFile = getWeatherIconFileName(code);

        const entry = document.createElement('div');
        entry.classList.add('hour-entry');
        
        let hourLabel = time.toLocaleTimeString('fr-FR', { hour: '2-digit' });
        if (dayIndex === 0 && time.getHours() === new Date().getHours()) {
            hourLabel = `<strong>${hourLabel}</strong>`;
        }

            entry.innerHTML = `
            <span class="hour-time">${hourLabel}</span>
            <img src="/svg/static/${iconFile}.svg" alt="${description}" style="width: 25px; height: 25px;" title="${description}" onerror="this.onerror=null;this.src='/svg/static/weather.svg'">
            <span class="hour-temp">${temp}°</span>
        `;
        scrollContainer.appendChild(entry);
    }
    
    wrapper.appendChild(leftBtn);
    wrapper.appendChild(scrollContainer);
    wrapper.appendChild(rightBtn);
    hourlyList.appendChild(wrapper);

    setTimeout(fillIconPlaceholders, 20);

    document.getElementById('forecast-list').classList.add('hidden');
    document.getElementById('hourly-details').classList.remove('hidden');
    const hh = document.querySelector('.hourly-header');
    if (hh) hh.classList.remove('hidden');

    if (window.feather) {
        window.feather.replace();
    }
    
    if (dayIndex === 0 && startHourIndex > startIndex) {
        setTimeout(() => {
            const currentHourEntry = scrollContainer.querySelector('.hour-entry:first-child');
            if (currentHourEntry) {
                const hourWidth = currentHourEntry.offsetWidth;
                const scrollPosition = (startHourIndex - startIndex) * (hourWidth + 10); 
                
                scrollContainer.scrollLeft = scrollPosition;
            }
        }, 10); 
    }
}

function updateDetailsPanel(hourlyData, cityName) {
    const currentCode = hourlyData.weather_code[0];
    const currentTemp = hourlyData.temperature_2m[0];
    const currentDesc = getWeatherDescription(currentCode);
    
    const initialWelcomeScreen = document.getElementById('welcome-screen');
    if (initialWelcomeScreen) {
        initialWelcomeScreen.classList.add('hidden');
    }


    const iconContainer = document.querySelector('#weather-dialog .dialog-header');
    let iconElement = document.getElementById('weather-icon-svg');
    
    if (iconElement) {
        iconElement.remove();
    }

    const iconFile = getWeatherIconFileName(currentCode);
    const newIcon = document.createElement('img');
    newIcon.id = 'weather-icon-svg';
    newIcon.src = `/svg/static/${iconFile}.svg`;
    newIcon.onerror = function() { this.onerror = null; this.src = '/svg/static/weather.svg'; };
    newIcon.alt = currentDesc;
    newIcon.style.width = '45px';
    newIcon.style.height = '45px';
    newIcon.style.marginRight = '15px';

    if (iconContainer && iconContainer.firstChild) {
        iconContainer.insertBefore(newIcon, iconContainer.firstChild);
    }

    const humidity = hourlyData.relative_humidity_2m[0].toFixed(0);
    const windSpeed = hourlyData.wind_speed_10m[0].toFixed(1);

    document.getElementById('dialog-city').textContent = cityName;
    
    document.getElementById('temp-value').innerHTML = `<abbr title="Température Actuelle">${currentTemp.toFixed(1)}°C</abbr>`;
    document.getElementById('desc-value').innerHTML = `<abbr title="Conditions Météo">${currentDesc}</abbr>`;
    document.getElementById('humidity-value').innerHTML = `<abbr title="Humidité Relative">${humidity}%</abbr>`;
    document.getElementById('wind-value').innerHTML = `<abbr title="Vitesse du Vent">${windSpeed} km/h</abbr>`;
    
    if (window.feather) {
        window.feather.replace();
    }
}


async function handleSearchInput() {
    const query = document.getElementById('city-search').value;
    const suggestionsList = document.getElementById('suggestions-list');
    suggestionsList.innerHTML = ''; 

    if (query.length === 0) { 
        suggestionsList.innerHTML = '';
        return;
    }

    try {
        const response = await axios.get(`${GOUV_API_URL}?q=${query}&type=municipality&limit=50`);
        
        response.data.features.forEach(feature => {
            const cityName = feature.properties.label;
            const context = feature.properties.context.split(',').slice(-2).join(', ');
            const lat = feature.geometry.coordinates[1];
            const lon = feature.geometry.coordinates[0];

            const li = document.createElement('li');
            li.innerHTML = `<strong>${cityName}</strong> <small>(${context})</small>`;
            
            li.addEventListener('click', () => {
                fetchWeatherAndDisplay(lat, lon, cityName, true); 
                suggestionsList.innerHTML = ''; 
                document.getElementById('city-search').value = cityName;
            });
            suggestionsList.appendChild(li);
        });

    } catch (error) {
        console.error("Erreur lors de l'autocomplete:", error);
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);

    const toggleButtonIcon = document.querySelector('#theme-toggle i');
    if (toggleButtonIcon) {
        toggleButtonIcon.setAttribute('data-feather', newTheme === 'dark' ? 'sun' : 'moon');
        window.feather.replace();
    }
}


document.addEventListener('DOMContentLoaded', () => {
    initMap();

    const searchInput = document.getElementById('city-search');
    
    let debounceTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(handleSearchInput, 150); 
    });

    const moreInfoButton = document.getElementById('more-info-button');
    if (moreInfoButton) {
        moreInfoButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (lastSelectedLocation) {
                fetchDailyForecasts();
            }
        });
    }

    const closeForecastButton = document.getElementById('close-forecast');
    if (closeForecastButton) {
        closeForecastButton.addEventListener('click', () => {
            document.getElementById('forecast-7days').classList.add('hidden');
            document.getElementById('weather-dialog').classList.remove('hidden');
        });
    }
    
    const backToDailyButton = document.getElementById('back-to-daily');
    if (backToDailyButton) {
        backToDailyButton.addEventListener('click', () => {
            document.getElementById('hourly-details').classList.add('hidden');
            document.getElementById('forecast-list').classList.remove('hidden');
            const hh = document.querySelector('.hourly-header');
            if (hh) hh.classList.add('hidden');
        });
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-module')) {
            document.getElementById('suggestions-list').innerHTML = '';
        }
    });
    
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    }
    setTimeout(fillIconPlaceholders, 50);
});