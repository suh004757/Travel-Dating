// Global variables
let map;
let markers = [];
let currentTrip = null;
let currentFilter = 'all';
let supabaseClient;

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Initialize Supabase
const { createClient } = supabase;
supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Main initialization
async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('plan') || 'daejeon_feb_2026';

    try {
        await loadItinerary(slug);
        setupFilters();
        setupTabs();
        setupActions();
    } catch (error) {
        showError('Failed to load itinerary: ' + error.message);
    }
}

// Load complete itinerary from Supabase
async function loadItinerary(slug) {
    const { data: trip, error: tripError } = await supabaseClient
        .from('trips')
        .select('*')
        .eq('slug', slug)
        .single();

    if (tripError) throw tripError;
    currentTrip = trip;

    document.getElementById('page-title').textContent = `${trip.emoji || ''} ${trip.title || ''}`.trim();
    document.getElementById('page-subtitle').textContent = trip.subtitle || '';

    const { data: places, error: placesError } = await supabaseClient
        .from('places')
        .select('*')
        .eq('trip_id', trip.id);

    if (placesError) throw placesError;

    const restaurants = places.filter(p => p.type === 'restaurant');
    const cafes = places.filter(p => p.type === 'cafe');

    const { data: routes, error: routesError } = await supabaseClient
        .from('routes')
        .select('*')
        .eq('trip_id', trip.id)
        .order('day_key');

    if (routesError) throw routesError;

    initMap(trip.base_location, [...restaurants, ...cafes]);
    renderRestaurants(restaurants);
    renderCafes(cafes);
    renderRoutePlan(routes);

    if (window.loadWeather && WEATHER_CONFIG.enabled) {
        loadWeather(trip);
    }

    if (window.loadTodos) {
        loadTodos(trip.id);
    }
}

function initMap(baseLocation, places) {
    if (!document.getElementById('map')) return;

    map = L.map('map').setView([baseLocation.lat, baseLocation.lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '(c) OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    const hotelIcon = L.divIcon({
        html: `<div style="background:#ff6b9d;color:white;padding:8px 12px;border-radius:20px;font-weight:600;box-shadow:0 2px 6px rgba(0,0,0,0.3);white-space:nowrap;">Hotel: ${escapeHtml(baseLocation.name)}</div>`,
        className: 'custom-marker',
        iconSize: [220, 40],
        iconAnchor: [110, 40]
    });

    L.marker([baseLocation.lat, baseLocation.lng], { icon: hotelIcon })
        .addTo(map)
        .bindPopup(`<b>${escapeHtml(baseLocation.name)}</b><br>${escapeHtml(baseLocation.address)}`);

    addAllMarkers(places);
}

function addAllMarkers(places) {
    if (!map) return;

    markers.forEach(marker => marker.remove());
    markers = [];

    places.forEach(place => {
        if (currentFilter === 'restaurants' && place.type !== 'restaurant') return;
        if (currentFilter === 'cafes' && place.type !== 'cafe') return;

        const color = place.type === 'restaurant' ? '#ff6b9d' : '#8b4513';
        const prefix = place.type === 'restaurant' ? 'R' : 'C';

        const icon = L.divIcon({
            html: `<div style="background:${color};color:white;padding:6px 10px;border-radius:15px;font-weight:600;box-shadow:0 2px 4px rgba(0,0,0,0.3);white-space:nowrap;font-size:0.8rem;">${prefix}: ${escapeHtml(place.name)}</div>`,
            className: 'custom-marker',
            iconSize: [220, 30],
            iconAnchor: [110, 30]
        });

        const marker = L.marker([place.lat, place.lng], { icon })
            .addTo(map)
            .bindPopup(`<b>${escapeHtml(place.name)}</b><br>${escapeHtml(place.category)}<br>${escapeHtml(place.description)}`);

        markers.push(marker);
    });
}

