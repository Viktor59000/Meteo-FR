export function speakText(text) {
    if (!window.speechSynthesis) {
        console.warn('Speech synthesis not supported');
        return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try to find a French voice
    const voices = window.speechSynthesis.getVoices();
    const frenchVoice = voices.find(voice => voice.lang.startsWith('fr'));
    if (frenchVoice) {
        utterance.voice = frenchVoice;
    }

    window.speechSynthesis.speak(utterance);
}

export function generateWeatherSummary(current, city) {
    const temp = Math.round(current.temperature_2m);
    const desc = getDesc(current.weather_code);
    return `Bonjour ! À ${city}, il fait actuellement ${temp} degrés avec ${desc}.`;
}

function getDesc(code) {
    // Simplified mapping for speech
    if (code === 0) return "un grand soleil";
    if (code <= 3) return "quelques nuages";
    if (code <= 48) return "de la brume";
    if (code <= 67) return "de la pluie";
    if (code <= 77) return "de la neige";
    return "un temps mitigé";
}
