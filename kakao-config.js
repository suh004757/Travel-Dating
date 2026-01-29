// Kakao Configuration
// Add your Kakao JavaScript Key here after registering your app at https://developers.kakao.com/

const KAKAO_CONFIG = {
    // TODO: Replace with your actual Kakao JavaScript Key
    // Get this from: Kakao Developers Console > Your App > App Keys > JavaScript Key
    javascriptKey: 'YOUR_KAKAO_JAVASCRIPT_KEY_HERE',

    // Redirect URI (must match the one registered in Kakao Developers Console)
    redirectUri: window.location.origin + '/auth/callback'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { KAKAO_CONFIG };
}