function renderRestaurants(restaurants) {
    const container = document.getElementById('restaurant-list');
    if (!container) return;

    container.innerHTML = '';
    if (restaurants.length === 0) {
        container.innerHTML = '<p style="padding:20px;text-align:center">No restaurant data found.</p>';
        return;
    }

    restaurants.forEach(place => container.appendChild(createPlaceCard(place)));
}

function renderCafes(cafes) {
    const container = document.getElementById('cafe-list');
    if (!container) return;

    container.innerHTML = '';
    if (cafes.length === 0) {
        container.innerHTML = '<p style="padding:20px;text-align:center">No cafe data found.</p>';
        return;
    }

    cafes.forEach(place => container.appendChild(createPlaceCard(place)));
}

function createPlaceCard(place) {
    const safeName = escapeHtml(place.name);
    const safeCategory = escapeHtml(place.category);
    const safeArea = escapeHtml(place.area);
    const safeDistance = escapeHtml(place.distance);
    const safeDescription = escapeHtml(place.description);
    const safeLink = escapeHtml(place.link);

    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
        <div class="item-header">
            <h3>${safeName}</h3>
            <span class="category">${safeCategory}</span>
        </div>
        <div class="details">
            <span>Area: ${safeArea}</span>
            <span>Distance: ${safeDistance}</span>
        </div>
        <div class="description">${safeDescription}</div>
        <div class="links">
            <a href="${safeLink}" target="_blank" rel="noopener noreferrer" class="map-link">Open map page</a>
        </div>
        <div class="comments-section" id="comments-${place.id}"></div>
    `;

    if (window.loadPlaceComments) {
        setTimeout(() => loadPlaceComments(place.id), 100);
    }

    return card;
}

function renderRoutePlan(routes) {
    const container = document.getElementById('route-content');
    if (!container) return;

    container.innerHTML = '';
    if (routes.length === 0) {
        container.innerHTML = '<p style="padding:20px;text-align:center">No route data found.</p>';
        return;
    }

    routes.forEach((route, index) => {
        const section = document.createElement('details');
        section.className = 'day-section';
        section.open = index === 0;

        const optionsHTML = route.options.map(option => {
            const activitiesHTML = option.activities.map(activity => `
                <div class="route-item">
                    <span class="time">${escapeHtml(activity.time)}</span>
                    <span class="activity-name">${escapeHtml(activity.name)}</span>
                    <span class="activity-desc">${escapeHtml(activity.description)}</span>
                </div>
            `).join('');

            return `
                <div class="route-option">
                    <h4>${escapeHtml(option.name)}</h4>
                    <p class="option-desc">${escapeHtml(option.description)}</p>
                    <div class="timeline">${activitiesHTML}</div>
                </div>
            `;
        }).join('');

        section.innerHTML = `
            <summary class="day-title">${escapeHtml(route.title)}</summary>
            <div class="options-container">${optionsHTML}</div>
        `;

        container.appendChild(section);
    });
}

function setupFilters() {
    const buttons = document.querySelectorAll('.filter-btn');

    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            buttons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');

            currentFilter = button.getAttribute('data-filter');

            const { data: places } = await supabaseClient
                .from('places')
                .select('*')
                .eq('trip_id', currentTrip.id);

            addAllMarkers(places || []);
        });
    });
}

function setupTabs() {
    const buttons = document.querySelectorAll('.tab-btn');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');

            const target = button.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            document.getElementById(`${target}-tab`).classList.add('active');
        });
    });
}

function setupActions() {
    const shareButton = document.getElementById('share-itinerary-btn');
    if (shareButton) {
        shareButton.addEventListener('click', shareItinerary);
    }
}

function shareItinerary() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard.');
    });
}

function showError(message) {
    const container = document.querySelector('.container');
    if (!container) return;

    container.innerHTML = `
        <div style="text-align: center; padding: 100px 20px; color: #dc3545;">
            <h2>Error</h2>
            <p>${message}</p>
            <a href="index.html" style="color: #ff6b9d;">Return to Home</a>
        </div>
    `;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
