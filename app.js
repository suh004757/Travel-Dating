// DateScape - Date Record Viewer
// Loads a date record (trip) with places and reviews

let map;
let markers = [];
let currentTrip = null;
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
        await loadDateRecord(slug);
        showAddPlaceButton();
        bindAuthSync();
    } catch (error) {
        showError('Failed to load date record: ' + error.message);
    }
}

// Show "Add Place" button only for logged-in users
async function showAddPlaceButton() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    const btn = document.getElementById('add-place-btn');
    if (btn) {
        btn.style.display = user ? 'inline-block' : 'none';
    }
}

function refreshAllReviewPanels() {
    if (!window.loadPlaceReviews) return;
    document.querySelectorAll('.reviews-container[id^="reviews-"]').forEach((container) => {
        const placeId = container.id.replace('reviews-', '');
        loadPlaceReviews(placeId);
    });
}

function bindAuthSync() {
    if (window.__dateScapeAuthSyncBound) return;
    window.__dateScapeAuthSyncBound = true;
    window.addEventListener('auth-state-changed', async () => {
        await showAddPlaceButton();
        refreshAllReviewPanels();
    });
}

// Load date record from Supabase
async function loadDateRecord(slug) {
    const { data: trip, error: tripError } = await supabaseClient
        .from('trips')
        .select('*')
        .eq('slug', slug)
        .single();

    if (tripError) throw tripError;
    currentTrip = trip;

    // Update header
    document.getElementById('page-title').textContent = `${trip.emoji || ''} ${trip.title || ''}`.trim();
    document.getElementById('page-subtitle').textContent = trip.subtitle || '';

    const startDate = trip.start_date ? new Date(trip.start_date).toLocaleDateString('ko-KR') : '';
    const endDate = trip.end_date ? new Date(trip.end_date).toLocaleDateString('ko-KR') : '';
    const datesEl = document.getElementById('page-dates');
    if (datesEl && startDate) {
        datesEl.textContent = endDate ? `${startDate} ~ ${endDate}` : startDate;
    }

    // Load weather preview for this trip (optional)
    if (typeof loadWeather === 'function') {
        loadWeather(trip).catch((error) => {
            console.error('Weather load error:', error);
        });
    }

    // Load places
    const { data: places, error: placesError } = await supabaseClient
        .from('places')
        .select('*')
        .eq('trip_id', trip.id)
        .order('created_at', { ascending: true });

    if (placesError) throw placesError;

    // Initialize map
    initMap(trip.base_location, places || []);

    // Render places list
    renderPlaces(places || []);
}

