// Reviews Component
// Handles review CRUD + photo upload for places
// Public read, authenticated write

const reviewUtils = window.DateScapeUtils || {};

function escapeHtmlReview(text) {
    if (typeof reviewUtils.escapeHtml === 'function') {
        return reviewUtils.escapeHtml(text);
    }
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getUserNickname(user) {
    if (!user) return '';
    const metadata = user.user_metadata || {};
    return (
        metadata.nickname ||
        metadata.name ||
        metadata.full_name ||
        metadata.preferred_username ||
        (user.email ? user.email.split('@')[0] : '') ||
        'Member'
    );
}

function renderStars(rating) {
    let html = '<span class="star-rating">';
    for (let i = 1; i <= 5; i++) {
        html += `<span class="star ${i <= rating ? 'filled' : ''}">${i <= rating ? '\u2605' : '\u2606'}</span>`;
    }
    html += '</span>';
    return html;
}

function renderStarPicker(containerId, initialRating) {
    const rating = initialRating || 0;
    let html = `<div class="star-picker" data-container="${containerId}">`;
    for (let i = 1; i <= 5; i++) {
        html += `<span class="star-pick ${i <= rating ? 'active' : ''}" data-value="${i}" onclick="pickStar('${containerId}', ${i})">${i <= rating ? '\u2605' : '\u2606'}</span>`;
    }
    html += `<input type="hidden" id="rating-${containerId}" value="${rating}">`;
    html += '</div>';
    return html;
}

function pickStar(containerId, value) {
    const picker = document.querySelector(`.star-picker[data-container="${containerId}"]`);
    if (!picker) return;

    picker.querySelectorAll('.star-pick').forEach((star, index) => {
        const active = index < value;
        star.classList.toggle('active', active);
        star.textContent = active ? '\u2605' : '\u2606';
    });

    const input = document.getElementById(`rating-${containerId}`);
    if (input) input.value = value;
}

async function loadPlaceReviews(placeId) {
    await loadPlaceReviewsForPlaces([{ id: placeId }]);
}

async function loadPlaceReviewsForPlaces(places) {
    const placeIds = Array.isArray(places)
        ? places.map((place) => String(place.id)).filter(Boolean)
        : [];

    if (placeIds.length === 0) return;

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        const { data: reviews, error } = await supabaseClient
            .from('reviews')
            .select('*')
            .in('place_id', placeIds)
            .order('created_at', { ascending: true });

        if (error) throw error;

        const safeReviews = reviews || [];
        const placeReviews = Object.fromEntries(placeIds.map((placeId) => [placeId, []]));
        const reviewIds = safeReviews.map((review) => review.id);

        safeReviews.forEach((review) => {
            if (!placeReviews[review.place_id]) {
                placeReviews[review.place_id] = [];
            }
            placeReviews[review.place_id].push(review);
        });

        let photos = [];
        if (reviewIds.length > 0) {
            const { data: photoData, error: photoError } = await supabaseClient
                .from('review_photos')
                .select('*')
                .in('review_id', reviewIds)
                .order('created_at', { ascending: true });

            if (photoError) throw photoError;
            photos = photoData || [];
        }

        const photoMap = Object.create(null);
        photos.forEach((photo) => {
            if (!photoMap[photo.review_id]) photoMap[photo.review_id] = [];
            photoMap[photo.review_id].push(photo);
        });

        const detail = buildReviewStats(placeIds, placeReviews, photoMap);
        detail.currentUserId = user?.id || null;
        window.__placeReviewCounts = Object.assign({}, detail.reviewCounts);
        window.__placeReviewStats = Object.assign({}, detail.placeStats);

        placeIds.forEach((placeId) => {
            const container = document.getElementById(`reviews-${placeId}`);
            if (!container) return;
            container.innerHTML = buildReviewSection(placeReviews[placeId] || [], photoMap, user, placeId);
        });

        window.dispatchEvent(new CustomEvent('reviews:stats-updated', { detail }));
    } catch (error) {
        console.error('Error loading reviews in bulk:', error);
        placeIds.forEach((placeId) => {
            const container = document.getElementById(`reviews-${placeId}`);
            if (container) {
                container.innerHTML = '<div class="reviews-error">Failed to load reviews.</div>';
            }
        });
        window.dispatchEvent(new CustomEvent('reviews:stats-updated', {
            detail: {
                reviewCounts: Object.fromEntries(placeIds.map((placeId) => [placeId, 0])),
                reviewedPlaceIds: [],
                totalReviews: 0,
                averageRating: null,
                lastReviewAt: null,
                placeStats: {}
            }
        }));
    }
}

