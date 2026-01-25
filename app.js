// Global variables
let map;
let markers = [];
let currentFilter = 'all';
let editMode = false;
let restaurantData = [];
let cafeData = [];
let selectedRestaurants = new Set();
let selectedCafes = new Set();

// Initialize map with Leaflet
function initMap() {
    // Create map centered on Orakai Insadong Suites
    if (!document.getElementById('map')) return;

    map = L.map('map').setView([ORAKAI_LOCATION.lat, ORAKAI_LOCATION.lng], 14);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Add hotel marker
    const hotelIcon = L.divIcon({
        html: '<div style="background:#ff6b9d;color:white;padding:8px 12px;border-radius:20px;font-weight:600;box-shadow:0 2px 6px rgba(0,0,0,0.3);white-space:nowrap;">🏨 Orakai Hotel</div>',
        className: 'custom-marker',
        iconSize: [150, 40],
        iconAnchor: [75, 40]
    });

    L.marker([ORAKAI_LOCATION.lat, ORAKAI_LOCATION.lng], { icon: hotelIcon })
        .addTo(map)
        .bindPopup(`<b>${ORAKAI_LOCATION.name}</b><br>${ORAKAI_LOCATION.address}`);

    // Add all markers
    addAllMarkers();
}

// Add all markers to map
function addAllMarkers() {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.remove());
    markers = [];

    // Add restaurant markers - only if selected
    restaurantData.forEach(restaurant => {
        if (!selectedRestaurants.has(restaurant.name)) return;

        const icon = L.divIcon({
            html: '<div style="background:#ff6b9d;color:white;padding:6px 10px;border-radius:15px;font-size:0.85rem;font-weight:600;box-shadow:0 2px 4px rgba(0,0,0,0.3);white-space:nowrap;">🍽️ ' + restaurant.name.split('(')[0].trim() + '</div>',
            className: 'custom-marker',
            iconSize: [200, 30],
            iconAnchor: [100, 30]
        });

        const marker = L.marker([restaurant.lat, restaurant.lng], { icon: icon })
            .addTo(map)
            .bindPopup(`<b>${restaurant.name}</b><br>${restaurant.category}<br>${restaurant.description.substring(0, 100)}...`);

        marker.on('click', () => {
            showItemDetails(restaurant, 'restaurant');
        });

        markers.push({ marker, data: restaurant, type: 'restaurant' });
    });

    // Add cafe markers - only if selected
    cafeData.forEach(cafe => {
        if (!selectedCafes.has(cafe.name)) return;

        const icon = L.divIcon({
            html: '<div style="background:#8b4513;color:white;padding:6px 10px;border-radius:15px;font-size:0.85rem;font-weight:600;box-shadow:0 2px 4px rgba(0,0,0,0.3);white-space:nowrap;">☕ ' + cafe.name.split('(')[0].trim() + '</div>',
            className: 'custom-marker',
            iconSize: [200, 30],
            iconAnchor: [100, 30]
        });

        const marker = L.marker([cafe.lat, cafe.lng], { icon: icon })
            .addTo(map)
            .bindPopup(`<b>${cafe.name}</b><br>${cafe.category}<br>${cafe.description.substring(0, 100)}...`);

        marker.on('click', () => {
            showItemDetails(cafe, 'cafe');
        });

        markers.push({ marker, data: cafe, type: 'cafe' });
    });
}

// Show item details
function showItemDetails(item, type) {
    if (type === 'restaurant') {
        const tabBtn = document.querySelector('[data-tab="restaurants"]');
        if (tabBtn) tabBtn.click();

        setTimeout(() => {
            const card = document.querySelector(`#restaurant-list [data-name="${item.name}"]`);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                card.style.background = '#ffe8f0';
                setTimeout(() => { card.style.background = '#fff5f7'; }, 2000);
            }
        }, 100);
    } else {
        const tabBtn = document.querySelector('[data-tab="cafes"]');
        if (tabBtn) tabBtn.click();

        setTimeout(() => {
            const card = document.querySelector(`#cafe-list [data-name="${item.name}"]`);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                card.style.background = '#e6ccb3';
                setTimeout(() => { card.style.background = '#fff5f7'; }, 2000);
            }
        }, 100);
    }
}

