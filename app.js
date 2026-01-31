// Global variables
let map;
let markers = [];
let currentTrip = null;
let currentFilter = 'all';
let supabaseClient;

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
    } catch (error) {
        showError('데이터를 불러올 수 없습니다: ' + error.message);
    }
}

// Load complete itinerary from Supabase
async function loadItinerary(slug) {
    // 1. Load Trip
    const { data: trip, error: tripError } = await supabaseClient
        .from('trips')
        .select('*')
        .eq('slug', slug)
        .single();

    if (tripError) throw tripError;
    currentTrip = trip;

    // Update page title
    document.getElementById('page-title').textContent = trip.emoji + ' ' + trip.title;
    document.getElementById('page-subtitle').textContent = trip.subtitle || '';

    // 2. Load Places
    const { data: places, error: placesError } = await supabaseClient
        .from('places')
        .select('*')
        .eq('trip_id', trip.id);

    if (placesError) throw placesError;

    const restaurants = places.filter(p => p.type === 'restaurant');
    const cafes = places.filter(p => p.type === 'cafe');

    // 3. Load Routes
    const { data: routes, error: routesError } = await supabaseClient
        .from('routes')
        .select('*')
        .eq('trip_id', trip.id)
        .order('day_key');

    if (routesError) throw routesError;

    // 4. Initialize Map
    initMap(trip.base_location, [...restaurants, ...cafes]);

    // 5. Render Lists
    renderRestaurants(restaurants);
    renderCafes(cafes);
    renderRoutePlan(routes);

    // 6. Load Weather (if enabled)
    if (window.loadWeather && WEATHER_CONFIG.enabled) {
        loadWeather(trip);
    }

    // 7. Load To-Dos (if component exists)
    if (window.loadTodos) {
        loadTodos(trip.id);
    }
}

// Initialize map
function initMap(baseLocation, places) {
    if (!document.getElementById('map')) return;

    map = L.map('map').setView([baseLocation.lat, baseLocation.lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Hotel marker
    const hotelIcon = L.divIcon({
        html: `<div style="background:#ff6b9d;color:white;padding:8px 12px;border-radius:20px;font-weight:600;box-shadow:0 2px 6px rgba(0,0,0,0.3);white-space:nowrap;">🏨 ${baseLocation.name}</div>`,
        className: 'custom-marker',
        iconSize: [200, 40],
        iconAnchor: [100, 40]
    });

    L.marker([baseLocation.lat, baseLocation.lng], { icon: hotelIcon })
        .addTo(map)
        .bindPopup(`<b>${baseLocation.name}</b><br>${baseLocation.address}`);

    // Add place markers
    addAllMarkers(places);
}

// Add markers to map
function addAllMarkers(places) {
    if (!map) return;

    // Clear existing
    markers.forEach(m => m.remove());
    markers = [];

    places.forEach(place => {
        // Filter based on current filter
        if (currentFilter === 'restaurants' && place.type !== 'restaurant') return;
        if (currentFilter === 'cafes' && place.type !== 'cafe') return;

        const color = place.type === 'restaurant' ? '#ff6b9d' : '#8b4513';
        const emoji = place.type === 'restaurant' ? '🍽️' : '☕';

        const icon = L.divIcon({
            html: `<div style="background:${color};color:white;padding:6px 10px;border-radius:15px;font-weight:600;box-shadow:0 2px 4px rgba(0,0,0,0.3);white-space:nowrap;font-size:0.8rem;">${emoji} ${place.name}</div>`,
            className: 'custom-marker',
            iconSize: [200, 30],
            iconAnchor: [100, 30]
        });

        const marker = L.marker([place.lat, place.lng], { icon: icon })
            .addTo(map)
            .bindPopup(`<b>${place.name}</b><br>${place.category}<br>${place.description}`);

        markers.push(marker);
    });
}

// Render restaurants
function renderRestaurants(restaurants) {
    const container = document.getElementById('restaurant-list');
    if (!container) return;
    container.innerHTML = '';

    if (restaurants.length === 0) {
        container.innerHTML = '<p style="padding:20px;text-align:center">식당 데이터가 없습니다</p>';
        return;
    }

    restaurants.forEach(r => {
        const card = createPlaceCard(r);
        container.appendChild(card);
    });
}

// Render cafes
function renderCafes(cafes) {
    const container = document.getElementById('cafe-list');
    if (!container) return;
    container.innerHTML = '';

    if (cafes.length === 0) {
        container.innerHTML = '<p style="padding:20px;text-align:center">카페 데이터가 없습니다</p>';
        return;
    }

    cafes.forEach(c => {
        const card = createPlaceCard(c);
        container.appendChild(card);
    });
}

// Create place card
function createPlaceCard(place) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
        <div class="item-header">
            <h3>${place.name}</h3>
            <span class="category">${place.category}</span>
        </div>
        <div class="details">
            <span>📍 ${place.area}</span>
            <span>🚶 ${place.distance}</span>
        </div>
        <div class="description">${place.description}</div>
        <div class="links">
            <a href="${place.link}" target="_blank" class="map-link">📍 네이버 지도 보기</a>
        </div>
        <div class="comments-section" id="comments-${place.id}"></div>
    `;

    // Load comments if component exists
    if (window.loadPlaceComments) {
        setTimeout(() => loadPlaceComments(place.id), 100);
    }

    return card;
}

// Render route plan
function renderRoutePlan(routes) {
    const container = document.getElementById('route-content');
    if (!container) return;
    container.innerHTML = '';

    if (routes.length === 0) {
        container.innerHTML = '<p style="padding:20px;text-align:center">루트 데이터가 없습니다</p>';
        return;
    }

    routes.forEach(route => {
        const section = document.createElement('details');
        section.className = 'day-section';
        section.open = routes.indexOf(route) === 0; // First day open by default

        let optionsHTML = '';
        route.options.forEach(opt => {
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
            <summary class="day-title">${route.title}</summary>
            <div class="options-container">
                ${optionsHTML}
            </div>
        `;
        container.appendChild(section);
    });
}

// Setup filters
function setupFilters() {
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', async () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentFilter = btn.getAttribute('data-filter');

            // Reload places with filter
            const { data: places } = await supabaseClient
                .from('places')
                .select('*')
                .eq('trip_id', currentTrip.id);

            addAllMarkers(places);
        });
    });
}

// Setup tabs
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

// Share functionality
function shareItinerary() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => alert('링크가 복사되었습니다!'));
}

// Error display
function showError(message) {
    document.querySelector('.container').innerHTML = `
        <div style="text-align: center; padding: 100px 20px; color: #dc3545;">
            <h2>❌ 오류 발생</h2>
            <p>${message}</p>
            <a href="index.html" style="color: #ff6b9d;">← 메인으로 돌아가기</a>
        </div>
    `;
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
