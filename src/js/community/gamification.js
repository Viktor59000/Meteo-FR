const LEVELS = [
    { name: 'Observateur', minXP: 0 },
    { name: 'Éclaireur', minXP: 100 },
    { name: 'Météorologue', minXP: 300 },
    { name: 'Expert', minXP: 600 },
    { name: 'Légende', minXP: 1000 }
];

export function getUserProfile() {
    const stored = localStorage.getItem('meteo_profile');
    if (stored) {
        return JSON.parse(stored);
    }
    return {
        xp: 0,
        levelIndex: 0,
        badges: []
    };
}

export function addXP(amount) {
    const profile = getUserProfile();
    const oldLevel = LEVELS[profile.levelIndex];

    profile.xp += amount;

    // Check level up
    let newLevelIndex = profile.levelIndex;
    for (let i = profile.levelIndex + 1; i < LEVELS.length; i++) {
        if (profile.xp >= LEVELS[i].minXP) {
            newLevelIndex = i;
        } else {
            break;
        }
    }

    let leveledUp = false;
    if (newLevelIndex > profile.levelIndex) {
        profile.levelIndex = newLevelIndex;
        leveledUp = true;
    }

    localStorage.setItem('meteo_profile', JSON.stringify(profile));

    return {
        newXP: profile.xp,
        level: LEVELS[profile.levelIndex],
        leveledUp
    };
}

export function getLevelProgress(xp, levelIndex) {
    const currentLevel = LEVELS[levelIndex];
    const nextLevel = LEVELS[levelIndex + 1];

    if (!nextLevel) return 100; // Max level

    const range = nextLevel.minXP - currentLevel.minXP;
    const progress = xp - currentLevel.minXP;

    return Math.min(100, Math.floor((progress / range) * 100));
}
