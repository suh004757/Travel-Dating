// To-Do List Component
// Shared task list with real-time sync via Supabase

async function loadTodos(tripId) {
    const container = document.getElementById('todos-sidebar');
    if (!container) return;

    // Create sidebar UI
    container.innerHTML = `
        <div style="background: white; padding: 20px; margin-bottom: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 15px 0; color: #ff6b9d; font-size: 1.1rem;">✅ 할 일 목록</h3>
            <div id="todo-list"></div>
            <div style="margin-top: 15px; display: flex; gap: 5px;">
                <input type="text" id="new-todo-input" placeholder="새 할 일 추가..." 
                       style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 5px; font-size: 0.9rem;">
                <button onclick="addTodo('${tripId}')" 
                        style="background: #ff6b9d; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-size: 0.9rem;">
                    추가
                </button>
            </div>
        </div>
    `;

    // Load existing todos
    await refreshTodos(tripId);

    // Setup realtime subscription
    supabaseClient
        .channel(`todos-${tripId}`)
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'todos', filter: `trip_id=eq.${tripId}` },
            () => refreshTodos(tripId)
        )
        .subscribe();
}

async function refreshTodos(tripId) {
    const listContainer = document.getElementById('todo-list');
    if (!listContainer) return;

    try {
        const { data: todos, error } = await supabaseClient
            .from('todos')
            .select('*')
            .eq('trip_id', tripId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        if (todos.length === 0) {
            listContainer.innerHTML = '<p style="color: #999; font-size: 0.85rem; text-align: center;">할 일이 없습니다</p>';
            return;
        }

        listContainer.innerHTML = todos.map(todo => `
            <div style="display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                       onchange="toggleTodo('${todo.id}', this.checked)"
                       style="cursor: pointer;">
                <span style="flex: 1; font-size: 0.9rem; ${todo.completed ? 'text-decoration: line-through; color: #999;' : ''}">${todo.task}</span>
                <button onclick="deleteTodo('${todo.id}')" 
                        style="background: none; border: none; color: #dc3545; cursor: pointer; font-size: 1.2rem; padding: 0;">
                    ×
                </button>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading todos:', error);
        listContainer.innerHTML = '<p style="color: #dc3545; font-size: 0.85rem;">로딩 실패</p>';
    }
}

async function addTodo(tripId) {
    const input = document.getElementById('new-todo-input');
    const task = input.value.trim();

    if (!task) return;

    try {
        const { error } = await supabaseClient
            .from('todos')
            .insert({ trip_id: tripId, task: task, completed: false });

        if (error) throw error;

        input.value = '';
        await refreshTodos(tripId);
    } catch (error) {
        alert('할 일 추가 실패: ' + error.message);
    }
}

async function toggleTodo(todoId, completed) {
    try {
        const { error } = await supabaseClient
            .from('todos')
            .update({ completed: completed })
            .eq('id', todoId);

        if (error) throw error;
    } catch (error) {
        alert('업데이트 실패: ' + error.message);
    }
}

async function deleteTodo(todoId) {
    if (!confirm('삭제하시겠습니까?')) return;

    try {
        const { error } = await supabaseClient
            .from('todos')
            .delete()
            .eq('id', todoId);

        if (error) throw error;
    } catch (error) {
        alert('삭제 실패: ' + error.message);
    }
}
