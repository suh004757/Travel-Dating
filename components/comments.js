// Comments Component
// Inline comments for specific places

async function loadComments(placeId) {
    const container = document.getElementById(`comments-${placeId}`);
    if (!container) return;

    try {
        const { data: comments, error } = await supabaseClient
            .from('comments')
            .select('*')
            .eq('place_id', placeId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        let html = '<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f0f0f0;">';
        html += '<div style="font-size: 0.9rem; font-weight: 600; color: #666; margin-bottom: 10px;">💬 메모</div>';

        if (comments.length > 0) {
            html += comments.map(c => `
                <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 8px; font-size: 0.85rem;">
                    <div style="color: #333;">"${c.text}"</div>
                    <div style="color: #999; font-size: 0.75rem; margin-top: 5px;">- ${c.author || '익명'}</div>
                </div>
            `).join('');
        }

        html += `
            <div style="display: flex; gap: 5px; margin-top: 10px;">
                <input type="text" id="comment-input-${placeId}" placeholder="메모 추가..." 
                       style="flex: 1; padding: 6px; border: 1px solid #ddd; border-radius: 5px; font-size: 0.85rem;">
                <button onclick="addComment('${placeId}')" 
                        style="background: #ff6b9d; color: white; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 0.85rem;">
                    추가
                </button>
            </div>
        `;
        html += '</div>';

        container.innerHTML = html;

    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

async function addComment(placeId) {
    const input = document.getElementById(`comment-input-${placeId}`);
    const text = input.value.trim();

    if (!text) return;

    try {
        const { error } = await supabaseClient
            .from('comments')
            .insert({
                place_id: placeId,
                text: text,
                author: '익명'
            });

        if (error) throw error;

        input.value = '';
        await loadComments(placeId);
    } catch (error) {
        alert('메모 추가 실패: ' + error.message);
    }
}
