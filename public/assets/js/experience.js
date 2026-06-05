// ===== Fetch Experience Data =====
async function fetchExperienceData() {
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

        const portfolio = await window.__portfolioDataPromise;
        return Array.isArray(portfolio?.experience) ? portfolio.experience : [];
    } catch (error) {
        console.error('Erreur lors du chargement de l\'expérience:', error);
        return null;
    }
}

// ===== Experience Page =====
async function initExperiencePage() {
    const experience = await fetchExperienceData();
    if (!experience) return;

    const experienceTimeline = document.getElementById('experienceTimeline');
    if (!experienceTimeline) return;

    experienceTimeline.innerHTML = experience
        .map(group => `
            <div class="timeline-group">
                <h3 class="timeline-category">${group.category}</h3>
                ${group.items
                    .map(item => `
                        <div class="timeline-item">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <h4>${item.title}</h4>
                                ${item.meta ? `<p class="timeline-meta">${item.meta}</p>` : ''}
                                <p>${item.description}</p>
                            </div>
                        </div>
                    `)
                    .join('')}
            </div>
        `)
        .join('');
}

if (document.getElementById('experienceTimeline')) {
    initExperiencePage();
}

console.log('📋 Experience page chargée');
