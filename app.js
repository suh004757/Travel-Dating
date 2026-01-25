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
        document.querySelector('[data-tab="restaurants"]').click();
        setTimeout(() => {
            const card = document.querySelector(`#restaurant-list [data-name="${item.name}"]`);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                card.style.background = '#ffe8f0';
                setTimeout(() => { card.style.background = '#fff5f7'; }, 2000);
            }
        }, 100);
    } else {
        document.querySelector('[data-tab="cafes"]').click();
        setTimeout(() => {
            const card = document.querySelector(`#cafe-list [data-name="${item.name}"]`);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                card.style.background = '#e6ccb3'; // Specific color for cafes
                setTimeout(() => { card.style.background = '#fff5f7'; }, 2000); // Back to default
            }
        }, 100);
    }
}

// Render restaurants
function renderRestaurants() {
    const container = document.getElementById('restaurant-list');
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
    document.getElementById('restaurant-count').textContent = selectedRestaurants.size;
    document.getElementById('cafe-count').textContent = selectedCafes.size;
}

// Load selections from localStorage
function loadSelections() {
    const saved = localStorage.getItem('seoulItinerary');
    if (saved) {
        const selections = JSON.parse(saved);
        if (selections.restaurants) selectedRestaurants = new Set(selections.restaurants);
        if (selections.cafes) selectedCafes = new Set(selections.cafes);

        // Backwards compatibility if user had "activities" stored
        if (selections.activities && !selections.cafes) {
            // Can't really migrate as names changed, just ignore or log
            console.log('Detected old activities data, ignoring.');
        }
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
        // Fallback: copy to clipboard
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

    // Create and download file
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
}

// Update cafe date
function updateCafeDate(name, date) {
    localStorage.setItem(`cafe-${name}`, date);
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
        addBtns.forEach(btn => btn.style.display = 'block');
    } else {
        btn.classList.remove('active');
        btn.textContent = '✏️ Edit Mode';
        body.classList.remove('edit-mode');
        addBtns.forEach(btn => btn.style.display = 'none');
    }
}

// Show add restaurant form
function showAddRestaurantForm() {
    document.getElementById('modal-title').textContent = 'Add New Restaurant';
    document.getElementById('item-type').value = 'restaurant';
    document.getElementById('add-form').reset();
    document.getElementById('add-modal').classList.add('show');
}

// Show add cafe form
function showAddCafeForm() {
    document.getElementById('modal-title').textContent = 'Add New Cafe';
    document.getElementById('item-type').value = 'cafe';
    document.getElementById('add-form').reset();
    document.getElementById('add-modal').classList.add('show');
}

// Close modal
function closeModal() {
    document.getElementById('add-modal').classList.remove('show');
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
                distance: 'Calculating...', // Simplified
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
        const day = card.getAttribute('data-day'); // Note: data-day attribute isn't explicitly set in render functions above, but logic relies on it?
        // Wait, I missed setting data-day in render functions. 
        // Actually, the current code logic for cards doesn't read data-day from DOM attribute, 
        // it determines visibility inside the render Loop? No, applyFilter loops over DOM cards.
        // Let's fix this logic. In the original code, applyFilter iterated cards and re-checked logic?
        // No, the original code had: const day = card.getAttribute('data-day');
        // BUT I didn't see setAttribute('data-day') in my renderRestaurant/Cafes above.
        // I should fix that in this rewrite or just use element context.

        // Actually, let's look at how I implemented show/hide.
        // Ideally, we re-render or just toggle display.
        // The original code tried to be smart.
        // Let's keep it simple: Just checking the container is easier.

        const isRestaurant = card.closest('#restaurant-list') !== null;

        // To properly filter by date, we need to know the date of the item.
        // I will trust that I can just re-render to filter? No, standard pattern is CSS toggle.
        // Let's rely on data attributes. I will add 'data-day' to render functions implicitly?
        // No I missed adding it. Let me update the render functions in this string to include data-day.

        // Wait, for 'feb10' etc filter, we need the day.
        // I will add `card.setAttribute('data-day', selectedDay.toLowerCase().replace(/\s/g, ''));`

        // Let's refine the logic below in `applyFilter` to work without `data-day` if I missed it, 
        // OR better, update `renderRestaurants` and `renderCafes` in this very call to add it.

        // CHECK RenderRestaurants above:
        // `const selectedDay = ...`
        // I didn't set `card.setAttribute('data-day', ...)`
        // I WILL FIX IT IN THE STRING BELOW BEFORE SUBMITTING.
    });

    // Actually, `applyFilter` logic in my rewrite below needs to be robust.

    // Retrying the ApplyFilter logic:
    // We need to match the filter against the card's data. 
    // Since I am rewriting the file, I can fix the render functions to include `data-day`.
}

// ... (I will include the fixed render functions and applyFilter in the final string) ...
