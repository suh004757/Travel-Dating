// Global variables
let map;
let markers = [];
let currentFilter = 'all';
let editMode = false;
let restaurantData = [];
let activityData = [];
let selectedRestaurants = new Set();
let selectedActivities = new Set();

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

    // Add activity markers - only if selected
    activityData.forEach(activity => {
        if (!selectedActivities.has(activity.name)) return;

        const icon = L.divIcon({
            html: '<div style="background:#ffa07a;color:white;padding:6px 10px;border-radius:15px;font-size:0.85rem;font-weight:600;box-shadow:0 2px 4px rgba(0,0,0,0.3);white-space:nowrap;">🗺️ ' + activity.name.split('(')[0].trim() + '</div>',
            className: 'custom-marker',
            iconSize: [200, 30],
            iconAnchor: [100, 30]
        });

        const marker = L.marker([activity.lat, activity.lng], { icon: icon })
            .addTo(map)
            .bindPopup(`<b>${activity.name}</b><br>${activity.type}<br>${activity.description.substring(0, 100)}...`);

        marker.on('click', () => {
            showItemDetails(activity, 'activity');
        });

        markers.push({ marker, data: activity, type: 'activity' });
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
        document.querySelector('[data-tab="activities"]').click();
        setTimeout(() => {
            const card = document.querySelector(`#activity-list [data-name="${item.name}"]`);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                card.style.background = '#ffe8f0';
                setTimeout(() => { card.style.background = '#fff5f7'; }, 2000);
            }
        }, 100);
    }
}

