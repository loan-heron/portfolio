// ===== Fetch Projects Data =====
async function fetchProjectsData() {
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
        return Array.isArray(portfolio?.projects) ? portfolio.projects : [];
    } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        return null;
    }
}

function createProjectModal() {
    const modal = document.createElement('div');
    modal.id = 'projectModal';
    modal.className = 'project-modal hidden';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
        <div class="project-modal-backdrop" data-close="true"></div>
        <div class="project-modal-content glass" role="dialog" aria-modal="true" aria-labelledby="projectModalTitle">
            <button class="project-modal-close" id="projectModalClose" aria-label="Fermer les détails du projet">×</button>
            <div class="project-modal-header">
                <h3 id="projectModalTitle"></h3>
                <span id="projectModalType" class="project-type"></span>
            </div>
            <p id="projectModalDescription" class="project-modal-description"></p>
            <div id="projectModalImageWrap" class="project-modal-image-wrap hidden">
                <img id="projectModalImage" class="project-modal-image" alt="Aperçu du projet">
            </div>
            <p id="projectModalDetailDescription" class="project-modal-detail-description hidden"></p>
            <div id="projectModalTags" class="project-tags"></div>
            <div id="projectModalStatus" class="project-status"></div>
            <div class="project-modal-actions" id="projectModalActions"></div>
        </div>
    `;

    document.body.appendChild(modal);
    return modal;
}

function renderProjectCards(projects) {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;

    projectsGrid.innerHTML = projects
        .map(project => `
            <article class="project-card glass" data-project-id="${project.id}" role="button" tabindex="0" aria-label="Ouvrir le projet ${project.title}">
                <div class="project-header">
                    <h3>${project.title}</h3>
                    <span class="project-type">${project.type}</span>
                </div>
                <p class="project-description">${project.description}</p>
                <div class="project-tags">
                    ${project.tags
                        .map(tag => `<span>${tag}</span>`)
                        .join('')}
                </div>
                <div class="project-card-footer">
                    <span class="project-status">Status: ${project.status}</span>
                    ${project.demoUrl ? `<a class="btn btn-site-outline btn-sm" href="${project.demoUrl}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">Voir le site →</a>` : ''}
                </div>
            </article>
        `)
        .join('');
}

function openProjectModal(project, modal) {
    const title = document.getElementById('projectModalTitle');
    const type = document.getElementById('projectModalType');
    const description = document.getElementById('projectModalDescription');
    const detailDescription = document.getElementById('projectModalDetailDescription');
    const imageWrap = document.getElementById('projectModalImageWrap');
    const image = document.getElementById('projectModalImage');
    const tags = document.getElementById('projectModalTags');
    const status = document.getElementById('projectModalStatus');
    const actions = document.getElementById('projectModalActions');

    if (!title || !type || !description || !detailDescription || !imageWrap || !image || !tags || !status || !actions) return;

    title.textContent = project.title;
    type.textContent = project.type;
    description.textContent = project.description;

    if (project.detailImage) {
        image.src = project.detailImage;
        image.alt = `Aperçu du projet ${project.title}`;
        imageWrap.classList.remove('hidden');
    } else {
        image.removeAttribute('src');
        imageWrap.classList.add('hidden');
    }

    if (project.detailDescription) {
        detailDescription.textContent = project.detailDescription;
        detailDescription.classList.remove('hidden');
    } else {
        detailDescription.textContent = '';
        detailDescription.classList.add('hidden');
    }

    tags.innerHTML = project.tags.map(tag => `<span>${tag}</span>`).join('');
    status.textContent = `Status: ${project.status}`;

    const actionButtons = [];
    if (project.demoUrl) {
        actionButtons.push(`<a class="btn btn-primary" href="${project.demoUrl}" target="_blank" rel="noopener noreferrer">Tester le projet</a>`);
    }
    if (project.repoUrl) {
        actionButtons.push(`<a class="btn btn-secondary" href="${project.repoUrl}" target="_blank" rel="noopener noreferrer">Voir le code</a>`);
    }
    actions.innerHTML = actionButtons.join('');
    actions.classList.toggle('hidden', actionButtons.length === 0);

    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
}

function closeProjectModal(modal) {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
}

function bindProjectInteractions(projects, modal) {
    const projectCards = document.querySelectorAll('.project-card');
    const closeButton = document.getElementById('projectModalClose');

    projectCards.forEach(card => {
        const openCard = () => {
            const projectId = Number(card.dataset.projectId);
            const selectedProject = projects.find(project => project.id === projectId);
            if (selectedProject) {
                openProjectModal(selectedProject, modal);
            }
        };

        card.addEventListener('click', openCard);
        card.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openCard();
            }
        });
    });

    if (closeButton) {
        closeButton.addEventListener('click', () => closeProjectModal(modal));
    }

    modal.addEventListener('click', event => {
        if (event.target instanceof HTMLElement && event.target.dataset.close === 'true') {
            closeProjectModal(modal);
        }
    });

    document.addEventListener('keydown', event => {
        const isOpen = !modal.classList.contains('hidden');
        if (isOpen && event.key === 'Escape') {
            closeProjectModal(modal);
        }
    });
}

// ===== Projects Page =====
async function initProjectsPage() {
    const projects = await fetchProjectsData();
    if (!projects) return;

    renderProjectCards(projects);
    const modal = createProjectModal();
    bindProjectInteractions(projects, modal);
}

if (document.getElementById('projectsGrid')) {
    initProjectsPage();
}

console.log('🎨 Projects page chargée');
