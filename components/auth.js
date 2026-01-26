// Authentication Component
// Handles Magic Link login/logout with Supabase Auth

let currentUser = null;

async function initAuth() {
    // Check current session
    const { data: { session } } = await supabaseClient.auth.getSession();
    currentUser = session?.user || null;

    renderAuthUI();

    // Listen for auth changes
    supabaseClient.auth.onAuthStateChange((event, session) => {
        currentUser = session?.user || null;
        renderAuthUI();

        // Reload components when auth state changes
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
            window.location.reload();
        }
    });
}

function renderAuthUI() {
    const container = document.getElementById('auth-widget');
    if (!container) return;

    if (currentUser) {
        // Logged in: Show user email and logout button
        container.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; z-index: 1000; background: white; padding: 10px 15px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 0.85rem; color: #666;">👤 ${currentUser.email}</span>
                <button onclick="logout()" style="background: #ff6b9d; color: white; border: none; padding: 6px 12px; border-radius: 15px; cursor: pointer; font-size: 0.85rem;">
                    로그아웃
                </button>
            </div>
        `;
    } else {
        // Not logged in: Show login button
        container.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
                <button onclick="showLoginModal()" style="background: #ff6b9d; color: white; border: none; padding: 10px 20px; border-radius: 20px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    🔐 로그인
                </button>
            </div>
        `;
    }
}

function showLoginModal() {
    const modal = document.createElement('div');
    modal.id = 'login-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;';

    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; max-width: 400px; width: 90%; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">
            <h2 style="margin: 0 0 20px 0; color: #ff6b9d;">🔐 로그인</h2>
            <p style="color: #666; font-size: 0.9rem; margin-bottom: 20px;">이메일 주소를 입력하시면 로그인 링크를 보내드립니다.</p>
            <input type="email" id="login-email" placeholder="your-email@example.com" 
                   style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 0.95rem; margin-bottom: 15px; box-sizing: border-box;">
            <div style="display: flex; gap: 10px;">
                <button onclick="sendMagicLink()" style="flex: 1; background: #ff6b9d; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 0.95rem;">
                    매직 링크 전송
                </button>
                <button onclick="closeLoginModal()" style="flex: 1; background: #f0f0f0; color: #666; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 0.95rem;">
                    취소
                </button>
            </div>
            <div id="login-status" style="margin-top: 15px; font-size: 0.85rem;"></div>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('login-email').focus();
}

function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.remove();
}

async function sendMagicLink() {
    const email = document.getElementById('login-email').value.trim();
    const statusDiv = document.getElementById('login-status');

    if (!email) {
        statusDiv.innerHTML = '<span style="color: #dc3545;">이메일을 입력해주세요.</span>';
        return;
    }

    statusDiv.innerHTML = '<span style="color: #1976d2;">전송 중...</span>';

    try {
        const { error } = await supabaseClient.auth.signInWithOtp({
            email: email,
            options: {
                emailRedirectTo: window.location.href
            }
        });

        if (error) throw error;

        statusDiv.innerHTML = `
            <div style="color: #28a745; background: #d4edda; padding: 10px; border-radius: 5px;">
                ✅ 이메일을 확인하세요!<br>
                <small>${email}로 로그인 링크를 보냈습니다.</small>
            </div>
        `;

        setTimeout(closeLoginModal, 3000);
    } catch (error) {
        statusDiv.innerHTML = `<span style="color: #dc3545;">❌ ${error.message}</span>`;
    }
}

async function logout() {
    await supabaseClient.auth.signOut();
    window.location.reload();
}

// Check if user is authenticated
function isAuthenticated() {
    return currentUser !== null;
}

// Initialize auth on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}
