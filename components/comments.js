// Comments Component
// Inline comments for specific places
// Auth required for add/delete

async function loadPlaceComments(placeId) {
    const container = document.getElementById(`comments-${placeId}`);
    if (!container) return;

    try {
        const { data: comments, error } = await supabaseClient
            .from('comments')
            .select('*')
            .eq('place_id', placeId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        const canEdit = window.isAuthenticated && isAuthenticated();

        let html = '<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f0f0f0;">';
        html += '<div style="font-size: 0.9rem; font-weight: 600; color: #666; margin-bottom: 10px;">💬 메모</div>';

        if (comments.length > 0) {
            html += comments.map(c => {
                // Check if current user is the author of this comment
                const isAuthor = canEdit && currentUser && (c.user_id === currentUser.id);

                return `
                <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 8px; font-size: 0.85rem; position: relative;">
                    <div style="color: #333; padding-right: ${isAuthor ? '30px' : '0'};">"${c.text}"</div>
                    <div style="color: #999; font-size: 0.75rem; margin-top: 5px;">- ${c.author || '익명'}</div>
                    ${isAuthor ? `
                        <button onclick="removeComment('${c.id}', '${placeId}')" 
                                style="position: absolute; top: 8px; right: 8px; background: none; border: none; color: #dc3545; cursor: pointer; font-size: 1.2rem; padding: 0; line-height: 1;" title="삭제">
                            ×
                        </button>
                    ` : ''}
                </div>
            `}).join('');
        }

        if (canEdit) {
            html += `
                <div style="display: flex; gap: 5px; margin-top: 10px;">
                    <input type="text" id="comment-input-${placeId}" placeholder="메모 추가..." 
                           style="flex: 1; padding: 6px; border: 1px solid #ddd; border-radius: 5px; font-size: 0.85rem;">
                    <button onclick="createComment('${placeId}')" 
                            style="background: #ff6b9d; color: white; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 0.85rem;">
                        추가
                    </button>
                </div>
            `;
        } else {
            html += `
                <div style="margin-top: 10px; padding: 8px; background: #f8f9fa; border-radius: 5px; text-align: center; font-size: 0.8rem; color: #666;">
                    🔒 메모를 추가하려면 <a href="#" onclick="showLoginModal(); return false;" style="color: #ff6b9d; text-decoration: none;">로그인</a>하세요
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
        // Get current user from Supabase Auth
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (!user) {
            alert('로그인이 필요합니다.');
            showLoginModal();
            return;
        }

        const { error } = await supabaseClient
            .from('comments')
            .insert({
                place_id: placeId,
                text: text,
                author: user.user_metadata?.full_name || user.email || '익명',
                user_id: user.id  // Save user ID for ownership check
            });

        if (error) throw error;

        input.value = '';
        await loadPlaceComments(placeId);
    } catch (error) {
        if (error.message.includes('row-level security')) {
            alert('로그인이 필요합니다.');
            showLoginModal();
        } else {
            alert('메모 추가 실패: ' + error.message);
        }
    }
}

async function removeComment(commentId, placeId) {
    if (!confirm('이 메모를 삭제하시겠습니까?')) return;

    try {
        // Get current user
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (!user) {
            alert('로그인이 필요합니다.');
            showLoginModal();
            return;
        }

        // Delete will fail if user is not the owner (thanks to RLS policy)
        const { error } = await supabaseClient
            .from('comments')
            .delete()
            .eq('id', commentId)
            .eq('user_id', user.id);  // Additional client-side check

        if (error) throw error;

        await loadPlaceComments(placeId);
    } catch (error) {
        if (error.message.includes('row-level security') || error.message.includes('0 rows')) {
            alert('본인이 작성한 메모만 삭제할 수 있습니다.');
        } else {
            alert('삭제 실패: ' + error.message);
        }
    }
}