// Render restaurants
function renderRestaurants() {
    const container = document.getElementById('restaurant-list');
    if (!container) return;

    container.innerHTML = '';

    console.log('Rendering restaurants. Total:', restaurantData.length);

    if (restaurantData.length === 0) {
        container.innerHTML = '<p style="padding: 20px; text-align: center;">No restaurants loaded</p>';
        return;
    }

    restaurantData.forEach((restaurant, index) => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.setAttribute('data-name', restaurant.name);
        card.setAttribute('data-index', index);
        if (selectedRestaurants.has(restaurant.name)) {
            card.classList.add('selected');
        }

        const selectedDay = localStorage.getItem(`rest-${restaurant.name}`) || restaurant.bestDay;
        card.setAttribute('data-day', selectedDay.toLowerCase().replace(/\s/g, ''));

        card.innerHTML = `
            <div class="item-header">
                <input type="checkbox" class="select-checkbox" data-name="${restaurant.name}" ${selectedRestaurants.has(restaurant.name) ? 'checked' : ''}>
                <h3>${restaurant.name}</h3>
                <button class="delete-btn" onclick="deleteRestaurant(${index})">×</button>
            </div>
            <div class="date-selector">
                <label>Date:</label>
                <select class="date-select" onchange="updateRestaurantDate('${restaurant.name}', this.value)">
                    <option value="Feb 10" ${selectedDay === 'Feb 10' ? 'selected' : ''}>Feb 10 (Arrival)</option>
                    <option value="Feb 11" ${selectedDay === 'Feb 11' ? 'selected' : ''}>Feb 11 (Main)</option>
                    <option value="Feb 12" ${selectedDay === 'Feb 12' ? 'selected' : ''}>Feb 12 (Flexible)</option>
                    <option value="Either" ${selectedDay === 'Either' ? 'selected' : ''}>Either</option>
                </select>
            </div>
            <span class="category">${restaurant.category}</span>
            <div class="details">
                <span>📍 ${restaurant.area}</span>
                <span>🚶 ${restaurant.distance || 'N/A'}</span>
            </div>
            <div class="description">${restaurant.description}</div>
            <div class="rating">${restaurant.rating}</div>
            ${restaurant.link ? `<div class="links">
                <a href="${restaurant.link}" target="_blank">${restaurant.platform || 'Link'}</a>
                <a href="#" onclick="focusOnMap(${restaurant.lat}, ${restaurant.lng}); return false;">Show on Map</a>
            </div>` : ''}
        `;

        const checkbox = card.querySelector('.select-checkbox');
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedRestaurants.add(restaurant.name);
                card.classList.add('selected');
            } else {
                selectedRestaurants.delete(restaurant.name);
                card.classList.remove('selected');
            }
            saveSelections();
            addAllMarkers();
        });

        container.appendChild(card);
    });
}