// Render restaurants
function renderRestaurants() {
    const container = document.getElementById('restaurant-list');
    container.innerHTML = '';

    // Group by day
    const days = ['Feb 10', 'Feb 11', 'Feb 12', 'Either'];
    
    days.forEach(day => {
        const dayRestaurants = restaurantData.filter(r => r.bestDay === day);
        if (dayRestaurants.length === 0) return;

        const daySection = document.createElement('div');
        daySection.className = 'day-section';
        daySection.innerHTML = `<h4>${day}</h4>`;

        dayRestaurants.forEach((restaurant, index) => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.setAttribute('data-name', restaurant.name);
            card.setAttribute('data-day', restaurant.bestDay.toLowerCase().replace(/\s/g, ''));
            card.setAttribute('data-index', index);
            if (selectedRestaurants.has(restaurant.name)) {
                card.classList.add('selected');
            }

            card.innerHTML = `
                <div class="item-header">
                    <input type="checkbox" class="select-checkbox" data-name="${restaurant.name}" ${selectedRestaurants.has(restaurant.name) ? 'checked' : ''}>
                    <h3>${restaurant.name}</h3>
                    <button class="delete-btn" onclick="deleteRestaurant(${index})">×</button>
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

            daySection.appendChild(card);
        });

        container.appendChild(daySection);
    });
}

// Render activities
function renderActivities() {
    const container = document.getElementById('activity-list');
    container.innerHTML = '';

    console.log('Rendering activities. Total activities:', activityData.length);

    if (activityData.length === 0) {
        container.innerHTML = '<p style="padding: 20px; text-align: center;">No activities loaded</p>';
        return;
    }

    // Group by day
    const days = ['Feb 10', 'Feb 11', 'Feb 12', 'Either'];
    
    let totalRendered = 0;
    days.forEach(day => {
        const dayActivities = activityData.filter(a => a.bestDay === day);
        console.log(`Day ${day}: ${dayActivities.length} activities`);
        
        if (dayActivities.length === 0) return;

        const daySection = document.createElement('div');
        daySection.className = 'day-section';
        daySection.innerHTML = `<h4>${day}</h4>`;

        dayActivities.forEach((activity, index) => {
            totalRendered++;
            const card = document.createElement('div');
            card.className = 'item-card';
            card.setAttribute('data-name', activity.name);
            card.setAttribute('data-day', activity.bestDay.toLowerCase().replace(/\s/g, ''));
            card.setAttribute('data-index', index);
            if (selectedActivities.has(activity.name)) {
                card.classList.add('selected');
            }

            card.innerHTML = `
                <div class="item-header">
                    <input type="checkbox" class="select-checkbox" data-name="${activity.name}" ${selectedActivities.has(activity.name) ? 'checked' : ''}>
                    <h3>${activity.name}</h3>
                    <button class="delete-btn" onclick="deleteActivity(${index})">×</button>
                </div>
                <span class="category">${activity.type}</span>
                <div class="details">
                    <span>📍 ${activity.area}</span>
                    <span>⏱️ ${activity.duration || 'N/A'}</span>
                    ${activity.bestTime ? `<span>🕐 ${activity.bestTime}</span>` : ''}
                </div>
                <div class="description">${activity.description}</div>
                <div class="rating">${activity.rating}</div>
                ${activity.link ? `<div class="links">
                    <a href="${activity.link}" target="_blank">Google Maps</a>
                    <a href="#" onclick="focusOnMap(${activity.lat}, ${activity.lng}); return false;">Show on Map</a>
                </div>` : ''}
            `;

            const checkbox = card.querySelector('.select-checkbox');
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    selectedActivities.add(activity.name);
                    card.classList.add('selected');
                } else {
                    selectedActivities.delete(activity.name);
                    card.classList.remove('selected');
                }
                saveSelections();
                addAllMarkers();
            });

            daySection.appendChild(card);
        });

        container.appendChild(daySection);
    });
    
    console.log('Total activities rendered:', totalRendered);
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
        if (plan.items && plan.items.length > 0) {
            plan.items.forEach(item => {
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
        activities: Array.from(selectedActivities)
    };
    localStorage.setItem('seoulItinerary', JSON.stringify(selections));
    updateCounters();
}

// Update selection counters
function updateCounters() {
    document.getElementById('restaurant-count').textContent = selectedRestaurants.size;
    document.getElementById('activity-count').textContent = selectedActivities.size;
}

// Load selections from localStorage
function loadSelections() {
    const saved = localStorage.getItem('seoulItinerary');
    if (saved) {
        const selections = JSON.parse(saved);
        selectedRestaurants = new Set(selections.restaurants);
        selectedActivities = new Set(selections.activities);
    }
}

// Share itinerary
function shareItinerary() {
    const selected = {
        restaurants: Array.from(selectedRestaurants),
        activities: Array.from(selectedActivities)
    };
    
    const shareText = `🗺️ Seoul Romantic Date Itinerary (Feb 10-12, 2026)
    
Selected Restaurants (${selected.restaurants.length}):
${selected.restaurants.map(r => `• ${r}`).join('\n')}

Selected Activities (${selected.activities.length}):
${selected.activities.map(a => `• ${a}`).join('\n')}

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
        activities: activityData.filter(a => selectedActivities.has(a.name))
    };
    
    let content = `SEOUL ROMANTIC DATE ITINERARY
Feb 10-12, 2026
Orakai Insadong Suites

======================================
SELECTED RESTAURANTS (${selected.restaurants.length})
======================================\n\n`;

    selected.restaurants.forEach((r, i) => {
        content += `${i + 1}. ${r.name}
   Category: ${r.category}
   Area: ${r.area}
   Distance: ${r.distance}
   Best Day: ${r.bestDay}
   Rating: ${r.rating}
   Description: ${r.description}
   Link: ${r.link}\n\n`;
    });

    content += `\n======================================
SELECTED ACTIVITIES (${selected.activities.length})
======================================\n\n`;

    selected.activities.forEach((a, i) => {
        content += `${i + 1}. ${a.name}
   Type: ${a.type}
   Area: ${a.area}
   Duration: ${a.duration}
   Best Day: ${a.bestDay}
   Best Time: ${a.bestTime}
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

// Show add activity form
function showAddActivityForm() {
    document.getElementById('modal-title').textContent = 'Add New Activity';
    document.getElementById('item-type').value = 'activity';
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

// Delete activity
function deleteActivity(index) {
    if (confirm('Delete this activity?')) {
        activityData.splice(index, 1);
        renderActivities();
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
                lng: ORAKAI_LOCATION.lng + (Math.random() - 0.5) * 0.01
            };

            if (type === 'restaurant') {
                newItem.distance = '5 min walk';
                newItem.platform = 'Google Maps';
                newItem.type = 'restaurant';
                restaurantData.push(newItem);
                renderRestaurants();
            } else {
                newItem.duration = '30 min';
                newItem.bestTime = 'Day';
                newItem.activityType = 'activity';
                activityData.push(newItem);
                renderActivities();
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
        const day = card.getAttribute('data-day');
        const isRestaurant = card.closest('#restaurant-list') !== null;

        let show = false;

        if (filter === 'all') {
            show = true;
        } else if (filter === 'restaurants') {
            show = isRestaurant;
        } else if (filter === 'activities') {
            show = !isRestaurant;
        } else if (filter.startsWith('feb')) {
            show = day === filter;
        }

        card.style.display = show ? 'block' : 'none';
    });

    // Filter markers
    markers.forEach(({ marker, data, type }) => {
        const day = data.bestDay.toLowerCase().replace(/\s/g, '');
        let show = false;

        if (filter === 'all') {
            show = true;
        } else if (filter === 'restaurants') {
            show = type === 'restaurant';
        } else if (filter === 'activities') {
            show = type === 'activity';
        } else if (filter.startsWith('feb')) {
            show = day === filter;
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
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

// Search functionality
function setupSearch() {
    const restaurantSearch = document.getElementById('restaurant-search');
    const activitySearch = document.getElementById('activity-search');

    if (restaurantSearch) {
        restaurantSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('#restaurant-list .item-card');

            cards.forEach(card => {
                const name = card.querySelector('h3').textContent.toLowerCase();
                const description = card.querySelector('.description').textContent.toLowerCase();

                if (name.includes(query) || description.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    if (activitySearch) {
        activitySearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('#activity-list .item-card');

            cards.forEach(card => {
                const name = card.querySelector('h3').textContent.toLowerCase();
                const description = card.querySelector('.description').textContent.toLowerCase();

                if (name.includes(query) || description.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
}

// Initialize everything
function init() {
    // Load data from data.js
    restaurantData = [...restaurants];
    activityData = [...activities];

    // Load previously selected items
    loadSelections();

    // Initialize map
    initMap();

    // Render content
    renderRestaurants();
    renderActivities();
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
