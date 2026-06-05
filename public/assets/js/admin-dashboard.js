const statsContainer = document.getElementById('adminStats');
const leadsContainer = document.getElementById('adminLeads');
const eventsContainer = document.getElementById('adminEvents');

function renderStats(stats) {
    if (!statsContainer) return;
    statsContainer.innerHTML = `
        <div class="col-md-3"><div class="glass-card p-3"><small>Leads</small><h3>${stats.leads}</h3></div></div>
        <div class="col-md-3"><div class="glass-card p-3"><small>Users</small><h3>${stats.users}</h3></div></div>
        <div class="col-md-3"><div class="glass-card p-3"><small>Premium</small><h3>${stats.premiumUsers}</h3></div></div>
        <div class="col-md-3"><div class="glass-card p-3"><small>Événements</small><h3>${stats.analyticsEvents}</h3></div></div>
    `;
}

function renderLeads(leads) {
    if (!leadsContainer) return;
    if (!leads || leads.length === 0) {
        leadsContainer.textContent = 'Aucun lead pour le moment.';
        return;
    }

    leadsContainer.innerHTML = leads.map((lead) => `<div class="notice-card mb-2"><strong>${lead.name}</strong> • ${lead.email} • ${lead.status}</div>`).join('');
}

function renderEvents(events) {
    if (!eventsContainer) return;
    if (!events || events.length === 0) {
        eventsContainer.textContent = 'Aucun événement.';
        return;
    }

    eventsContainer.innerHTML = events.map((eventRow) => `<div class="notice-card mb-2"><strong>${eventRow.event_name}</strong> • ${eventRow.total}</div>`).join('');
}

async function loadDashboard() {
    try {
        const response = await fetch('/api/admin/dashboard');
        const payload = await response.json();

        if (!response.ok || !payload.success) {
            throw new Error(payload.message || 'Dashboard indisponible');
        }

        renderStats(payload.data.stats);
        renderLeads(payload.data.latestLeads);
        renderEvents(payload.data.topEvents);
    } catch (error) {
        if (statsContainer) {
            statsContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger">${error.message}</div></div>`;
        }
    }
}

loadDashboard();
