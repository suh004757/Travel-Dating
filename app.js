// Global variables
let map;
let markers = [];
let restaurantData = [];
let cafeData = [];
let currentFilter = 'all';

// Initialize map with Leaflet
function initMap() {
    if (!document.getElementById('map')) return;

    // Center on Orakai
    map = L.map('map').setView([ORAKAI_LOCATION.lat, ORAKAI_LOCATION.lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Hotel marker
    const hotelIcon = L.divIcon({
        html: '<div style="background:#ff6b9d;color:white;padding:8px 12px;border-radius:20px;font-weight:600;box-shadow:0 2px 6px rgba(0,0,0,0.3);white-space:nowrap;">🏨 오라카이 호텔</div>',
        className: 'custom-marker',
        iconSize: [150, 40],
        iconAnchor: [75, 40]
    });

    L.marker([ORAKAI_LOCATION.lat, ORAKAI_LOCATION.lng], { icon: hotelIcon })
        .addTo(map)
        .bindPopup(`<b>${ORAKAI_LOCATION.name}</b><br>${ORAKAI_LOCATION.address}`);

    // Add all Item markers
    addAllMarkers();
}

function addAllMarkers() {
    if (!map) return;

    // Clear existing
    markers.forEach(m => m.remove());
    markers = [];

    // Restaurants
    restaurantData.forEach(r => {
        if (currentFilter === 'cafes') return; // Hide if cafes only selected

        const icon = L.divIcon({
            html: `<div style="background:#ff6b9d;color:white;padding:6px 10px;border-radius:15px;font-weight:600;box-shadow:0 2px 4px rgba(0,0,0,0.3);white-space:nowrap;font-size:0.8rem;">🍽️ ${r.name}</div>`,
            className: 'custom-marker',
            iconSize: [200, 30],
            iconAnchor: [100, 30]
        });

        const marker = L.marker([r.lat, r.lng], { icon: icon })
            .addTo(map)
            .bindPopup(`<b>${r.name}</b><br>${r.category}<br>${r.description}`);

        // No explicit 'show on map' click needed, they are just there.
        // Clicking marker could highlight list item? Optional.

        markers.push(marker);
    });

    // Cafes
    cafeData.forEach(c => {
        if (currentFilter === 'restaurants') return; // Hide if restaurants only selected

        const icon = L.divIcon({
            html: `<div style="background:#8b4513;color:white;padding:6px 10px;border-radius:15px;font-weight:600;box-shadow:0 2px 4px rgba(0,0,0,0.3);white-space:nowrap;font-size:0.8rem;">☕ ${c.name}</div>`,
            className: 'custom-marker',
            iconSize: [200, 30],
            iconAnchor: [100, 30]
        });

        const marker = L.marker([c.lat, c.lng], { icon: icon })
            .addTo(map)
            .bindPopup(`<b>${c.name}</b><br>${c.category}<br>${c.description}`);

        markers.push(marker);
    });
}

function renderRestaurants() {
    const container = document.getElementById('restaurant-list');
    if (!container) return;
    container.innerHTML = '';

    if (restaurantData.length === 0) {
        container.innerHTML = '<p style="padding:20px;text-align:center">No Data</p>';
        return;
    }

    restaurantData.forEach(r => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-header">
                <h3>${r.name}</h3>
                <span class="category">${r.category}</span>
            </div>
            <div class="details">
                <span>📍 ${r.area}</span>
                <span>🚶 ${r.distance}</span>
            </div>
            <div class="description">${r.description}</div>
            <div class="links">
                 <a href="${r.link}" target="_blank" class="map-link">📍 네이버 지도 보기</a>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderCafes() {
    const container = document.getElementById('cafe-list');
    if (!container) return;
    container.innerHTML = '';

    if (cafeData.length === 0) {
        container.innerHTML = '<p style="padding:20px;text-align:center">No Data</p>';
        return;
    }

    cafeData.forEach(c => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-header">
                <h3>${c.name}</h3>
                <span class="category">${c.category}</span>
            </div>
            <div class="details">
                <span>📍 ${c.area}</span>
                <span>🚶 ${c.distance}</span>
            </div>
            <div class="description">${c.description}</div>
            <div class="links">
                 <a href="${c.link}" target="_blank" class="map-link">📍 네이버 지도 보기</a>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderRoutePlan() {
    const container = document.getElementById('route-content');
    if (!container) return;
    container.innerHTML = '';

    if (!routePlans) return;

    Object.keys(routePlans).forEach(dayKey => {
        const dayPlan = routePlans[dayKey];
        const section = document.createElement('div');
        section.className = 'day-section';

        let optionsHTML = '';
        dayPlan.options.forEach(opt => {
            let actsHTML = opt.activities.map(a => `
                <div class="route-item">
                    <span class="time">${a.time}</span>
                    <span class="activity-name">${a.name}</span>
                    <span class="activity-desc">${a.description}</span>
                </div>
            `).join('');

            optionsHTML += `
                <div class="route-option">
                    <h4>${opt.name}</h4>
                    <p class="option-desc">${opt.description}</p>
                    <div class="timeline">
                        ${actsHTML}
                    </div>
                </div>
            `;
        });

        section.innerHTML = `
            <h3 class="day-title">${dayPlan.title}</h3>
            <div class="options-container">
                ${optionsHTML}
            </div>
        `;
        container.appendChild(section);
    });
}

function setupFilters() {
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentFilter = btn.getAttribute('data-filter');
            addAllMarkers(); // Re-render markers based on filter

            // Also switch tab implicitly? No, tabs are separate list views.
            // But let's keep it simple.
        });
    });
}

function setupTabs() {
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const target = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(target + '-tab').classList.add('active');
        });
    });
}

function init() {
    if (typeof restaurants !== 'undefined') restaurantData = restaurants;
    if (typeof cafes !== 'undefined') cafeData = cafes;

    initMap();
    renderRestaurants();
    renderCafes();
    renderRoutePlan();

    setupFilters();
    setupTabs();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function shareItinerary() {
    // Simplified share
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => alert('링크가 복사되었습니다!'));
}
function downloadPlan() { alert('기능 준비중입니다.'); }
