const currentPath = window.location.pathname;
}

}
const THEME_ICON_MOON = '<svg class="theme-toggle-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 3a7 7 0 1 0 9 9 9 9 0 1 1-9-9z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const THEME_ICON_SUN = '<svg class="theme-toggle-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

applyTheme(getSavedTheme());

navLinks.forEach((link) => {
    if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
    }
});

window.addEventListener('DOMContentLoaded', () => {
    initializeThemeToggle();
    initializeStickyMobileCta();
    initializeTrustBadge();
    document.body.classList.add('page-ready');

    const revealTargets = document.querySelectorAll('.glass-card, .hero-title, .hero-subtitle, .section-title, .section-subtitle');
    revealTargets.forEach((item) => item.classList.add('reveal-item'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal-item').forEach((item) => observer.observe(item));

    const floatingCard = document.querySelector('header .glass-card');
    if (floatingCard) {
        floatingCard.classList.add('hero-floating');
    }

    const transitions = document.querySelectorAll('a[href^="/"]:not([href^="//"])');
    transitions.forEach((link) => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('/vendor') || href.startsWith('/assets') || href.includes('#')) {
                return;
            }

            if (link.target === '_blank') {
                return;
            }

            event.preventDefault();
            document.body.classList.remove('page-ready');
            document.body.classList.add('page-leaving');
            setTimeout(() => {
                window.location.href = href;
            }, 180);
        });
    });

    initializeNavAvatar();
    initializeGlobalTracking();
});

function trackEvent(eventName, meta = {}) {
    const payload = {
        eventName,
        path: window.location.pathname,
        meta
    };

    fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
    }).catch(() => {});
}

function initializeGlobalTracking() {
    document.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const anchor = target.closest('a');
        if (!anchor) {
            return;
        }

        const href = anchor.getAttribute('href') || '';
        if (href.includes('contact') || href.includes('devis') || anchor.textContent?.toLowerCase().includes('devis')) {
            trackEvent('cta_click', {
                href,
                label: (anchor.textContent || '').trim().slice(0, 80)
            });
        }
    });
}

function initializeStickyMobileCta() {
    if (document.querySelector('[data-sticky-cta]')) {
        return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'sticky-mobile-cta';
    wrapper.setAttribute('data-sticky-cta', 'true');
    wrapper.innerHTML = '<a class="btn btn-site-primary" href="/portfolio#contact">Demander un devis</a>';

    const link = wrapper.querySelector('a');
    if (link) {
        link.addEventListener('click', () => {
            trackEvent('sticky_cta_click', { location: window.location.pathname });
        });
    }

    document.body.appendChild(wrapper);
}

function initializeTrustBadge() {
    const container = document.querySelector('.hero-core') || document.querySelector('main .container');
    if (!container || document.querySelector('[data-trust-badge]')) {
        return;
    }

    const badge = document.createElement('div');
    badge.className = 'live-trust-badge';
    badge.setAttribute('data-trust-badge', 'true');
    badge.textContent = 'Confiance: chargement...';
    container.prepend(badge);

    fetch('/api/metrics/trust')
        .then((response) => response.json())
        .then((payload) => {
            if (!payload.success || !payload.data) {
                throw new Error('metrics unavailable');
            }

            const responseHours = payload.data.responseHours || 24;
            const projectsDelivered = payload.data.projectsDelivered || 24;
            badge.textContent = `RÃ©ponse moyenne < ${responseHours}h â€¢ ${projectsDelivered}+ projets livrÃ©s`;
        })
        .catch(() => {
            badge.textContent = 'RÃ©ponse moyenne < 24h â€¢ Studio orientÃ© rÃ©sultats';
        });
}

function getSavedTheme() {
    try {
        const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (raw === 'dark' || raw === 'light') {
            return raw;
        }
    } catch {}

    return 'light';
}

function applyTheme(theme) {
    const finalTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', finalTheme);
}

function setTheme(theme) {
    const finalTheme = theme === 'dark' ? 'dark' : 'light';
    applyTheme(finalTheme);

    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, finalTheme);
    } catch {}

    updateThemeToggleButtons();
}