function buildReviewStats(placeIds, placeReviews, photoMap) {
    const detail = {
        reviewCounts: Object.fromEntries(placeIds.map((placeId) => [placeId, 0])),
        reviewedPlaceIds: [],
        totalReviews: 0,
        averageRating: null,
        lastReviewAt: null,
        placeStats: {}
    };

    let totalRating = 0;
    let ratedReviewCount = 0;
    let latestReviewDate = null;

    placeIds.forEach((placeId) => {
        const reviews = placeReviews[placeId] || [];
        const stat = {
            reviewCount: reviews.length,
            ratedReviewCount: 0,
            averageRating: null,
            latestReviewAt: null,
            hasTextReview: false,
            photoCount: 0,
            previewPhotoUrl: '',
            reviewedByCurrentUser: false
        };

        detail.reviewCounts[placeId] = reviews.length;
        if (reviews.length > 0) {
            detail.reviewedPlaceIds.push(placeId);
        }

        reviews.forEach((review) => {
            detail.totalReviews += 1;
            if (Number(review.rating) > 0) {
                totalRating += Number(review.rating);
                ratedReviewCount += 1;
                stat.ratedReviewCount += 1;
            }
            if (review.text) stat.hasTextReview = true;
            if (review.created_at) {
                const created = new Date(review.created_at);
                if (!latestReviewDate || created > latestReviewDate) latestReviewDate = created;
                if (!stat.latestReviewAt || created > new Date(stat.latestReviewAt)) {
                    stat.latestReviewAt = created.toISOString();
                }
            }

            const reviewPhotos = photoMap[review.id] || [];
            stat.photoCount += reviewPhotos.length;
            if (!stat.previewPhotoUrl && reviewPhotos[0]?.photo_url) {
                stat.previewPhotoUrl = reviewPhotos[0].photo_url;
            }
        });

        if (stat.ratedReviewCount > 0) {
            const placeRatingTotal = reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0);
            stat.averageRating = placeRatingTotal / stat.ratedReviewCount;
        }

        detail.placeStats[placeId] = stat;
    });

    detail.averageRating = ratedReviewCount > 0 ? totalRating / ratedReviewCount : null;
    detail.lastReviewAt = latestReviewDate ? latestReviewDate.toISOString() : null;
    return detail;
}

function buildReviewSection(reviews, photoMap, user, placeId) {
    let html = '<div class="reviews-section">';
    html += '<div class="reviews-header">Reviews</div>';

    if (reviews.length > 0) {
        html += '<div class="reviews-list">';
        const currentUserNickname = getUserNickname(user);
        reviews.forEach((review) => {
            const isOwn = Boolean(user && review.user_id === user.id);
            html += renderReviewCard(review, photoMap[review.id] || [], isOwn, placeId, currentUserNickname);
        });
        html += '</div>';
    } else {
        html += '<div class="reviews-empty">No reviews yet. Be the first to leave one!</div>';
    }

    if (user) {
        const existingReview = reviews.find((review) => review.user_id === user.id);
        html += existingReview
            ? `<button class="review-edit-btn" onclick="showReviewModal('${placeId}', true)">Edit my review</button>`
            : `<button class="review-write-btn" onclick="showReviewModal('${placeId}', false)">Write a review</button>`;
    } else {
        html += `<div class="review-login-prompt"><a href="#" onclick="showLoginModal(); return false;">Log in</a> to write a review</div>`;
    }

    html += '</div>';
    return html;
}

