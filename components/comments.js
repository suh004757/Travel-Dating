// Comments Component
// Inline comments for specific places
// Auth required for add/delete

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function loadPlaceComments(placeId) {
    const container = document.getElementById(`comments-${placeId}`);
    if (!container) return;

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        const canEdit = !!user;
        let comments = [];

        if (user) {
            const { data, error } = await supabaseClient
                .from('comments')
                .select('*')
                .eq('place_id', placeId)
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });

            if (error) throw error;
            comments = data || [];
        }

        let html = '<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f0f0f0;">';
        html += '<div style="font-size: 0.9rem; font-weight: 600; color: #666; margin-bottom: 4px;">Private notes</div>';
        html += '<div style="font-size: 0.75rem; color: #999; margin-bottom: 10px;">Only visible to you.</div>';

        if (comments.length > 0) {
            html += comments.map(c => {
                const safeText = escapeHtml(c.text);
                const safeAuthor = escapeHtml(c.author || 'Anonymous');
                const safeCommentId = escapeHtml(c.id);
                const safePlaceId = escapeHtml(placeId);

                return `
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 8px; font-size: 0.85rem; position: relative;">
                        <div style="color: #333; padding-right: 30px;">"${safeText}"</div>
                        <div style="color: #999; font-size: 0.75rem; margin-top: 5px;">- ${safeAuthor}</div>
                        <button onclick="removeComment('${safeCommentId}', '${safePlaceId}')" style="position: absolute; top: 8px; right: 8px; background: none; border: none; color: #dc3545; cursor: pointer; font-size: 1.2rem; padding: 0; line-height: 1;" title="Delete">x</button>
                    </div>
                `;
            }).join('');
        } else if (canEdit) {
            html += '<div style="font-size: 0.8rem; color: #999; margin-bottom: 8px;">No notes yet for this place.</div>';
        }

        if (canEdit) {
            html += `
                <div style="display: flex; gap: 5px; margin-top: 10px;">
                    <input type="text" id="comment-input-${placeId}" placeholder="Add a note..." style="flex: 1; padding: 6px; border: 1px solid #ddd; border-radius: 5px; font-size: 0.85rem;">
                    <button onclick="createComment('${placeId}')" style="background: #ff6b9d; color: white; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 0.85rem;">Add</button>
                </div>
            `;
        } else {
            html += `
                <div style="margin-top: 10px; padding: 8px; background: #f8f9fa; border-radius: 5px; text-align: center; font-size: 0.8rem; color: #666;">
                    Log in to add notes. <a href="#" onclick="showLoginModal(); return false;" style="color: #ff6b9d; text-decoration: none;">Log in</a>
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

async function createComment(placeId) {
    const input = document.getElementById(`comment-input-${placeId}`);
    const text = input.value.trim();

    if (!text) return;

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (!user) {
            alert('Login is required.');
            showLoginModal();
            return;
        }

        const { error } = await supabaseClient
            .from('comments')
            .insert({
                place_id: placeId,
                text,
                author: user.user_metadata?.full_name || user.email || 'Anonymous',
                user_id: user.id
            });

        if (error) throw error;

        input.value = '';
        await loadPlaceComments(placeId);
    } catch (error) {
        if (error.message.includes('row-level security')) {
            alert('Login is required.');
            showLoginModal();
        } else {
            alert('Failed to add note: ' + error.message);
        }
    }
}

async function removeComment(commentId, placeId) {
    if (!confirm('Delete this note?')) return;

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (!user) {
            alert('Login is required.');
            showLoginModal();
            return;
        }

        const { error } = await supabaseClient
            .from('comments')
            .delete()
            .eq('id', commentId)
            .eq('user_id', user.id);

        if (error) throw error;

        await loadPlaceComments(placeId);
    } catch (error) {
        if (error.message.includes('row-level security') || error.message.includes('0 rows')) {
            alert('You can only delete your own notes.');
        } else {
            alert('Failed to delete note: ' + error.message);
        }
    }
}
