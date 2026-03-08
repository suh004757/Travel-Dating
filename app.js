// DateScape - Memory dashboard for a single trip

let map;
let markers = [];
let currentTrip = null;
let currentPlaces = [];
let currentPlaceTypeFilter = 'all';
let currentPlaceSort = 'review-status';
let currentReviewSnapshot = {
    reviewCounts: {},
    reviewedPlaceIds: [],
    totalReviews: 0,
    averageRating: null,
    lastReviewAt: null,
    placeStats: {}
};
let supabaseClient;
const SUMMARY_SEPARATOR = ' | ';

const utils = window.DateScapeUtils || {};
const escapeHtml = utils.escapeHtml || ((value) => String(value ?? ''));
const sanitizeExternalUrl = utils.sanitizeExternalUrl || ((value) => String(value ?? ''));
const formatDate = utils.formatDate || ((value, locale = 'ko-KR', options) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(locale, options);
});

const { createClient } = supabase;
window.supabaseClient = window.supabaseClient || createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
supabaseClient = window.supabaseClient;

async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('plan') || 'daejeon_feb_2026';

    try {
        bindOverviewFilterActions();
        bindPlaceSortControl();
        bindJumpToUnreviewedAction();
        bindAuthSync();
        bindMobileWorkspaceSwitches();
        await loadDateRecord(slug);
        await showAddPlaceButton();
    } catch (error) {
        showError('Failed to load date record: ' + error.message);
    }
}

async function showAddPlaceButton() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    const btn = document.getElementById('add-place-btn');
    if (btn) {
        btn.style.display = user ? 'inline-flex' : 'none';
    }
}

function bindAuthSync() {
    if (window.__dateScapeAuthSyncBound) return;
    window.__dateScapeAuthSyncBound = true;
    window.addEventListener('auth-state-changed', async () => {
        await showAddPlaceButton();
        if (currentPlaces.length > 0 && typeof loadPlaceReviewsForPlaces === 'function') {
            await loadPlaceReviewsForPlaces(currentPlaces);
        }
    });
}

function setMobileWorkspaceMode(mode) {
    const workspace = document.querySelector('.review-workspace');
    const tabs = document.querySelector('.mobile-workspace-tabs');
    if (!workspace) return;

    const validModes = ['overview', 'places', 'map'];
    const nextMode = validModes.includes(mode) ? mode : 'overview';
    const isMobileMode = workspace.classList.contains('mobile-mode');
    const sections = {
        overview: workspace.querySelector('[data-mobile-section="overview"]'),
        places: workspace.querySelector('[data-mobile-section="places"]'),
        map: workspace.querySelector('[data-mobile-section="map"]')
    };

    if (tabs) {
        tabs.querySelectorAll('.mobile-workspace-tab').forEach((button) => {
            const isActive = button.dataset.mobileView === nextMode;
            const targetSection = sections[button.dataset.mobileView];
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-selected', isActive ? 'true' : 'false');
            button.setAttribute('tabindex', isActive ? '0' : '-1');
            if (targetSection) {
                button.setAttribute('aria-controls', targetSection.id || '');
            }
        });
    }

    Object.entries(sections).forEach(([sectionMode, section]) => {
        if (!section) return;
        section.classList.toggle('is-visible', sectionMode === nextMode);
        section.setAttribute('aria-hidden', String(sectionMode !== nextMode));
        if (sectionMode === nextMode) {
            section.removeAttribute('hidden');
        } else {
            section.setAttribute('hidden', '');
        }
    });

    workspace.dataset.mobileMode = nextMode;
    window.__dateScapeMobileViewMode = nextMode;

    const backToOverview = document.getElementById('mobile-back-to-overview-btn');
    const showMapButton = document.getElementById('mobile-show-map-btn');
    const showOverviewButton = document.getElementById('mobile-show-overview-btn');
    if (backToOverview) {
        backToOverview.hidden = nextMode !== 'map' || !isMobileMode;
    }
    if (showMapButton) {
        showMapButton.hidden = nextMode !== 'places' || !isMobileMode;
    }
    if (showOverviewButton) {
        showOverviewButton.hidden = nextMode !== 'places' || !isMobileMode;
    }

    if (nextMode === 'map' && map && typeof map.invalidateSize === 'function') {
        setTimeout(() => map.invalidateSize(), 80);
    }
}

