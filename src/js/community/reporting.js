export function submitReport(isCorrect) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate API call
            const count = Math.floor(Math.random() * 50) + 10;
            resolve({
                success: true,
                message: isCorrect ? 'Merci ! Votre confirmation aide la communauté.' : 'Merci ! Votre signalement a été pris en compte.',
                communityCount: count
            });
        }, 800);
    });
}

export function getCommunityStatus() {
    // Simulate fetching existing reports
    const count = Math.floor(Math.random() * 100) + 20;
    return {
        text: `${count} utilisateurs confirment la météo actuelle.`
    };
}
