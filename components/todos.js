// To-Do List Component
// Shared task list with real-time sync via Supabase
// Auth required for add/edit/delete

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function loadTodos(tripId) {
    const container = document.getElementById('todos-sidebar');
    if (!container) return;

    container.innerHTML = `
        <div style="background: white; padding: 20px; margin-bottom: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 15px 0; color: #ff6b9d; font-size: 1.1rem;">Task List</h3>
            <div id="todo-list"></div>
            <div id="todo-add-section"></div>
        </div>
    `;

    await refreshTodos(tripId);

    supabaseClient
        .channel(`todos-${tripId}`)
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'todos', filter: `trip_id=eq.${tripId}` },
            () => refreshTodos(tripId)
        )
        .subscribe();
}

async function refreshTodos(tripId) {
    const listContainer = document.getElementById('todo-list');
    const addSection = document.getElementById('todo-add-section');
    if (!listContainer) return;

    try {
        const { data: todos, error } = await supabaseClient
            .from('todos')
            .select('*')
            .eq('trip_id', tripId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        if (todos.length === 0) {
            listContainer.innerHTML = '<p style="color: #999; font-size: 0.85rem; text-align: center;">No tasks yet.</p>';
        } else {
            listContainer.innerHTML = todos.map(todo => {
                const canEdit = window.isAuthenticated && isAuthenticated();
                const safeTodoId = escapeHtml(todo.id);
                const safeTask = escapeHtml(todo.task);
                return `
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                        <input type="checkbox" ${todo.completed ? 'checked' : ''}
                            ${canEdit ? `onchange="toggleTodo('${safeTodoId}', this.checked)"` : 'disabled'}
                            style="cursor: ${canEdit ? 'pointer' : 'not-allowed'};">
                        <span style="flex: 1; font-size: 0.9rem; ${todo.completed ? 'text-decoration: line-through; color: #999;' : ''}">${safeTask}</span>
                        ${canEdit ? `<button onclick="deleteTodo('${safeTodoId}')" style="background: none; border: none; color: #dc3545; cursor: pointer; font-size: 1.2rem; padding: 0;">x</button>` : ''}
                    </div>
                `;
            }).join('');
        }

        if (window.isAuthenticated && isAuthenticated()) {
            const safeTripId = escapeHtml(tripId);
            addSection.innerHTML = `
                <div style="margin-top: 15px; display: flex; gap: 5px;">
                    <input type="text" id="new-todo-input" placeholder="Add a new task..." style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 5px; font-size: 0.9rem;">
                    <button onclick="addTodo('${safeTripId}')" style="background: #ff6b9d; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-size: 0.9rem;">Add</button>
                </div>
            `;
        } else {
            addSection.innerHTML = `
                <div style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px; text-align: center; font-size: 0.85rem; color: #666;">
                    Log in to add tasks. <a href="#" onclick="showLoginModal(); return false;" style="color: #ff6b9d; text-decoration: none;">Log in</a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading todos:', error);
        listContainer.innerHTML = '<p style="color: #dc3545; font-size: 0.85rem;">Failed to load tasks.</p>';
    }
}

async function addTodo(tripId) {
    const input = document.getElementById('new-todo-input');
    const task = input.value.trim();

    if (!task) return;

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        showLoginModal();
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('todos')
            .insert({ trip_id: tripId, user_id: user.id, task, completed: false });

        if (error) throw error;

        input.value = '';
        await refreshTodos(tripId);
    } catch (error) {
        if (error.message.includes('row-level security')) {
            alert('Login is required.');
            showLoginModal();
        } else {
            alert('Failed to add task: ' + error.message);
        }
    }
}

async function toggleTodo(todoId, completed) {
    try {
        const { error } = await supabaseClient
            .from('todos')
            .update({ completed })
            .eq('id', todoId);

        if (error) throw error;
    } catch (error) {
        if (error.message.includes('row-level security')) {
            alert('Login is required.');
            showLoginModal();
        } else {
            alert('Failed to update task: ' + error.message);
        }
    }
}

async function deleteTodo(todoId) {
    if (!confirm('Delete this task?')) return;

    try {
        const { error } = await supabaseClient
            .from('todos')
            .delete()
            .eq('id', todoId);

        if (error) throw error;
    } catch (error) {
        if (error.message.includes('row-level security')) {
            alert('Login is required.');
            showLoginModal();
        } else {
            alert('Failed to delete task: ' + error.message);
        }
    }
}
