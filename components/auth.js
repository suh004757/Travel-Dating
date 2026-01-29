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

// Kakao Login using Supabase OAuth
async function loginWithKakao() {
    try {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'kakao',
            options: {
                redirectTo: window.location.href  // Redirect back to current page
            }
        });

        if (error) throw error;

        // User will be redirected to Kakao login page
        // After successful login, they'll be redirected back to the app
    } catch (error) {
        console.error('Kakao login error:', error);
        alert('카카오 로그인에 실패했습니다: ' + error.message);
    }
}

function showLoginModal() {
    const modal = document.createElement('div');
    modal.id = 'login-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;';

    modal.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 20px; max-width: 400px; width: 90%; box-shadow: 0 8px 30px rgba(0,0,0,0.15); text-align: center;">
            <h2 style="margin: 0 0 10px 0; color: #ff6b9d; font-size: 1.8rem;">💕 DateScape</h2>
            <p style="color: #999; font-size: 0.95rem; margin-bottom: 30px;">로그인하고 나만의 데이트 플랜을 만들어보세요</p>
            
            <!-- Kakao Login Button -->
            <button onclick="loginWithKakao(); closeLoginModal();" style="width: 100%; background: #FEE500; color: #000000; border: none; padding: 16px; border-radius: 12px; cursor: pointer; font-size: 1.05rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 12px; box-sizing: border-box; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(254,229,0,0.4)';" onmouseout="this.style.transform=''; this.style.boxShadow='';">
                <svg width="22" height="22" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 0C4.02944 0 0 3.35786 0 7.5C0 10.0733 1.57056 12.3419 3.99 13.5856L3.06 17.0419C2.99056 17.3419 3.33 17.5733 3.59056 17.4056L7.68 14.8733C8.11056 14.9267 8.55 14.9533 9 14.9533C13.9706 14.9533 18 11.5956 18 7.5C18 3.35786 13.9706 0 9 0Z" fill="#000000"/>
                </svg>
                카카오로 3초만에 시작하기
            </button>
            
            <button onclick="closeLoginModal()" style="margin-top: 20px; background: transparent; color: #999; border: none; padding: 10px; cursor: pointer; font-size: 0.9rem; text-decoration: underline;">
                나중에 하기
            </button>
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