// Render cafes
function renderCafes() {
    const container = document.getElementById('cafe-list');
    if (!container) return;

    container.innerHTML = '';

    console.log('Rendering cafes. Total cafes:', cafeData.length);

    if (cafeData.length === 0) {
        container.innerHTML = '<p style="padding: 20px; text-align: center;">No cafes loaded</p>';
        return;
    }

    cafeData.forEach((cafe, index) => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.setAttribute('data-name', cafe.name);
        card.setAttribute('data-index', index);
        if (selectedCafes.has(cafe.name)) {
            card.classList.add('selected');
        }

        const selectedDay = localStorage.getItem(`cafe-${cafe.name}`) || cafe.bestDay;
        card.setAttribute('data-day', selectedDay.toLowerCase().replace(/\s/g, ''));

        card.innerHTML = `
            <div class="item-header">
                <input type="checkbox" class="select-checkbox" data-name="${cafe.name}" ${selectedCafes.has(cafe.name) ? 'checked' : ''}>
                <h3>${cafe.name}</h3>
                <button class="delete-btn" onclick="deleteCafe(${index})">×</button>
            </div>
            <div class="date-selector">
                <label>Date:</label>
                <select class="date-select" onchange="updateCafeDate('${cafe.name}', this.value)">
                    <option value="Feb 10" ${selectedDay === 'Feb 10' ? 'selected' : ''}>Feb 10 (Arrival)</option>
                    <option value="Feb 11" ${selectedDay === 'Feb 11' ? 'selected' : ''}>Feb 11 (Main)</option>
                    <option value="Feb 12" ${selectedDay === 'Feb 12' ? 'selected' : ''}>Feb 12 (Flexible)</option>
                    <option value="Either" ${selectedDay === 'Either' ? 'selected' : ''}>Either</option>
                </select>
            </div>
            <span class="category">${cafe.category}</span>
            <div class="details">
                <span>📍 ${cafe.area}</span>
                <span>🚶 ${cafe.distance || 'N/A'}</span>
            </div>
            <div class="description">${cafe.description}</div>
            <div class="rating">${cafe.rating}</div>
            ${cafe.link ? `<div class="links">
                <a href="${cafe.link}" target="_blank">${cafe.platform || 'Link'}</a>
                <a href="#" onclick="focusOnMap(${cafe.lat}, ${cafe.lng}); return false;">Show on Map</a>
            </div>` : ''}
        `;

        const checkbox = card.querySelector('.select-checkbox');
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedCafes.add(cafe.name);
                card.classList.add('selected');
            } else {
                selectedCafes.delete(cafe.name);
                card.classList.remove('selected');
            }
            saveSelections();
            addAllMarkers();
        });

        container.appendChild(card);
    });
}

// Render route plan
function renderRoutePlan() {
    const container = document.getElementById('route-content');
    if (!container) return;

    container.innerHTML = '';

    if (!routePlans || Object.keys(routePlans).length === 0) {
        container.innerHTML = '<p>No route plans available</p>';
        return;
    }

    Object.keys(routePlans).forEach(day => {
        const plan = routePlans[day];
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day-route';

        let itemsHTML = '';
        if (plan.activities && plan.activities.length > 0) {
            plan.activities.forEach(item => {
                itemsHTML += `
                    <div class="route-item">
                        <div class="route-time">${item.time}</div>
                        <div class="route-details">
                            <strong>${item.name}</strong>
                            <p>${item.description}</p>
                        </div>
                    </div>
                `;
            });
        }

        dayDiv.innerHTML = `
            <h4>${plan.title}</h4>
            ${itemsHTML}
        `;

        container.appendChild(dayDiv);
    });
}

// Focus on map location
function focusOnMap(lat, lng) {
    if (!map) return;
    map.setView([lat, lng], 16);
}

// Save selections to localStorage
function saveSelections() {
    const selections = {
        restaurants: Array.from(selectedRestaurants),
        cafes: Array.from(selectedCafes)
    };
    localStorage.setItem('seoulItinerary', JSON.stringify(selections));
    updateCounters();
}

// Update selection counters
function updateCounters() {
    const restCount = document.getElementById('restaurant-count');
    const cafeCount = document.getElementById('cafe-count');

    if (restCount) restCount.textContent = selectedRestaurants.size;
    if (cafeCount) cafeCount.textContent = selectedCafes.size;
}

// Load selections from localStorage
function loadSelections() {
    const saved = localStorage.getItem('seoulItinerary');
    if (saved) {
        try {
            const selections = JSON.parse(saved);
            if (selections.restaurants) selectedRestaurants = new Set(selections.restaurants);
            if (selections.cafes) selectedCafes = new Set(selections.cafes);

            // Backwards compatibility
            if (selections.activities && !selections.cafes) {
                console.log('Detected old activities data, ignoring.');
            }
        } catch (e) {
            console.error("Error loading selections:", e);
        }
    } else {
        // Select all by default if nothing saved
        restaurantData.forEach(r => selectedRestaurants.add(r.name));
        cafeData.forEach(c => selectedCafes.add(c.name));
    }
}