function initializeThemeToggle() {
    const navLists = document.querySelectorAll('.site-nav .navbar-nav');
    if (navLists.length === 0) {
        return;
    }

    navLists.forEach((nav) => {
        if (nav.querySelector('[data-theme-toggle]')) {
            return;
        }

        const item = document.createElement('li');
        item.className = 'nav-item';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-site-outline btn-sm theme-toggle-btn';
        button.setAttribute('data-theme-toggle', 'true');

        button.addEventListener('click', () => {
            const currentTheme = getSavedTheme();
            const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
            animateThemeTransition(nextTheme);
        });

        item.appendChild(button);

        const loginButton = nav.querySelector('a.btn-site-primary[href="/login"]');
        const loginItem = loginButton?.closest('li');

        if (loginItem) {
            nav.insertBefore(item, loginItem);
        } else {
            nav.appendChild(item);
        }
    });

    updateThemeToggleButtons();
}

function animateThemeTransition(nextTheme) {
    const currentTheme = getSavedTheme();
    if (currentTheme === nextTheme) {
        return;
    }
    setTheme(nextTheme);
    trackEvent('theme_toggle', { theme: nextTheme });
}

function updateThemeToggleButtons() {
    const currentTheme = getSavedTheme();
    const isDark = currentTheme === 'dark';

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
        button.innerHTML = isDark ? THEME_ICON_SUN : THEME_ICON_MOON;
        button.classList.toggle('is-dark', isDark);
        button.setAttribute('aria-label', isDark ? 'Activer le mode clair' : 'Activer le mode sombre');
        button.setAttribute('title', isDark ? 'Activer le mode clair' : 'Activer le mode sombre');
        button.setAttribute('aria-pressed', String(isDark));
    });
}

function buildAvatarInitials(name, email) {
    if (name && typeof name === 'string') {
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        if (parts.length === 1) {
            return parts[0].slice(0, 2).toUpperCase();
        }
    }

    if (email && typeof email === 'string') {
        return email.slice(0, 2).toUpperCase();
    }

    return 'ME';
}

function createAvatarMenu(user) {
    const wrapper = document.createElement('div');
    wrapper.className = 'nav-avatar';

    const button = document.createElement('button');
    button.className = 'nav-avatar-btn';
    button.type = 'button';
    button.setAttribute('aria-label', 'Ouvrir le menu profil');
    button.textContent = buildAvatarInitials(user.name, user.email);

    const menu = document.createElement('div');
    menu.className = 'nav-avatar-menu';
    menu.innerHTML = `
        <a href="/profile">Mon profil</a>
        <a href="/formations">Mes accÃ¨s</a>
        <button type="button" id="navAvatarLogout">DÃ©connexion</button>
    `;

    button.addEventListener('click', (event) => {
        event.stopPropagation();
        wrapper.classList.toggle('open');
    });

    document.addEventListener('click', () => {
        wrapper.classList.remove('open');
    });

    menu.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    wrapper.appendChild(button);
    wrapper.appendChild(menu);

    const logoutBtn = menu.querySelector('#navAvatarLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/';
        });
    }

    return wrapper;
}

async function initializeNavAvatar() {
    const loginButtons = document.querySelectorAll('a.btn-site-primary[href="/login"]');
    if (loginButtons.length === 0) {
        return;
    }

    try {
        const response = await fetch('/api/auth/me');

        const payload = await response.json();
        if (!response.ok || !payload.success) {
            throw new Error('Session invalide');
        }

        loginButtons.forEach((button) => {
            const parent = button.parentElement;
            if (!parent) return;
            parent.replaceChild(createAvatarMenu(payload.data), button);
        });
    } catch {}
}

}