function renderReviewCard(review, photos, isOwn, placeId, currentUserNickname) {
    const safeText = escapeHtmlReview(review.text);
    const safeAuthorLabel = escapeHtmlReview(
        isOwn
            ? (currentUserNickname || review.author_name || 'Me')
            : (review.author_name || 'Member')
    );
    const date = review.created_at ? new Date(review.created_at).toLocaleDateString('ko-KR') : '';

    let html = `<div class="review-card ${isOwn ? 'review-own' : 'review-partner'}">`;
    html += '<div class="review-card-header">';
    html += `<span class="review-author">${safeAuthorLabel}</span>`;
    html += renderStars(review.rating || 0);
    html += `<span class="review-date">${date || '-'}</span>`;
    html += '</div>';

    if (safeText) {
        html += `<div class="review-text">${safeText}</div>`;
    }

    if (photos.length > 0) {
        html += '<div class="review-photos">';
        photos.forEach((photo) => {
            const safeUrl = escapeHtmlReview(photo.photo_url);
            const safeCaption = escapeHtmlReview(photo.caption);
            html += '<div class="review-photo-item">';
            html += `<img src="${safeUrl}" alt="${safeCaption}" loading="lazy" onclick="openPhotoViewer('${safeUrl}')">`;
            if (isOwn) {
                html += `<button class="photo-delete-btn" onclick="deleteReviewPhoto('${photo.id}', '${placeId}')" title="Delete photo">x</button>`;
            }
            html += '</div>';
        });
        html += '</div>';
    }

    html += '</div>';
    return html;
}

