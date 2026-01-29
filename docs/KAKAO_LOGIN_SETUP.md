# 카카오 로그인 설정 가이드 (Supabase Native OAuth)

## 🎯 개요
Supabase는 카카오 OAuth를 공식 지원합니다! 매우 간단하게 설정할 수 있습니다.

---

## 📋 1단계: 카카오 개발자 앱 설정

### 1. 카카오 개발자 콘솔 접속
- https://developers.kakao.com/
- 카카오 계정으로 로그인

### 2. 애플리케이션 생성
- **내 애플리케이션** > **애플리케이션 추가하기**
- 앱 이름: `DateScape`
- 사업자명: (선택사항)

### 3. 앱 키 확인
- **앱 설정** > **앱 키**
- **REST API 키** 복사 → 이것이 `Client ID`입니다

### 4. Client Secret 생성
- **앱 설정** > **보안** > **Client Secret**
- **코드 생성** 클릭
- 생성된 코드 복사 → 이것이 `Client Secret`입니다
- **상태**: 사용함으로 변경

### 5. Redirect URI 설정
- **앱 설정** > **플랫폼** > **Web 플랫폼 등록**
- Redirect URI 등록:
  ```
  https://ssutdzqexamonhqdbxvd.supabase.co/auth/v1/callback
  ```
  > ⚠️ 이 URI는 Supabase 프로젝트 URL에 따라 다릅니다!

### 6. 카카오 로그인 활성화
- **제품 설정** > **카카오 로그인**
- **활성화 설정**: ON
- **Redirect URI**: 위에서 등록한 URI 선택

### 7. 동의 항목 설정
- **제품 설정** > **카카오 로그인** > **동의항목**
- **닉네임**: 필수 동의
- **프로필 사진**: 선택 동의
- **카카오계정(이메일)**: 선택 동의

---

## 🔧 2단계: Supabase 설정

### 1. Supabase Dashboard 접속
- https://supabase.com/dashboard
- 프로젝트 선택: `ssutdzqexamonhqdbxvd`

### 2. Authentication 설정
1. 왼쪽 사이드바에서 **Authentication** 클릭
2. **Providers** 탭 클릭
3. **Kakao** 찾아서 확장
4. **Kakao Enabled** 토글을 **ON**으로 변경
5. 다음 정보 입력:
   - **Kakao Client ID**: 카카오 REST API 키
   - **Kakao Client Secret**: 카카오에서 생성한 Client Secret 코드
6. **Save** 클릭

### 3. Redirect URL 확인
Supabase가 자동으로 제공하는 Redirect URL:
```
https://ssutdzqexamonhqdbxvd.supabase.co/auth/v1/callback
```

이 URL을 카카오 개발자 콘솔의 Redirect URI에 정확히 등록했는지 확인!

---

## 💻 3단계: 코드 구현

### 기존 `auth.js` 수정

기존 Magic Link 로그인에 카카오 로그인 추가:

```javascript
// 카카오 로그인 함수 추가
async function loginWithKakao() {
    try {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'kakao',
            options: {
                redirectTo: window.location.origin
            }
        });

        if (error) throw error;
        
        // 자동으로 카카오 로그인 페이지로 리다이렉트됩니다
    } catch (error) {
        console.error('Kakao login error:', error);
        alert('카카오 로그인에 실패했습니다: ' + error.message);
    }
}
```

### UI 업데이트

로그인 모달에 카카오 버튼 추가:

```javascript
function showLoginModal() {
    const modal = document.createElement('div');
    modal.id = 'login-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;';

    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; max-width: 400px; width: 90%; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">
            <h2 style="margin: 0 0 20px 0; color: #ff6b9d;">🔐 로그인</h2>
            
            <!-- 카카오 로그인 버튼 -->
            <button onclick="loginWithKakao()" style="width: 100%; background: #FEE500; color: #000000; border: none; padding: 14px; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; gap: 10px;">
                <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                    <path d="M9 0C4.02944 0 0 3.35786 0 7.5C0 10.0733 1.57056 12.3419 3.99 13.5856L3.06 17.0419C2.99056 17.3419 3.33 17.5733 3.59056 17.4056L7.68 14.8733C8.11056 14.9267 8.55 14.9533 9 14.9533C13.9706 14.9533 18 11.5956 18 7.5C18 3.35786 13.9706 0 9 0Z" fill="#000000"/>
                </svg>
                카카오로 시작하기
            </button>
            
            <div style="text-align: center; color: #999; margin: 15px 0; font-size: 0.9rem;">또는</div>
            
            <!-- 이메일 로그인 -->
            <p style="color: #666; font-size: 0.9rem; margin-bottom: 15px;">이메일 주소를 입력하시면 로그인 링크를 보내드립니다.</p>
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
```

---

## ✅ 완료!

이제 사용자가 "카카오로 시작하기" 버튼을 클릭하면:

1. 카카오 로그인 페이지로 자동 리다이렉트
2. 사용자가 동의하고 로그인
3. 앱으로 자동 리다이렉트
4. Supabase가 자동으로 세션 생성
5. RLS 정책 자동 적용 ✅

---

## 🎨 추가 기능

### 사용자 정보 가져오기

```javascript
// 현재 로그인한 사용자 정보
const { data: { user } } = await supabaseClient.auth.getUser();

console.log(user.user_metadata); // 카카오 프로필 정보
// {
//   avatar_url: "프로필 이미지 URL",
//   email: "이메일",
//   full_name: "닉네임",
//   provider_id: "카카오 사용자 ID"
// }
```

### 로그아웃

```javascript
async function logout() {
    await supabaseClient.auth.signOut();
    window.location.reload();
}
```

---

## 🔍 디버깅

### "Invalid redirect_uri" 오류
- 카카오 개발자 콘솔의 Redirect URI와 Supabase URL이 정확히 일치하는지 확인
- 프로토콜(https), 도메인, 경로까지 모두 일치해야 함

### "Client authentication failed" 오류
- Supabase에 입력한 Client ID와 Client Secret이 정확한지 확인
- Client Secret이 "사용함" 상태인지 확인

### 로그인 후 아무 일도 일어나지 않음
- 브라우저 콘솔에서 에러 확인
- `supabaseClient.auth.onAuthStateChange()` 리스너가 제대로 작동하는지 확인

---

## 📝 체크리스트

### 카카오 설정
- [ ] 카카오 개발자 앱 생성
- [ ] REST API 키 복사 (Client ID)
- [ ] Client Secret 생성 및 활성화
- [ ] Redirect URI 등록 (`https://ssutdzqexamonhqdbxvd.supabase.co/auth/v1/callback`)
- [ ] 카카오 로그인 활성화
- [ ] 동의 항목 설정

### Supabase 설정
- [ ] Authentication > Providers > Kakao 활성화
- [ ] Client ID 입력
- [ ] Client Secret 입력
- [ ] Save 클릭

### 코드 구현
- [ ] `loginWithKakao()` 함수 추가
- [ ] 로그인 모달에 카카오 버튼 추가
- [ ] 테스트 완료

---

## 🚀 다음 단계

1. 카카오 개발자 콘솔에서 앱 설정 완료
2. REST API 키와 Client Secret 복사
3. Supabase Dashboard에서 Kakao Provider 활성화
4. 코드 업데이트
5. 테스트!