// Share itinerary
function shareItinerary() {
    const selected = {
        restaurants: Array.from(selectedRestaurants),
        cafes: Array.from(selectedCafes)
    };

    const shareText = `🗺️ Seoul Romantic Date Itinerary (Feb 10-12, 2026)
    
Selected Restaurants (${selected.restaurants.length}):
${selected.restaurants.map(r => `• ${r}`).join('\n')}

Selected Cafes (${selected.cafes.length}):
${selected.cafes.map(a => `• ${a}`).join('\n')}

Check it out: ${window.location.href}`;

    if (navigator.share) {
        navigator.share({
            title: 'Seoul Date Itinerary',
            text: shareText
        });
    } else {
        navigator.clipboard.writeText(shareText);
        alert('✓ Itinerary copied to clipboard!\n\n' + shareText.substring(0, 100) + '...');
    }
}

// Download plan as text
function downloadPlan() {
    const selected = {
        restaurants: restaurantData.filter(r => selectedRestaurants.has(r.name)),
        cafes: cafeData.filter(a => selectedCafes.has(a.name))
    };

    let content = `SEOUL ROMANTIC DATE ITINERARY
Feb 10-12, 2026
Orakai Insadong Suites

======================================
SELECTED RESTAURANTS (${selected.restaurants.length})
======================================\n\n`;

    selected.restaurants.forEach((r, i) => {
        const day = localStorage.getItem(`rest-${r.name}`) || r.bestDay;
        content += `${i + 1}. ${r.name}
   Category: ${r.category}
   Area: ${r.area}
   Distance: ${r.distance}
   Date: ${day}
   Rating: ${r.rating}
   Description: ${r.description}
   Link: ${r.link}\n\n`;
    });

    content += `\n======================================
SELECTED CAFES (${selected.cafes.length})
======================================\n\n`;

    selected.cafes.forEach((a, i) => {
        const day = localStorage.getItem(`cafe-${a.name}`) || a.bestDay;
        content += `${i + 1}. ${a.name}
   Category: ${a.category}
   Area: ${a.area}
   Distance: ${a.distance}
   Date: ${day}
   Rating: ${a.rating}
   Description: ${a.description}
   Link: ${a.link}\n\n`;
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'seoul-itinerary-' + new Date().toISOString().slice(0, 10) + '.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Update restaurant date
function updateRestaurantDate(name, date) {
    localStorage.setItem(`rest-${name}`, date);
    renderRestaurants(); // Re-render to update data attributes
}

// Update cafe date
function updateCafeDate(name, date) {
    localStorage.setItem(`cafe-${name}`, date);
    renderCafes(); // Re-render to update data attributes
}

// Toggle edit mode
function toggleEditMode() {
    editMode = !editMode;
    const btn = document.querySelector('.edit-mode-btn');
    const addBtns = document.querySelectorAll('.add-btn');
    const body = document.body;

    if (editMode) {
        btn.classList.add('active');
        btn.textContent = '✓ Edit Mode ON';
        body.classList.add('edit-mode');
        if (addBtns) addBtns.forEach(btn => btn.style.display = 'block');
    } else {
        btn.classList.remove('active');
        btn.textContent = '✏️ Edit Mode';
        body.classList.remove('edit-mode');
        if (addBtns) addBtns.forEach(btn => btn.style.display = 'none');
    }
}

// Show add restaurant form
function showAddRestaurantForm() {
    const title = document.getElementById('modal-title');
    const type = document.getElementById('item-type');
    const form = document.getElementById('add-form');
    const modal = document.getElementById('add-modal');

    if (title) title.textContent = 'Add New Restaurant';
    if (type) type.value = 'restaurant';
    if (form) form.reset();
    if (modal) modal.classList.add('show');
}

// Show add cafe form
function showAddCafeForm() {
    const title = document.getElementById('modal-title');
    const type = document.getElementById('item-type');
    const form = document.getElementById('add-form');
    const modal = document.getElementById('add-modal');

    if (title) title.textContent = 'Add New Cafe';
    if (type) type.value = 'cafe';
    if (form) form.reset();
    if (modal) modal.classList.add('show');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('add-modal');
    if (modal) modal.classList.remove('show');
}

// Delete restaurant
function deleteRestaurant(index) {
    if (confirm('Delete this restaurant?')) {
        restaurantData.splice(index, 1);
        renderRestaurants();
        addAllMarkers();
        applyFilter(currentFilter);
    }
}

// Delete cafe
function deleteCafe(index) {
    if (confirm('Delete this cafe?')) {
        cafeData.splice(index, 1);
        renderCafes();
        addAllMarkers();
        applyFilter(currentFilter);
    }
}

// Filter functionality
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            currentFilter = filter;
            applyFilter(filter);
        });
    });
}