function bindMobileWorkspaceSwitches() {
    const tabs = document.querySelector('.mobile-workspace-tabs');
    const toggleButtons = document.querySelectorAll('[data-mobile-view]');
    if (window.__dateScapeMobileWorkspaceBound) return;
    window.__dateScapeMobileWorkspaceBound = true;

    if (tabs) {
        tabs.addEventListener('click', (event) => {
            const button = event.target.closest('.mobile-workspace-tab');
            if (!button) return;
            setMobileWorkspaceMode(button.dataset.mobileView);
        });
    }

    toggleButtons.forEach((button) => {
        button.addEventListener('click', () => {
            setMobileWorkspaceMode(button.dataset.mobileView);
        });
    });

    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const applyResponsiveMode = () => {
        const workspace = document.querySelector('.review-workspace');
        if (!workspace) return;

        if (!mediaQuery.matches) {
            workspace.classList.remove('mobile-mode');
            workspace.removeAttribute('data-mobile-mode');
            workspace.querySelectorAll('[data-mobile-section]').forEach((section) => {
                section.classList.remove('is-visible');
                section.removeAttribute('hidden');
                section.removeAttribute('aria-hidden');
            });
            if (tabs) tabs.hidden = true;
            return;
        }

        workspace.classList.add('mobile-mode');
        if (tabs) tabs.hidden = false;
        setMobileWorkspaceMode(window.__dateScapeMobileViewMode || 'overview');
    };

    applyResponsiveMode();
    mediaQuery.addEventListener('change', applyResponsiveMode);
}

window.addEventListener('reviews:stats-updated', (event) => {
    const detail = event?.detail || {};
    const scopePlaceIds = Array.isArray(detail.scopePlaceIds) ? detail.scopePlaceIds.map(String) : [];
    const isFullSnapshot = currentPlaces.length === 0 || scopePlaceIds.length === 0 || scopePlaceIds.length >= currentPlaces.length;

    if (isFullSnapshot) {
        currentReviewSnapshot = Object.assign({
            reviewCounts: {},
            reviewedPlaceIds: [],
            totalReviews: 0,
            averageRating: null,
            lastReviewAt: null,
            placeStats: {}
        }, detail);
    } else {
        currentReviewSnapshot = Object.assign({}, currentReviewSnapshot, {
            reviewCounts: Object.assign({}, currentReviewSnapshot.reviewCounts || {}, detail.reviewCounts || {}),
            placeStats: Object.assign({}, currentReviewSnapshot.placeStats || {}, detail.placeStats || {})
        });
    }

    decoratePlaceCards();
    setupPlaceOverview(currentPlaces, currentReviewSnapshot);
    renderTripSummary(currentPlaces, currentReviewSnapshot);
    renderTripInsights(currentPlaces, currentReviewSnapshot);
    renderHighlights(currentPlaces, currentReviewSnapshot.placeStats || {});
    applyPlaceSorting();
    applyPlaceTypeFilter(currentPlaceTypeFilter);
});

async function loadDateRecord(slug) {
    const { data: trip, error: tripError } = await supabaseClient
        .from('trips')
        .select('*')
        .eq('slug', slug)
        .single();

    if (tripError) throw tripError;
    currentTrip = trip;
    currentReviewSnapshot = {
        reviewCounts: {},
        reviewedPlaceIds: [],
        totalReviews: 0,
        averageRating: null,
        lastReviewAt: null,
        placeStats: {}
    };

    document.getElementById('page-title').textContent = `${trip.emoji || ''} ${trip.title || ''}`.trim();
    document.getElementById('page-subtitle').textContent = trip.subtitle || '';

    const startDate = trip.start_date ? formatDate(trip.start_date) : '';
    const endDate = trip.end_date ? formatDate(trip.end_date) : '';
    const datesEl = document.getElementById('page-dates');
    if (datesEl) {
        datesEl.textContent = startDate ? (endDate ? `${startDate} ~ ${endDate}` : startDate) : 'Dates to be decided';
    }

    if (typeof loadWeather === 'function') {
        loadWeather(trip).catch((error) => {
            console.error('Weather load error:', error);
        });
    }

    const { data: places, error: placesError } = await supabaseClient
        .from('places')
        .select('*')
        .eq('trip_id', trip.id)
        .order('created_at', { ascending: true });

    if (placesError) throw placesError;

    currentPlaces = Array.isArray(places) ? places : [];
    initMap(trip.base_location || {}, currentPlaces);
    renderPlaces(currentPlaces);

    if (typeof loadPlaceReviewsForPlaces === 'function' && currentPlaces.length > 0) {
        await loadPlaceReviewsForPlaces(currentPlaces);
    } else {
        setupPlaceOverview(currentPlaces, currentReviewSnapshot);
        renderTripSummary(currentPlaces, currentReviewSnapshot);
        renderTripInsights(currentPlaces, currentReviewSnapshot);
        renderHighlights(currentPlaces, {});
    }
}

