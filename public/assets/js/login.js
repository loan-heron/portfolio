const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');
const sessionBlock = document.getElementById('sessionBlock');
const logoutButton = document.getElementById('logoutButton');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');

function trackEvent(eventName, meta = {}) {
    fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName, path: window.location.pathname, meta }),
        keepalive: true
    }).catch(() => {});
}

function setAlert(element, type, text) {
    if (!element) return;
    element.className = `alert alert-${type}`;
    element.textContent = text;
    element.classList.remove('d-none');
}

function hideAlert(element) {
    if (!element) return;
    element.classList.add('d-none');
}

async function loadCurrentUser() {
    if (!sessionBlock) return;

    try {
        const response = await fetch('/api/auth/me');
        const payload = await response.json();

        if (!response.ok || !payload.success) {
            sessionBlock.classList.add('d-none');
            return;
        }

        userName.textContent = payload.data.name || '-';
        userEmail.textContent = payload.data.email || '-';
        sessionBlock.classList.remove('d-none');
    } catch {
        sessionBlock.classList.add('d-none');
    }
}

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideAlert(loginMessage);

        const formData = new FormData(loginForm);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const payload = await response.json();
            if (!response.ok || !payload.success) {
                throw new Error(payload.message || 'Échec de la connexion.');
            }

            trackEvent('login_success', { emailDomain: String(email).split('@')[1] || 'unknown' });

            setAlert(loginMessage, 'success', payload.message || 'Connexion réussie.');
            const next = new URLSearchParams(window.location.search).get('next');
            window.location.href = next || '/profile';
        } catch (error) {
            setAlert(loginMessage, 'danger', error.message || 'Connexion impossible.');
        }
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideAlert(registerMessage);

        const formData = new FormData(registerForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const payload = await response.json();
            if (!response.ok || !payload.success) {
                throw new Error(payload.message || 'Erreur création de compte.');
            }

            trackEvent('register_success', { emailDomain: String(email).split('@')[1] || 'unknown' });

            registerForm.reset();
            setAlert(registerMessage, 'success', payload.message || 'Compte créé avec succès.');
            window.location.href = '/profile';
        } catch (error) {
            setAlert(registerMessage, 'danger', error.message || 'Erreur création de compte.');
        }
    });
}

if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        sessionBlock.classList.add('d-none');
        setAlert(loginMessage, 'info', 'Vous êtes déconnecté.');
    });
}

loadCurrentUser();
