// Kakao Login Component
// Uses Kakao JavaScript SDK for OAuth authentication
// Integrates with Supabase for user management

// Kakao SDK will be loaded via script tag in HTML
// Make sure to add: <script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"></script>

let kakaoUser = null;

// Initialize Kakao SDK
function initKakao() {
    // Replace with your actual Kakao JavaScript Key
    const KAKAO_JS_KEY = 'YOUR_KAKAO_JAVASCRIPT_KEY'; // TODO: Get from Kakao Developers Console

    if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(KAKAO_JS_KEY);
        console.log('Kakao SDK initialized:', window.Kakao.isInitialized());
    }
}

// Kakao Login
async function loginWithKakao() {
    if (!window.Kakao) {
        alert('카카오 SDK가 로드되지 않았습니다.');
        return;
    }

    try {
        // Request Kakao login
        window.Kakao.Auth.login({
            success: async function (authObj) {
                console.log('Kakao login success:', authObj);

                // Get user info from Kakao
                window.Kakao.API.request({
                    url: '/v2/user/me',
                    success: async function (response) {
                        console.log('Kakao user info:', response);

                        kakaoUser = {
                            id: response.id,
                            nickname: response.kakao_account?.profile?.nickname || 'Unknown',
                            email: response.kakao_account?.email || null,
                            profile_image: response.kakao_account?.profile?.profile_image_url || null
                        };

                        // Create or login user in Supabase
                        await createSupabaseUserFromKakao(kakaoUser, authObj.access_token);

                        // Update UI
                        renderAuthUI();

                        // Reload page to refresh data
                        setTimeout(() => window.location.reload(), 500);
                    },
                    fail: function (error) {
                        console.error('Failed to get Kakao user info:', error);
                        alert('사용자 정보를 가져올 수 없습니다.');
                    }
                });
            },
            fail: function (err) {
                console.error('Kakao login failed:', err);
                alert('카카오 로그인에 실패했습니다.');
            }
        });
    } catch (error) {
        console.error('Kakao login error:', error);
        alert('로그인 중 오류가 발생했습니다.');
    }
}

// Create or login Supabase user using Kakao info
async function createSupabaseUserFromKakao(kakaoUserInfo, kakaoAccessToken) {
    try {
        // Option 1: Use email-based login if email is available
        if (kakaoUserInfo.email) {
            // Sign in with OTP (passwordless) using Kakao email
            const { data, error } = await supabaseClient.auth.signInWithOtp({
                email: kakaoUserInfo.email,
                options: {
                    data: {
                        provider: 'kakao',
                        kakao_id: kakaoUserInfo.id,
                        nickname: kakaoUserInfo.nickname,
                        profile_image: kakaoUserInfo.profile_image
                    }
                }
            });

            if (error) throw error;

            // Store Kakao info in localStorage for session management
            localStorage.setItem('kakao_user', JSON.stringify(kakaoUserInfo));
            localStorage.setItem('kakao_token', kakaoAccessToken);

            console.log('Supabase user created/logged in:', data);
        } else {
            // Option 2: Store in localStorage only (no email available)
            localStorage.setItem('kakao_user', JSON.stringify(kakaoUserInfo));
            localStorage.setItem('kakao_token', kakaoAccessToken);

            alert('카카오 계정에 이메일이 없습니다. 일부 기능이 제한될 수 있습니다.');
        }

        currentUser = kakaoUserInfo; // Update global user state

    } catch (error) {
        console.error('Failed to create Supabase user:', error);

        // Fallback: Just use Kakao login without Supabase integration
        localStorage.setItem('kakao_user', JSON.stringify(kakaoUserInfo));
        localStorage.setItem('kakao_token', kakaoAccessToken);
        currentUser = kakaoUserInfo;
    }
}

// Kakao Logout
async function logoutKakao() {
    if (!window.Kakao) return;

    try {
        // Kakao logout
        if (window.Kakao.Auth.getAccessToken()) {
            window.Kakao.Auth.logout(function () {
                console.log('Kakao logout success');
            });
        }

        // Clear localStorage
        localStorage.removeItem('kakao_user');
        localStorage.removeItem('kakao_token');

        // Supabase logout (if applicable)
        await supabaseClient.auth.signOut();

        kakaoUser = null;
        currentUser = null;

        window.location.reload();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Check if user is logged in with Kakao
function checkKakaoLogin() {
    const storedUser = localStorage.getItem('kakao_user');
    const storedToken = localStorage.getItem('kakao_token');

    if (storedUser && storedToken) {
        kakaoUser = JSON.parse(storedUser);
        currentUser = kakaoUser;

        // Verify token is still valid (optional)
        if (window.Kakao && window.Kakao.Auth) {
            window.Kakao.Auth.setAccessToken(storedToken);
        }

        return true;
    }

    return false;
}

// Enhanced renderAuthUI to support both Magic Link and Kakao
function renderAuthUIWithKakao() {
    const container = document.getElementById('auth-widget');
    if (!container) return;

    // Check for Kakao login first
    const hasKakaoLogin = checkKakaoLogin();

    if (currentUser || hasKakaoLogin) {
        // Logged in: Show user info and logout button
        const displayName = currentUser?.nickname || currentUser?.email || 'User';
        const profileImage = currentUser?.profile_image || null;

        container.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; z-index: 1000; background: white; padding: 10px 15px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 10px;">
                ${profileImage ? `<img src="${profileImage}" style="width: 30px; height: 30px; border-radius: 50%;" />` : '👤'}
                <span style="font-size: 0.85rem; color: #666;">${displayName}</span>
                <button onclick="${hasKakaoLogin ? 'logoutKakao()' : 'logout()'}" style="background: #ff6b9d; color: white; border: none; padding: 6px 12px; border-radius: 15px; cursor: pointer; font-size: 0.85rem;">
                    로그아웃
                </button>
            </div>
        `;
    } else {
        // Not logged in: Show login options
        container.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; z-index: 1000; display: flex; gap: 10px;">
                <button onclick="loginWithKakao()" style="background: #FEE500; color: #000000; border: none; padding: 10px 20px; border-radius: 20px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-weight: 600; display: flex; align-items: center; gap: 8px;">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 0C4.02944 0 0 3.35786 0 7.5C0 10.0733 1.57056 12.3419 3.99 13.5856L3.06 17.0419C2.99056 17.3419 3.33 17.5733 3.59056 17.4056L7.68 14.8733C8.11056 14.9267 8.55 14.9533 9 14.9533C13.9706 14.9533 18 11.5956 18 7.5C18 3.35786 13.9706 0 9 0Z" fill="#000000"/>
                    </svg>
                    카카오 로그인
                </button>
                <button onclick="showLoginModal()" style="background: #ff6b9d; color: white; border: none; padding: 10px 20px; border-radius: 20px; cursor: pointer; font-size: 0.9rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    🔐 이메일 로그인
                </button>
            </div>
        `;
    }
}

// Initialize Kakao on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initKakao();
        checkKakaoLogin();
        renderAuthUIWithKakao();
    });
} else {
    initKakao();
    checkKakaoLogin();
    renderAuthUIWithKakao();
}