function initMap(baseLocation, places) {
    if (!document.getElementById('map') || !baseLocation?.lat || !baseLocation?.lng) return;

    if (map) {
        map.remove();
        map = null;
    }

    markers = [];
    map = L.map('map').setView([baseLocation.lat, baseLocation.lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '(c) OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    const baseName = escapeHtml(baseLocation.name || 'Base');
    const baseAddress = escapeHtml(baseLocation.address || '');
    const hotelIcon = L.divIcon({
        html: `<div style="background:#ff6b9d;color:white;padding:6px 10px;border-radius:15px;font-weight:600;box-shadow:0 2px 6px rgba(0,0,0,0.3);white-space:nowrap;font-size:0.8rem;">${baseName}</div>`,
        className: 'custom-marker',
        iconSize: [200, 30],
        iconAnchor: [100, 30]
    });

    L.marker([baseLocation.lat, baseLocation.lng], { icon: hotelIcon })
        .addTo(map)
        .bindPopup(`<b>${baseName}</b><br>${baseAddress}`);

    places.forEach((place) => {
        if (!place.lat || !place.lng) return;

        const color = (place.type || '').toLowerCase() === 'restaurant' ? '#ff6b9d' : '#8b4513';
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

    const allPoints = [
        [baseLocation.lat, baseLocation.lng],
        ...places.filter((place) => place.lat && place.lng).map((place) => [place.lat, place.lng])
    ];
    if (allPoints.length > 1) {
        map.fitBounds(allPoints, { padding: [30, 30] });
    }
}

function renderPlaces(places) {
    const container = document.getElementById('places-list');
    if (!container) return;

    container.innerHTML = '';
    currentPlaces = Array.isArray(places) ? places : [];

    if (currentPlaces.length === 0) {
        container.innerHTML = '<div class="places-empty">No places recorded yet. Add the first one!</div>';
        setupPlaceOverview(currentPlaces, currentReviewSnapshot);
        renderTripSummary(currentPlaces, currentReviewSnapshot);
        renderTripInsights(currentPlaces, currentReviewSnapshot);
        renderHighlights(currentPlaces, {});
        return;
    }

    currentPlaces.forEach((place) => {
        container.appendChild(createPlaceCard(place));
    });

    decoratePlaceCards();
    setupPlaceOverview(currentPlaces, currentReviewSnapshot);
    renderTripSummary(currentPlaces, currentReviewSnapshot);
    renderTripInsights(currentPlaces, currentReviewSnapshot);
    renderHighlights(currentPlaces, currentReviewSnapshot.placeStats || {});
    applyPlaceSorting();
    applyPlaceTypeFilter(currentPlaceTypeFilter);
}

function createPlaceCard(place) {
    const card = document.createElement('article');
    card.className = 'place-card';
    card.dataset.placeType = (place.type || 'other').toLowerCase();
    card.dataset.placeId = String(place.id);
    card.dataset.originalIndex = String(currentPlaces.findIndex((item) => String(item.id) === String(place.id)));
    card.dataset.hasReviews = 'false';
    card.dataset.latestReviewAt = '';
    card.dataset.averageRating = '';

    const safeName = escapeHtml(place.name);
    const safeCategory = escapeHtml(place.category);
    const safeArea = escapeHtml(place.area);
    const safeDescription = escapeHtml(place.description);
    const safeLink = sanitizeExternalUrl(place.link);
    const typeLabel = escapeHtml((place.type || 'Place').replace(/^\w/, (char) => char.toUpperCase()));

    card.innerHTML = `
        <div class="place-memory-preview" id="place-preview-${place.id}" hidden></div>
        <div class="place-card-header">
            <div class="place-card-title-group">
                <h3 class="place-name">${safeName}</h3>
                <div class="place-chip-row">
                    ${safeCategory ? `<span class="place-category">${safeCategory}</span>` : ''}
                    <span class="place-type-chip">${typeLabel}</span>
                    <span class="place-status-badge place-status-badge--pending" id="place-status-${place.id}">No reviews yet</span>
                </div>
            </div>
        </div>
        ${safeArea ? `<div class="place-area">${safeArea}</div>` : ''}
        ${safeDescription ? `<div class="place-description">${safeDescription}</div>` : ''}
        <div class="place-review-summary" id="place-review-summary-${place.id}">Waiting for the first memory from this stop.</div>
        <div class="place-card-actions">
            ${safeLink ? `<a href="${safeLink}" target="_blank" rel="noopener noreferrer" class="place-map-link">Open map link</a>` : ''}
        </div>
        <div class="reviews-container" id="reviews-${place.id}">
            <div class="reviews-loading">Loading reviews...</div>
        </div>
    `;

    return card;
}

function decoratePlaceCards() {
    currentPlaces.forEach((place) => {
        const placeId = String(place.id);
        const card = document.querySelector(`.place-card[data-place-id="${placeId}"]`);
        if (!card) return;

        const stats = currentReviewSnapshot.placeStats?.[placeId] || {};
        const statusEl = document.getElementById(`place-status-${placeId}`);
        const summaryEl = document.getElementById(`place-review-summary-${placeId}`);
        const previewEl = document.getElementById(`place-preview-${placeId}`);
        const reviewCount = Number(stats.reviewCount) || 0;
        const averageRating = Number.isFinite(Number(stats.averageRating)) && Number(stats.averageRating) > 0
            ? Number(stats.averageRating)
            : null;
        const latestReviewLabel = stats.latestReviewAt ? formatDate(stats.latestReviewAt) : '';
        const photoCount = Number(stats.photoCount) || 0;
        const hasTextReview = Boolean(stats.hasTextReview);

        card.dataset.hasReviews = reviewCount > 0 ? 'true' : 'false';
        card.dataset.latestReviewAt = stats.latestReviewAt || '';
        card.dataset.averageRating = averageRating != null ? String(averageRating) : '';
        card.dataset.reviewCount = String(reviewCount);

        if (statusEl) {
            let statusText = 'No reviews yet';
            let statusClass = 'place-status-badge place-status-badge--pending';
            if (reviewCount > 0 && !hasTextReview) {
                statusText = 'Rating only';
                statusClass = 'place-status-badge place-status-badge--rating';
            } else if (reviewCount > 0) {
                statusText = 'Review complete';
                statusClass = 'place-status-badge place-status-badge--complete';
            }
            statusEl.className = statusClass;
            statusEl.textContent = statusText;
        }

        if (summaryEl) {
            if (reviewCount === 0) {
                summaryEl.textContent = 'Waiting for the first memory from this stop.';
            } else {
                const parts = [`${reviewCount} review${reviewCount > 1 ? 's' : ''}`];
                if (averageRating != null) parts.push(`avg ${averageRating.toFixed(1)}/5`);
                if (latestReviewLabel) parts.push(`latest ${latestReviewLabel}`);
                if (photoCount > 0) parts.push(`${photoCount} photo${photoCount > 1 ? 's' : ''}`);
                summaryEl.textContent = parts.join(SUMMARY_SEPARATOR);
            }
        }

        if (previewEl) {
            if (stats.previewPhotoUrl) {
                previewEl.hidden = false;
                previewEl.innerHTML = `
                    <img src="${escapeHtml(stats.previewPhotoUrl)}" alt="${escapeHtml(place.name)} memory preview" loading="lazy">
                    <div class="place-memory-preview-copy">
                        <span class="place-memory-preview-label">Photo memory</span>
                        <strong>${photoCount} photo${photoCount > 1 ? 's' : ''} captured here</strong>
                    </div>
                `;
            } else {
                previewEl.hidden = true;
                previewEl.innerHTML = '';
            }
        }
    });
}

function setupPlaceOverview(places = [], stats = {}) {
    const totalEl = document.getElementById('overview-total-places');
    const totalReviewsEl = document.getElementById('overview-total-reviews');
    const restaurantEl = document.getElementById('overview-restaurant-count');
    const cafeEl = document.getElementById('overview-cafe-count');
    const reviewedEl = document.getElementById('overview-reviewed-places');
    const unreviewedEl = document.getElementById('overview-unreviewed-places');
    const avgRatingEl = document.getElementById('overview-avg-rating');
    const latestReviewEl = document.getElementById('overview-latest-review');
    const avgReviewsPerPlaceEl = document.getElementById('overview-avg-reviews-per-place');
    const placeList = Array.isArray(places) ? places : [];
    const reviewCounts = Object.assign({}, stats.reviewCounts || {});
    const reviewedPlaceIds = new Set(stats.reviewedPlaceIds || []);
    const totalReviews = Number.isFinite(stats.totalReviews)
        ? stats.totalReviews
        : Object.values(reviewCounts).reduce((acc, count) => acc + (Number(count) || 0), 0);
    const parsedAverageRating = Number.parseFloat(stats.averageRating);
    const avgRating = Number.isFinite(parsedAverageRating) && parsedAverageRating > 0
        ? parsedAverageRating
        : null;
    const latestReviewDate = stats.lastReviewAt ? new Date(stats.lastReviewAt) : null;

    const reviewedPlaces = placeList.filter((place) => {
        const placeId = place?.id != null ? String(place.id) : '';
        if (!placeId) return false;
        if (reviewedPlaceIds.size > 0) {
            return reviewedPlaceIds.has(placeId);
        }
        return (reviewCounts[placeId] || 0) > 0;
    }).length;
    const unreviewedPlaces = Math.max(placeList.length - reviewedPlaces, 0);
    const avgReviewsPerPlace = placeList.length > 0
        ? (totalReviews / placeList.length).toFixed(1)
        : '0.0';

    const restaurants = placeList.filter((place) => (place.type || '').toLowerCase() === 'restaurant').length;
    const cafes = placeList.filter((place) => (place.type || '').toLowerCase() === 'cafe').length;

    if (totalEl) totalEl.textContent = String(placeList.length);
    if (totalReviewsEl) totalReviewsEl.textContent = String(totalReviews);
    if (restaurantEl) restaurantEl.textContent = String(restaurants);
    if (cafeEl) cafeEl.textContent = String(cafes);
    if (reviewedEl) reviewedEl.textContent = String(reviewedPlaces);
    if (unreviewedEl) unreviewedEl.textContent = String(unreviewedPlaces);
    if (avgRatingEl) avgRatingEl.textContent = avgRating != null ? avgRating.toFixed(1) : '-';
    if (latestReviewEl) {
        latestReviewEl.textContent = latestReviewDate && !Number.isNaN(latestReviewDate.getTime())
            ? latestReviewDate.toLocaleDateString('ko-KR')
            : '-';
    }
    if (avgReviewsPerPlaceEl) avgReviewsPerPlaceEl.textContent = avgReviewsPerPlace;
}

function renderTripSummary(places = [], stats = {}) {
    const totalPlaces = places.length;
    const reviewedPlaces = Array.isArray(stats.reviewedPlaceIds) ? stats.reviewedPlaceIds.length : 0;
    const completion = totalPlaces > 0 ? Math.round((reviewedPlaces / totalPlaces) * 100) : 0;
    const avgRating = Number.isFinite(Number(stats.averageRating)) && Number(stats.averageRating) > 0
        ? Number(stats.averageRating).toFixed(1)
        : '-';
    const latestReview = stats.lastReviewAt ? formatDate(stats.lastReviewAt) : '-';

    const titleEl = document.getElementById('trip-summary-title');
    const textEl = document.getElementById('trip-summary-text');
    const completionEl = document.getElementById('summary-completion-rate');
    const totalPlacesEl = document.getElementById('summary-total-places');
    const avgRatingEl = document.getElementById('summary-average-rating');
    const latestReviewEl = document.getElementById('summary-latest-review');

    const restaurants = places.filter((place) => (place.type || '').toLowerCase() === 'restaurant').length;
    const cafes = places.filter((place) => (place.type || '').toLowerCase() === 'cafe').length;
    const mood = buildTripMoodSummary({
        totalPlaces,
        reviewedPlaces,
        avgRating: avgRating === '-' ? null : Number(avgRating),
        restaurants,
        cafes
    });

    if (titleEl) {
        titleEl.textContent = totalPlaces > 0
            ? `${reviewedPlaces}/${totalPlaces} places have a memory attached`
            : 'Start recording the places from this trip';
    }
    if (textEl) textEl.textContent = mood;
    if (completionEl) completionEl.textContent = `${completion}%`;
    if (totalPlacesEl) totalPlacesEl.textContent = String(totalPlaces);
    if (avgRatingEl) avgRatingEl.textContent = avgRating;
    if (latestReviewEl) latestReviewEl.textContent = latestReview || '-';
}

function renderTripInsights(places = [], stats = {}) {
    const container = document.getElementById('trip-insights');
    if (!container) return;

    const placeStats = stats.placeStats || {};
    const totalPhotos = Object.values(placeStats).reduce((sum, item) => sum + (Number(item?.photoCount) || 0), 0);
    const ratingOnlyStops = places.filter((place) => {
        const item = placeStats[String(place.id)] || {};
        return (Number(item.reviewCount) || 0) > 0 && !item.hasTextReview;
    }).length;
    const writtenMemories = places.filter((place) => {
        const item = placeStats[String(place.id)] || {};
        return Boolean(item.hasTextReview);
    }).length;

    const cards = [
        {
            label: 'Captured photos',
            value: String(totalPhotos),
            text: totalPhotos > 0
                ? `${totalPhotos} photo${totalPhotos > 1 ? 's are' : ' is'} attached across this trip.`
                : 'Photo memories will appear here once reviews include images.'
        },
        {
            label: 'Rating-only stops',
            value: String(ratingOnlyStops),
            text: ratingOnlyStops > 0
                ? `${ratingOnlyStops} stop${ratingOnlyStops > 1 ? 's still need' : ' still needs'} a written reflection.`
                : 'Every rated stop already has at least one written memory.'
        },
        {
            label: 'Written memories',
            value: String(writtenMemories),
            text: writtenMemories > 0
                ? `${writtenMemories}/${places.length || 0} place${writtenMemories > 1 ? 's carry' : ' carries'} a text review.`
                : 'No written memories yet.'
        }
    ];

    container.innerHTML = cards.map((card) => `
        <div class="trip-insight-card">
            <span class="trip-insight-label">${escapeHtml(card.label)}</span>
            <strong class="trip-insight-value">${escapeHtml(card.value)}</strong>
            <p class="trip-insight-text">${escapeHtml(card.text)}</p>
        </div>
    `).join('');
}

function buildTripMoodSummary(summary) {
    if (summary.totalPlaces === 0) {
        return 'No places have been saved yet, so this trip is still waiting for its first shared memory.';
    }

    const dominantType = summary.restaurants > summary.cafes
        ? 'food-forward'
        : (summary.cafes > summary.restaurants ? 'cafe-heavy' : 'balanced');
    const tone = summary.avgRating != null
        ? (summary.avgRating >= 4.5 ? 'a standout trip' : (summary.avgRating >= 4 ? 'a strong trip' : 'a mixed but memorable trip'))
        : 'a trip still waiting on reflections';
    const coverage = summary.reviewedPlaces === 0
        ? 'None of the stops have been reviewed yet.'
        : (summary.reviewedPlaces === summary.totalPlaces
            ? 'Every stop already has a review.'
            : `${summary.totalPlaces - summary.reviewedPlaces} stop${summary.totalPlaces - summary.reviewedPlaces > 1 ? 's are' : ' is'} still waiting for a review.`);

    const styleLine = dominantType === 'food-forward'
        ? 'The route leans more toward meals than coffee breaks.'
        : (dominantType === 'cafe-heavy'
            ? 'This one feels like a slow cafe-and-conversation day.'
            : 'The mix of cafes and restaurants feels evenly paced.');

    return `${styleLine} So far it reads as ${tone}. ${coverage}`;
}

function renderHighlights(places = [], placeStats = {}) {
    const container = document.getElementById('memory-highlights-grid');
    if (!container) return;

    const byId = Object.fromEntries(places.map((place) => [String(place.id), place]));
    const candidates = [];

    const highestRated = Object.entries(placeStats)
        .filter(([, stats]) => Number(stats.averageRating) > 0)
        .sort((a, b) => Number(b[1].averageRating) - Number(a[1].averageRating))[0];
    if (highestRated) {
        candidates.push({ type: 'Top rated', placeId: highestRated[0], stats: highestRated[1] });
    }

    const mostPhotos = Object.entries(placeStats)
        .filter(([, stats]) => Number(stats.photoCount) > 0)
        .sort((a, b) => Number(b[1].photoCount) - Number(a[1].photoCount))[0];
    if (mostPhotos) {
        candidates.push({ type: 'Photo memory', placeId: mostPhotos[0], stats: mostPhotos[1] });
    }

    const latestReview = Object.entries(placeStats)
        .filter(([, stats]) => Boolean(stats.latestReviewAt))
        .sort((a, b) => new Date(b[1].latestReviewAt) - new Date(a[1].latestReviewAt))[0];
    if (latestReview) {
        candidates.push({ type: 'Latest reflection', placeId: latestReview[0], stats: latestReview[1] });
    }

    const uniqueHighlights = [];
    const seen = new Set();
    candidates.forEach((candidate) => {
        if (!seen.has(candidate.placeId)) {
            seen.add(candidate.placeId);
            uniqueHighlights.push(candidate);
        }
    });

    if (uniqueHighlights.length === 0) {
        container.innerHTML = '<div class="memory-highlight-empty">Highlights will appear once reviews and photos are added.</div>';
        return;
    }

    container.innerHTML = uniqueHighlights.map((item) => {
        const place = byId[item.placeId];
        if (!place) return '';
        const safeTitle = escapeHtml(place.name || 'Place');
        const safeCategory = escapeHtml(place.category || place.type || 'Place');
        const stats = item.stats || {};
        const meta = [];
        if (Number(stats.averageRating) > 0) meta.push(`${Number(stats.averageRating).toFixed(1)}/5`);
        if (Number(stats.photoCount) > 0) meta.push(`${Number(stats.photoCount)} photo${Number(stats.photoCount) > 1 ? 's' : ''}`);
        if (stats.latestReviewAt) meta.push(formatDate(stats.latestReviewAt));

        return `
            <article class="memory-highlight-card">
                ${stats.previewPhotoUrl ? `<img class="memory-highlight-image" src="${escapeHtml(stats.previewPhotoUrl)}" alt="${safeTitle}" loading="lazy">` : ''}
                <div class="memory-highlight-copy">
                    <span class="memory-highlight-type">${escapeHtml(item.type)}</span>
                    <h3>${safeTitle}</h3>
                    <p>${safeCategory}</p>
                    <div class="memory-highlight-meta">${meta.join(SUMMARY_SEPARATOR) || 'Waiting for more details'}</div>
                </div>
            </article>
        `;
    }).join('');
}

function bindOverviewFilterActions() {
    const containers = document.querySelectorAll('.overview-filter-actions, .mobile-place-filters');
    if (containers.length === 0 || window.__overviewFilterActionsBound) return;
    window.__overviewFilterActionsBound = true;

    containers.forEach((container) => {
        container.addEventListener('click', (event) => {
            const button = event.target.closest('.overview-filter-btn');
            if (!button) return;
            applyPlaceTypeFilter(button.dataset.filter || 'all');
        });
    });
}

function bindPlaceSortControl() {
    const select = document.getElementById('place-sort-select');
    if (!select || window.__placeSortBound) return;
    window.__placeSortBound = true;
    select.addEventListener('change', (event) => {
        currentPlaceSort = event.target.value || 'review-status';
        applyPlaceSorting();
    });
}

function bindJumpToUnreviewedAction() {
    const button = document.getElementById('jump-unreviewed-btn');
    if (!button || window.__jumpToUnreviewedBound) return;
    window.__jumpToUnreviewedBound = true;
    button.addEventListener('click', () => {
        jumpToNextUnreviewedPlace();
    });
}

function applyPlaceTypeFilter(filter = 'all') {
    currentPlaceTypeFilter = filter;

    document.querySelectorAll('.overview-filter-btn').forEach((button) => {
        const isActive = (button.dataset.filter || 'all') === filter;
        button.classList.toggle('is-active', isActive);
    });

    const cards = document.querySelectorAll('.places-list .place-card');
    let visibleCount = 0;
    cards.forEach((card) => {
        const cardType = (card.dataset.placeType || 'other').toLowerCase();
        const hasReviews = card.dataset.hasReviews === 'true';
        const visible = filter === 'all'
            || cardType === filter
            || (filter === 'reviewed' && hasReviews)
            || (filter === 'unreviewed' && !hasReviews);
        card.style.display = visible ? '' : 'none';
        if (visible) visibleCount += 1;
    });

    const empty = document.getElementById('places-filter-empty');
    if (empty) {
        empty.hidden = visibleCount > 0;
    }

    updateNextUnreviewedAction();
}

function applyPlaceSorting() {
    const container = document.getElementById('places-list');
    if (!container) return;

    const cards = Array.from(container.querySelectorAll('.place-card'));
    cards.sort((a, b) => comparePlaceCards(a, b, currentPlaceSort));
    cards.forEach((card) => container.appendChild(card));
    updateNextUnreviewedAction();
}

function comparePlaceCards(cardA, cardB, sortKey) {
    const placeA = currentPlaces.find((place) => String(place.id) === cardA.dataset.placeId) || {};
    const placeB = currentPlaces.find((place) => String(place.id) === cardB.dataset.placeId) || {};
    const originalDiff = Number(cardA.dataset.originalIndex || 0) - Number(cardB.dataset.originalIndex || 0);
    const averageA = Number(cardA.dataset.averageRating || 0);
    const averageB = Number(cardB.dataset.averageRating || 0);
    const latestA = cardA.dataset.latestReviewAt ? new Date(cardA.dataset.latestReviewAt).getTime() : 0;
    const latestB = cardB.dataset.latestReviewAt ? new Date(cardB.dataset.latestReviewAt).getTime() : 0;
    const nameDiff = String(placeA.name || '').localeCompare(String(placeB.name || ''), 'en');

    if (sortKey === 'name') {
        return nameDiff || originalDiff;
    }

    if (sortKey === 'rating') {
        return (averageB - averageA) || nameDiff || originalDiff;
    }

    if (sortKey === 'recent') {
        return (latestB - latestA) || nameDiff || originalDiff;
    }

    const reviewedA = cardA.dataset.hasReviews === 'true' ? 1 : 0;
    const reviewedB = cardB.dataset.hasReviews === 'true' ? 1 : 0;
    return (reviewedA - reviewedB) || originalDiff;
}

function getNextRelevantUnreviewedCard() {
    const cards = Array.from(document.querySelectorAll('.places-list .place-card'));
    return cards.find((card) => {
        const isVisible = card.style.display !== 'none';
        return isVisible && card.dataset.hasReviews !== 'true';
    }) || null;
}

function updateNextUnreviewedAction() {
    const button = document.getElementById('jump-unreviewed-btn');
    if (!button) return;

    const hasAnyUnreviewed = currentPlaces.some((place) => {
        const stats = currentReviewSnapshot.placeStats?.[String(place.id)] || {};
        return (Number(stats.reviewCount) || 0) === 0;
    });
    const nextCard = getNextRelevantUnreviewedCard();

    if (!hasAnyUnreviewed || !nextCard) {
        button.hidden = true;
        return;
    }

    const placeName = nextCard.querySelector('.place-name')?.textContent?.trim() || 'next stop';
    button.hidden = false;
    button.textContent = `Jump to ${placeName}`;
}

function jumpToNextUnreviewedPlace() {
    const nextCard = getNextRelevantUnreviewedCard();
    if (!nextCard) return;

    setMobileWorkspaceMode('places');
    nextCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    nextCard.classList.remove('place-card--jump-target');
    window.requestAnimationFrame(() => {
        nextCard.classList.add('place-card--jump-target');
    });
    window.setTimeout(() => {
        nextCard.classList.remove('place-card--jump-target');
    }, 1800);
}

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
        const slug = new URLSearchParams(window.location.search).get('plan') || 'daejeon_feb_2026';
        await loadDateRecord(slug);
        await showAddPlaceButton();
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