async function showReviewModal(placeId, isEdit) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        showLoginModal();
        return;
    }

    let existingReview = null;
    let existingPhotos = [];

    if (isEdit) {
        const { data } = await supabaseClient
            .from('reviews')
            .select('*')
            .eq('place_id', placeId)
            .eq('user_id', user.id)
            .single();
        existingReview = data;

        if (existingReview) {
            const { data: photoData } = await supabaseClient
                .from('review_photos')
                .select('*')
                .eq('review_id', existingReview.id);
            existingPhotos = photoData || [];
        }
    }

    const modal = document.createElement('div');
    modal.id = 'review-modal';
    modal.className = 'modal show';

    const existingText = existingReview ? escapeHtmlReview(existingReview.text) : '';
    const existingRating = existingReview ? existingReview.rating : 0;

    modal.innerHTML = `
        <div class="modal-content review-modal-content">
            <span class="close" onclick="closeReviewModal()">&times;</span>
            <h2>${isEdit ? 'Edit Review' : 'Write a Review'}</h2>
            <form id="reviewForm" onsubmit="submitReview(event, '${placeId}')">
                <label>Rating</label>
                ${renderStarPicker(placeId, existingRating)}

                <label>Review</label>
                <textarea id="review-text-${placeId}" rows="4" placeholder="How was this place?">${existingText}</textarea>

                <label>Photos</label>
                <div class="photo-upload-area">
                    ${existingPhotos.map((photo) => `
                        <div class="existing-photo">
                            <img src="${escapeHtmlReview(photo.photo_url)}" alt="photo">
                            <button type="button" class="photo-remove-btn" onclick="deleteReviewPhoto('${photo.id}', '${placeId}')">x</button>
                        </div>
                    `).join('')}
                    <label class="photo-upload-btn">
                        <input type="file" id="photo-input-${placeId}" accept="image/*" multiple style="display:none" onchange="previewPhotos('${placeId}', this)">
                        <span>+ Add Photos</span>
                    </label>
                </div>
                <div id="photo-preview-${placeId}" class="photo-preview-area"></div>

                <div class="modal-buttons">
                    <button type="submit" class="btn-primary">Save</button>
                    <button type="button" class="btn-secondary" onclick="closeReviewModal()">Cancel</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
}

function closeReviewModal() {
    const modal = document.getElementById('review-modal');
    if (modal) modal.remove();
}

async function previewPhotos(placeId, input) {
    const previewContainer = document.getElementById(`photo-preview-${placeId}`);
    if (!previewContainer || !input.files) return;

    previewContainer.innerHTML = '<div style="font-size:0.8rem;color:#999;">Processing photos...</div>';

    const previews = [];
    for (const file of input.files) {
        const resized = await resizeImage(file);
        previews.push({
            url: URL.createObjectURL(resized),
            name: file.name,
            sizeKB: Math.round(resized.size / 1024)
        });
    }

    previewContainer.innerHTML = '';
    previews.forEach((preview) => {
        const div = document.createElement('div');
        div.className = 'photo-preview-item';
        div.innerHTML = `
            <img src="${preview.url}" alt="preview">
            <span class="photo-name">${escapeHtmlReview(preview.name)}</span>
            <span class="photo-size">${preview.sizeKB}KB</span>
        `;
        previewContainer.appendChild(div);
    });
}

async function submitReview(event, placeId) {
    event.preventDefault();

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        showLoginModal();
        return;
    }

    const text = document.getElementById(`review-text-${placeId}`).value.trim();
    const ratingInput = document.getElementById(`rating-${placeId}`);
    const rating = ratingInput ? parseInt(ratingInput.value, 10) : 0;

    if (!text && !rating) {
        alert('Please write a review or select a rating.');
        return;
    }

    try {
        const authorName = getUserNickname(user);
        const { data: review, error } = await supabaseClient
            .from('reviews')
            .upsert({
                place_id: placeId,
                user_id: user.id,
                author_name: authorName || null,
                text: text || null,
                rating: rating || null
            }, {
                onConflict: 'place_id,user_id'
            })
            .select()
            .single();

        if (error) throw error;

        const fileInput = document.getElementById(`photo-input-${placeId}`);
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            await uploadReviewPhotos(review.id, user.id, fileInput.files);
        }

        closeReviewModal();
        const cards = Array.from(document.querySelectorAll('.place-card')).map((card) => ({ id: card.dataset.placeId })).filter((item) => item.id);
        await loadPlaceReviewsForPlaces(cards.length > 0 ? cards : [{ id: placeId }]);
    } catch (error) {
        console.error('Error saving review:', error);
        alert('Failed to save review: ' + error.message);
    }
}

function resizeImage(file, maxSize = 1200, quality = 0.7) {
    return new Promise((resolve) => {
        if (!file.type.startsWith('image/')) {
            resolve(file);
            return;
        }

        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            let { width, height } = img;
            if (width > maxSize || height > maxSize) {
                if (width > height) {
                    height = Math.round((height * maxSize) / width);
                    width = maxSize;
                } else {
                    width = Math.round((width * maxSize) / height);
                    height = maxSize;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    }));
                } else {
                    resolve(file);
                }
            }, 'image/jpeg', quality);
        };

        img.onerror = () => resolve(file);
        img.src = URL.createObjectURL(file);
    });
}

async function uploadReviewPhotos(reviewId, userId, files) {
    for (const file of files) {
        const resized = await resizeImage(file);
        const fileName = `${userId}/${reviewId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;

        const { error: uploadError } = await supabaseClient.storage
            .from('review-photos')
            .upload(fileName, resized, {
                cacheControl: '3600',
                upsert: false,
                contentType: 'image/jpeg'
            });

        if (uploadError) {
            console.error('Photo upload error:', uploadError);
            continue;
        }

        const { data: urlData } = supabaseClient.storage
            .from('review-photos')
            .getPublicUrl(fileName);

        if (urlData?.publicUrl) {
            await supabaseClient
                .from('review_photos')
                .insert({
                    review_id: reviewId,
                    photo_url: urlData.publicUrl
                });
        }
    }
}

async function deleteReviewPhoto(photoId, placeId) {
    if (!confirm('Delete this photo?')) return;

    try {
        const { error } = await supabaseClient
            .from('review_photos')
            .delete()
            .eq('id', photoId);

        if (error) throw error;
        const cards = Array.from(document.querySelectorAll('.place-card')).map((card) => ({ id: card.dataset.placeId })).filter((item) => item.id);
        await loadPlaceReviewsForPlaces(cards.length > 0 ? cards : [{ id: placeId }]);
    } catch (error) {
        console.error('Error deleting photo:', error);
        alert('Failed to delete photo.');
    }
}

function openPhotoViewer(url) {
    const viewer = document.createElement('div');
    viewer.id = 'photo-viewer';
    viewer.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:3000;cursor:pointer;';
    viewer.onclick = () => viewer.remove();
    viewer.innerHTML = `<img src="${escapeHtmlReview(url)}" style="max-width:90vw;max-height:90vh;border-radius:8px;object-fit:contain;">`;
    document.body.appendChild(viewer);
}
