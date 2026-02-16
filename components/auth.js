// Authentication Component
// Handles OAuth login/logout with Supabase Auth

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

let currentUser = null;

async function initAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    currentUser = session?.user || null;

    renderAuthUI();

    supabaseClient.auth.onAuthStateChange((event, session) => {
        currentUser = session?.user || null;
        renderAuthUI();

        if (event === 'SIGNED_IN') {
            closeLoginModal();
            const isFirstLogin = !localStorage.getItem('has_logged_in_before');
            if (isFirstLogin) {
                showWelcomeModal(session?.user);
                localStorage.setItem('has_logged_in_before', 'true');
            }
        }

        window.dispatchEvent(new CustomEvent('auth-state-changed', {
            detail: { event, user: currentUser }
        }));
    });
}

function renderAuthUI() {
    const container = document.getElementById('auth-widget');
    if (!container) return;

    if (currentUser) {
        container.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; z-index: 1000; background: white; padding: 10px 15px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 0.85rem; color: #666;">${escapeHtml(currentUser.email)}</span>
                <button onclick="logout()" style="background: #ff6b9d; color: white; border: none; padding: 6px 12px; border-radius: 15px; cursor: pointer; font-size: 0.85rem;">Log out</button>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
            <button onclick="showLoginModal()" style="background: #ff6b9d; color: white; border: none; padding: 10px 20px; border-radius: 20px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">Log in</button>
        </div>
    `;
}

async function loginWithKakao() {
    try {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'kakao',
            options: {
                redirectTo: window.location.href
            }
        });

        if (error) throw error;
    } catch (error) {
        console.error('Kakao login error:', error);
        alert('Kakao login failed. Please try again shortly.');
    }
}

function showLoginModal() {
    const modal = document.createElement('div');
    modal.id = 'login-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;';

    modal.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 20px; max-width: 400px; width: 90%; box-shadow: 0 8px 30px rgba(0,0,0,0.15); text-align: center;">
            <h2 style="margin: 0 0 10px 0; color: #ff6b9d; font-size: 1.8rem;">DateScape</h2>
            <p style="color: #999; font-size: 0.95rem; margin-bottom: 30px;">Log in to create and manage your date plans.</p>

            <button onclick="loginWithKakao(); closeLoginModal();" style="width: 100%; background: #FEE500; color: #000000; border: none; padding: 16px; border-radius: 12px; cursor: pointer; font-size: 1.05rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 12px; box-sizing: border-box; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(254,229,0,0.4)';" onmouseout="this.style.transform=''; this.style.boxShadow='';">
                Continue with Kakao
            </button>

            <button onclick="closeLoginModal()" style="margin-top: 20px; background: transparent; color: #999; border: none; padding: 10px; cursor: pointer; font-size: 0.9rem; text-decoration: underline;">Maybe later</button>
        </div>
    `;

    document.body.appendChild(modal);
}

function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.remove();
}

function showWelcomeModal(user) {
    const modal = document.createElement('div');
    modal.id = 'welcome-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; animation: fadeIn 0.3s ease;';

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member';

    modal.innerHTML = `
        <style>
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        </style>
        <div style="background: white; padding: 50px 40px; border-radius: 20px; max-width: 500px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center; animation: slideUp 0.4s ease;">
            <h2 style="margin: 0 0 15px 0; color: #ff6b9d; font-size: 2rem;">Welcome!</h2>
            <p style="color: #666; font-size: 1.1rem; margin-bottom: 10px; line-height: 1.6;">
                <strong style="color: #333;">${escapeHtml(userName)}</strong>, welcome to DateScape.
            </p>
            <p style="color: #999; font-size: 0.95rem; margin-bottom: 30px; line-height: 1.6;">
                You can now create your own plans and manage shared notes and tasks.
            </p>
            <button onclick="closeWelcomeModal()" style="background: linear-gradient(135deg, #ff6b9d, #c44569); color: white; border: none; padding: 15px 40px; border-radius: 30px; cursor: pointer; font-size: 1.1rem; font-weight: 600; box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">Get Started</button>
        </div>
    `;

    document.body.appendChild(modal);
}

function closeWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    }
}

function isAuthenticated() {
    return currentUser !== null;
}

async function logout() {
    await supabaseClient.auth.signOut();
    currentUser = null;
    renderAuthUI();
    window.dispatchEvent(new CustomEvent('auth-state-changed', {
        detail: { event: 'SIGNED_OUT', user: null }
    }));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}
