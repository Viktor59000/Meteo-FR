import L from 'leaflet';

let map;
let marker;
let radarLayers = {};
let radarTimestamps = [];
let animationTimer;
let currentTimestampIndex = 0;
let isPlaying = false;

const RAINVIEWER_API = 'https://api.rainviewer.com/public/weather-maps.json';

export function initMap(elementId, center, zoom) {
    map = L.map(elementId, {
        zoomControl: false,
        attributionControl: false
    }).setView(center, zoom);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
    }).addTo(map);

    initRadar();

    return map;
}

export function updateMap(lat, lon) {
    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lon]).addTo(map);
    map.setView([lat, lon], 10);
}

async function initRadar() {
    try {
        const response = await fetch(RAINVIEWER_API);
        const data = await response.json();

        // Filter for past and now (radar), ignore satellite (infrared) if mixed
        // RainViewer returns radar (past) and satellite (past) and forecasts
        // We focus on radar data (past + nowcast)
        if (data.radar && data.radar.past) {
            radarTimestamps = [...data.radar.past, ...data.radar.nowcast];
            showRadarLayer(radarTimestamps.length - 1);
            setupRadarControls();
        }
    } catch (e) {
        console.warn('Radar init failed', e);
    }
}

function showRadarLayer(index) {
    if (!radarTimestamps[index]) return;

    const ts = radarTimestamps[index].time;
    const path = radarTimestamps[index].path;

    // Remove all other radar layers
    Object.keys(radarLayers).forEach(key => {
        if (map.hasLayer(radarLayers[key])) {
            map.removeLayer(radarLayers[key]);
        }
    });

    if (!radarLayers[ts]) {
        radarLayers[ts] = L.tileLayer(`https://tile.rainviewer.com${path}/256/{z}/{x}/{y}/2/1_1.png`, {
            opacity: 0.6,
            zIndex: 100
        });
    }

    radarLayers[ts].addTo(map);
    currentTimestampIndex = index;
    updateRadarTimeDisplay(ts);
}

function updateRadarTimeDisplay(ts) {
    const date = new Date(ts * 1000);
    const el = document.getElementById('radar-time');
    if (el) {
        el.textContent = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
}

function setupRadarControls() {
    const btn = document.getElementById('radar-play');
    if (!btn) return;

    btn.addEventListener('click', toggleAnimation);
}

function toggleAnimation() {
    isPlaying = !isPlaying;
    const btn = document.getElementById('radar-play');

    if (isPlaying) {
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`; // Pause icon
        playAnimation();
    } else {
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`; // Play icon
        stopAnimation();
    }
}

function playAnimation() {
    showRadarLayer(currentTimestampIndex);

    animationTimer = setInterval(() => {
        currentTimestampIndex = (currentTimestampIndex + 1) % radarTimestamps.length;
        showRadarLayer(currentTimestampIndex);
    }, 500); // 500ms per frame
}

function stopAnimation() {
    clearInterval(animationTimer);
}
