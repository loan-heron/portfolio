// ===== Fetch Portfolio Data =====
async function fetchPortfolioData() {
    try {
        if (!window.__portfolioDataPromise) {
            window.__portfolioDataPromise = fetch('/api/portfolio')
                .then((response) => {
                    if (!response.ok) throw new Error('API portfolio indisponible');
                    return response.json();
                })
                .then((payload) => payload?.data || null)
                .catch(() => null);
        }

        return await window.__portfolioDataPromise;
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        return null;
    }
}

// ===== About Page =====
async function initAboutPage() {
    const data = await fetchPortfolioData();
    if (!data) return;

    const interestsGrid = document.getElementById('interestsGrid');
    if (interestsGrid && data.person.interests) {
        interestsGrid.innerHTML = data.person.interests
            .map(interest => `<span class="interest-tag">${interest}</span>`)
            .join('');
    }
}

if (document.getElementById('interestsGrid')) {
    initAboutPage();
}

console.log('👤 About page chargée');
