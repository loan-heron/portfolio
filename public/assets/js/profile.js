const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profileInfoForm = document.getElementById('profileInfoForm');
const profileInputName = document.getElementById('profileInputName');
const profileInputEmail = document.getElementById('profileInputEmail');
const profilePasswordForm = document.getElementById('profilePasswordForm');
const profileLogout = document.getElementById('profileLogout');
const profileMessage = document.getElementById('profileMessage');
const privacySettingsForm = document.getElementById('privacySettingsForm');
const manageSubscriptionBtn = document.getElementById('manageSubscriptionBtn');
const subscriptionPlan = document.getElementById('subscriptionPlan');
const subscriptionStatus = document.getElementById('subscriptionStatus');
const subscriptionRenewal = document.getElementById('subscriptionRenewal');

function setProfileMessage(type, text) {
    if (!profileMessage) return;
    profileMessage.className = `alert alert-${type}`;
    profileMessage.textContent = text;
    profileMessage.classList.remove('d-none');
}

function updateProfileView(data) {
    if (!data) return;

    if (profileName) profileName.textContent = data.name || '-';
    if (profileEmail) profileEmail.textContent = data.email || '-';

    const plan = data.subscriptionPlan === 'premium' ? 'Premium' : 'Standard';
    if (subscriptionPlan) subscriptionPlan.textContent = plan;
    if (subscriptionStatus) subscriptionStatus.textContent = 'Actif';
    if (subscriptionRenewal) subscriptionRenewal.textContent = data.subscriptionPlan === 'premium' ? 'Mensuel' : 'Aucun';

    if (profileInputName) profileInputName.value = data.name || '';
    if (profileInputEmail) profileInputEmail.value = data.email || '';
}

async function loadProfile() {
    try {
        const response = await fetch('/api/auth/me');
        const payload = await response.json();

        if (!response.ok || !payload.success) {
            window.location.href = '/login?next=/profile';
            return;
        }

        updateProfileView(payload.data);
    } catch {
        setProfileMessage('danger', 'Impossible de charger le profil pour le moment.');
    }
}

if (profileInfoForm) {
    profileInfoForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = typeof profileInputName?.value === 'string' ? profileInputName.value.trim() : '';
        const email = typeof profileInputEmail?.value === 'string' ? profileInputEmail.value.trim() : '';

        try {
            const response = await fetch('/api/auth/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email })
            });

            const payload = await response.json();
            if (!response.ok || !payload.success) {
                throw new Error(payload.message || 'Impossible de modifier les informations.');
            }

            updateProfileView(payload.data.user);
            setProfileMessage('success', payload.message || 'Informations mises à jour.');
        } catch (error) {
            setProfileMessage('danger', error.message || 'Erreur lors de la mise à jour du profil.');
        }
    });
}

if (profilePasswordForm) {
    profilePasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(profilePasswordForm);
        const passwordPayload = {
            currentPassword: formData.get('currentPassword'),
            newPassword: formData.get('newPassword'),
            confirmPassword: formData.get('confirmPassword')
        };

        try {
            const response = await fetch('/api/auth/me/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(passwordPayload)
            });

            const payload = await response.json();
            if (!response.ok || !payload.success) {
                throw new Error(payload.message || 'Impossible de modifier le mot de passe.');
            }

            profilePasswordForm.reset();
            setProfileMessage('success', payload.message || 'Mot de passe mis à jour.');
        } catch (error) {
            setProfileMessage('danger', error.message || 'Erreur lors de la mise à jour du mot de passe.');
        }
    });
}

if (privacySettingsForm) {
    privacySettingsForm.addEventListener('submit', (event) => {
        event.preventDefault();
        setProfileMessage('success', 'Préférences de confidentialité enregistrées.');
    });
}

if (manageSubscriptionBtn) {
    manageSubscriptionBtn.addEventListener('click', () => {
        setProfileMessage('info', 'Contacte le support pour passer en Premium.');
    });
}

if (profileLogout) {
    profileLogout.addEventListener('click', async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setProfileMessage('info', 'Déconnecté. Redirection...');
        setTimeout(() => {
            window.location.href = '/login';
        }, 500);
    });
}

loadProfile();
