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

// ===== Home Page ===== 
async function initHomePage() {
    const data = await fetchPortfolioData();
    if (!data) return;

    // Remplir les infos du héro
    const heroTitle = document.getElementById('heroTitle');
    const heroSubtitle = document.getElementById('heroSubtitle');
    const heroDescription = document.getElementById('heroDescription');

    if (heroTitle) heroTitle.textContent = data.person.name;
    if (heroSubtitle) heroSubtitle.textContent = data.person.title;
    if (heroDescription) heroDescription.textContent = data.person.bio;
}

if (window.location.pathname === '/' || window.location.pathname === '/home' || window.location.pathname === '/portfolio' || window.location.pathname.includes('home')) {
    initHomePage();
}

console.log('🏠 Home page chargée');
