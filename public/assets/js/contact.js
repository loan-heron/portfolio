// ===== Contact Form Handler =====
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');
const roadmapBlock = document.getElementById('postContactRoadmap');
const roadmapDescription = document.getElementById('roadmapStepDescription');

function trackEvent(eventName, meta = {}) {
    fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName, path: window.location.pathname, meta }),
        keepalive: true
    }).catch(() => {});
}

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        const subject = document.getElementById('subject')?.value || '';

        const enrichedMessage = subject ? `Sujet: ${subject}\n\n${message}` : message;

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    message: enrichedMessage
                })
            });

            const data = await response.json();

            if (data.success) {
                formMessage.textContent = '✅ ' + data.message;
                formMessage.classList.add('success');
                formMessage.classList.remove('error');
                contactForm.reset();
                trackEvent('contact_submit_success', { subject });

                if (roadmapBlock) {
                    roadmapBlock.classList.remove('d-none');
                }

                setTimeout(() => {
                    formMessage.textContent = '';
                    formMessage.classList.remove('success');
                }, 5000);
            } else {
                formMessage.textContent = '❌ ' + data.message;
                formMessage.classList.add('error');
                formMessage.classList.remove('success');
                trackEvent('contact_submit_error', { reason: data.message || 'unknown' });
            }
        } catch (error) {
            console.error('Erreur:', error);
            formMessage.textContent = '❌ Une erreur est survenue';
            formMessage.classList.add('error');
            formMessage.classList.remove('success');
            trackEvent('contact_submit_error', { reason: 'network' });
        }
    });
}

if (roadmapBlock && roadmapDescription) {
    const stepContent = {
        1: 'Atelier express pour aligner objectifs, cible et KPIs business.',
        2: 'Wireframe + maquette + architecture technique validée.',
        3: 'Développement orienté conversion avec validation qualité.',
        4: 'Mise en ligne, instrumentation analytics et itérations.'
    };

    roadmapBlock.querySelectorAll('.roadmap-step').forEach((button) => {
        button.addEventListener('click', () => {
            const step = Number(button.getAttribute('data-step'));
            roadmapDescription.textContent = stepContent[step] || 'Étape en préparation.';
            trackEvent('roadmap_step_click', { step });
        });
    });
}

console.log('📧 Contact page chargée');