// Apply filter
function applyFilter(filter) {
    const allCards = document.querySelectorAll('.item-card');

    allCards.forEach(card => {
        const day = card.getAttribute('data-day');
        const isRestaurant = card.closest('#restaurant-list') !== null;

        let show = false;

        if (filter === 'all') {
            show = true;
        } else if (filter === 'restaurants') {
            show = isRestaurant;
        } else if (filter === 'cafes') {
            show = !isRestaurant; // Assuming only restaurants and cafes exist
        } else if (filter.startsWith('feb')) {
            // Check matches based on day
            show = (day === filter);
        }

        card.style.display = show ? 'block' : 'none';
    });

    // Filter markers
    markers.forEach(({ marker, data, type }) => {
        const selectedDay = (type === 'restaurant'
            ? (localStorage.getItem(`rest-${data.name}`) || data.bestDay)
            : (localStorage.getItem(`cafe-${data.name}`) || data.bestDay));

        const day = selectedDay.toLowerCase().replace(/\s/g, '');

        let show = false;
        if (filter === 'all') {
            show = true;
        } else if (filter === 'restaurants') {
            show = (type === 'restaurant');
        } else if (filter === 'cafes') {
            show = (type === 'cafe');
        } else if (filter.startsWith('feb')) {
            show = (day === filter);
        }

        if (show) {
            marker.addTo(map);
        } else {
            marker.remove();
        }
    });
}

// Tab functionality
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tabName = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            const target = document.getElementById(`${tabName}-tab`);
            if (target) target.classList.add('active');
        });
    });
}

// Search functionality
function setupSearch() {
    const restaurantSearch = document.getElementById('restaurant-search');
    const cafeSearch = document.getElementById('cafe-search');

    if (restaurantSearch) {
        restaurantSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('#restaurant-list .item-card');
            cards.forEach(card => card.style.display = (card.innerText.toLowerCase().includes(query) ? 'block' : 'none'));
        });
    }

    if (cafeSearch) {
        cafeSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('#cafe-list .item-card');
            cards.forEach(card => card.style.display = (card.innerText.toLowerCase().includes(query) ? 'block' : 'none'));
        });
    }
}

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const type = document.getElementById('item-type').value;
            const newItem = {
                name: document.getElementById('item-name').value,
                category: document.getElementById('item-category').value,
                area: document.getElementById('item-area').value,
                bestDay: document.getElementById('item-day').value,
                description: document.getElementById('item-description').value,
                rating: document.getElementById('item-rating').value || 'N/A',
                link: document.getElementById('item-link').value || '',
                lat: ORAKAI_LOCATION.lat + (Math.random() - 0.5) * 0.01,
                lng: ORAKAI_LOCATION.lng + (Math.random() - 0.5) * 0.01,
                distance: 'Calculating...',
                platform: 'User Added'
            };

            if (type === 'restaurant') {
                newItem.type = 'restaurant';
                restaurantData.push(newItem);
                renderRestaurants();
            } else {
                newItem.type = 'cafe';
                cafeData.push(newItem);
                renderCafes();
            }

            addAllMarkers();
            applyFilter(currentFilter);
            closeModal();
        });
    }
});

// Initialize everything
function init() {
    // Load data from data.js
    if (typeof restaurants !== 'undefined') restaurantData = [...restaurants];
    if (typeof cafes !== 'undefined') cafeData = [...cafes];

    // Load previously selected items
    loadSelections();

    // Initialize map
    initMap();

    // Render content
    renderRestaurants();
    renderCafes();
    renderRoutePlan();

    // Setup interactions
    setupFilters();
    setupTabs();
    setupSearch();

    // Update initial counters
    updateCounters();
}

// Run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