function initMap(baseLocation, places) {
    if (!document.getElementById('map')) return;

    map = L.map('map').setView([baseLocation.lat, baseLocation.lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '(c) OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Base location marker
    const hotelIcon = L.divIcon({
        html: `<div style="background:#ff6b9d;color:white;padding:6px 10px;border-radius:15px;font-weight:600;box-shadow:0 2px 6px rgba(0,0,0,0.3);white-space:nowrap;font-size:0.8rem;">${escapeHtml(baseLocation.name)}</div>`,
        className: 'custom-marker',
        iconSize: [200, 30],
        iconAnchor: [100, 30]
    });

    L.marker([baseLocation.lat, baseLocation.lng], { icon: hotelIcon })
        .addTo(map)
        .bindPopup(`<b>${escapeHtml(baseLocation.name)}</b><br>${escapeHtml(baseLocation.address || '')}`);

    // Place markers
    places.forEach(place => {
        if (!place.lat || !place.lng) return;

        const color = place.type === 'restaurant' ? '#ff6b9d' : '#8b4513';

        const icon = L.divIcon({
            html: `<div style="background:${color};color:white;padding:5px 8px;border-radius:12px;font-weight:600;box-shadow:0 2px 4px rgba(0,0,0,0.3);white-space:nowrap;font-size:0.75rem;">${escapeHtml(place.name)}</div>`,
            className: 'custom-marker',
            iconSize: [200, 26],
            iconAnchor: [100, 26]
        });

        const marker = L.marker([place.lat, place.lng], { icon })
            .addTo(map)
            .bindPopup(`<b>${escapeHtml(place.name)}</b><br>${escapeHtml(place.category || '')}`);

        markers.push(marker);
    });

    // Fit bounds to show all markers
    if (places.length > 0) {
        const allPoints = [
            [baseLocation.lat, baseLocation.lng],
            ...places.filter(p => p.lat && p.lng).map(p => [p.lat, p.lng])
        ];
        if (allPoints.length > 1) {
            map.fitBounds(allPoints, { padding: [30, 30] });
        }
    }
}

function renderPlaces(places) {
    const container = document.getElementById('places-list');
    if (!container) return;

    container.innerHTML = '';

    if (places.length === 0) {
        container.innerHTML = '<div class="places-empty">No places recorded yet. Add the first one!</div>';
        return;
    }

    places.forEach(place => {
        container.appendChild(createPlaceCard(place));
    });

    if (typeof loadPlaceReviewsForPlaces === 'function') {
        loadPlaceReviewsForPlaces(places).catch(() => {});
    }
}

function createPlaceCard(place) {
    const card = document.createElement('div');
    card.className = 'place-card';

    const safeName = escapeHtml(place.name);
    const safeCategory = escapeHtml(place.category);
    const safeArea = escapeHtml(place.area);
    const safeDescription = escapeHtml(place.description);
    const safeLink = escapeHtml(place.link);

    card.innerHTML = `
        <div class="place-card-header">
            <h3 class="place-name">${safeName}</h3>
            ${safeCategory ? `<span class="place-category">${safeCategory}</span>` : ''}
        </div>
        ${safeArea ? `<div class="place-area">${safeArea}</div>` : ''}
        ${safeDescription ? `<div class="place-description">${safeDescription}</div>` : ''}
        ${safeLink ? `<a href="${safeLink}" target="_blank" rel="noopener noreferrer" class="place-map-link">View on Map</a>` : ''}
        <div class="reviews-container" id="reviews-${place.id}">
            <div class="reviews-loading">Loading reviews...</div>
        </div>
    `;

    // Reviews are loaded in batch in renderPlaces() for performance.

    return card;
}

// Add Place Modal
function showAddPlaceModal() {
    const modal = document.createElement('div');
    modal.id = 'add-place-modal';
    modal.className = 'modal show';

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeAddPlaceModal()">&times;</span>
            <h2>Add a Place</h2>
            <form id="addPlaceForm" onsubmit="submitNewPlace(event)">
                <label>Name *</label>
                <input type="text" id="new-place-name" required placeholder="e.g. Cafe Onion">

                <label>Category</label>
                <input type="text" id="new-place-category" placeholder="e.g. Bakery, Korean BBQ">

                <label>Type</label>
                <select id="new-place-type">
                    <option value="restaurant">Restaurant</option>
                    <option value="cafe">Cafe</option>
                </select>

                <label>Area</label>
                <input type="text" id="new-place-area" placeholder="e.g. Anguk-dong">

                <label>Description</label>
                <textarea id="new-place-desc" rows="2" placeholder="Short description..."></textarea>

                <label>Map Link (Naver/Kakao/Google)</label>
                <input type="url" id="new-place-link" placeholder="https://...">

                <label>Latitude</label>
                <input type="number" id="new-place-lat" step="any" placeholder="37.5741">

                <label>Longitude</label>
                <input type="number" id="new-place-lng" step="any" placeholder="126.9854">

                <div class="modal-buttons">
                    <button type="submit" class="btn-primary">Add</button>
                    <button type="button" class="btn-secondary" onclick="closeAddPlaceModal()">Cancel</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
}

function closeAddPlaceModal() {
    const modal = document.getElementById('add-place-modal');
    if (modal) modal.remove();
}

async function submitNewPlace(event) {
    event.preventDefault();

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        showLoginModal();
        return;
    }

    if (!currentTrip) {
        alert('No trip loaded.');
        return;
    }

    const name = document.getElementById('new-place-name').value.trim();
    const category = document.getElementById('new-place-category').value.trim();
    const type = document.getElementById('new-place-type').value;
    const area = document.getElementById('new-place-area').value.trim();
    const description = document.getElementById('new-place-desc').value.trim();
    const link = document.getElementById('new-place-link').value.trim();
    const lat = parseFloat(document.getElementById('new-place-lat').value) || null;
    const lng = parseFloat(document.getElementById('new-place-lng').value) || null;

    if (!name) {
        alert('Please enter a place name.');
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('places')
            .insert({
                trip_id: currentTrip.id,
                name,
                category: category || null,
                type,
                area: area || null,
                description: description || null,
                link: link || null,
                lat,
                lng
            });

        if (error) throw error;

        closeAddPlaceModal();

        // Reload the page to show the new place
        const slug = new URLSearchParams(window.location.search).get('plan') || 'daejeon_feb_2026';
        await loadDateRecord(slug);
        showAddPlaceButton();
    } catch (error) {
        console.error('Error adding place:', error);
        alert('Failed to add place: ' + error.message);
    }
}

function showError(message) {
    const container = document.querySelector('.container');
    if (!container) return;

    container.innerHTML = `
        <div style="text-align: center; padding: 100px 20px; color: #dc3545;">
            <h2>Error</h2>
            <p>${escapeHtml(message)}</p>
            <a href="index.html" style="color: #ff6b9d;">Return to Home</a>
        </div>
    `;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
