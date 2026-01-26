# 💕 Our Date Log - Supabase Backend

여러 번의 데이트 코스를 관리할 수 있는 **데이트 로그 허브**입니다. Supabase 백엔드를 사용하여 실시간 협업이 가능합니다.

## ✨ 주요 기능

### 1. 멀티 데이트 관리
*   **메인 허브 (`index.html`):** 모든 데이트 기록을 한눈에 볼 수 있는 대시보드
*   **동적 뷰어 (`view.html`):** 데이터베이스에서 실시간으로 불러오는 상세 페이지

### 2. 실시간 협업 기능
*   **☀️ 날씨 위젯:** OpenWeather API로 데이트 날짜의 날씨 자동 표시
*   **✅ 공유 할 일 목록:** 실시간 동기화되는 체크리스트
*   **💬 장소별 메모:** 각 식당/카페에 메모 달기

### 3. 🔐 인증 시스템
*   **매직 링크 로그인:** 비밀번호 없이 이메일로 간편 로그인
*   **읽기 전용 모드:** 비로그인 사용자는 데이터 조회만 가능
*   **편집 권한:** 로그인한 사용자만 메모/할일 추가/삭제 가능

### 4. 엄선된 장소
*   **🍽️ 식당 (6곳):** 미슐랭 맛집, 한옥 다이닝 등
*   **☕ 카페 (8곳):** 한옥 뷰 루프탑, 전통 찻집 등
*   **🗺️ 지도 시각화:** Leaflet.js로 위치 표시

### 5. 모바일 최적화
*   **📱 반응형 디자인:** PC와 모바일 모두 지원
*   **🔗 네이버 지도 연동:** 모바일 전용 링크 (`m.map.naver.com`)

## 🚀 시작하기

### 1단계: Supabase 프로젝트 생성
1. [supabase.com](https://supabase.com)에서 무료 프로젝트 생성
2. SQL Editor에서 `setup_database.sql` 실행
3. Settings > API에서 URL과 Anon Key 복사

### 2단계: Supabase Auth 활성화
1. Supabase Dashboard > **Authentication** > **Providers**
2. **Email** 활성화
3. **Site URL** 설정: `https://your-username.github.io`
4. **Redirect URLs** 추가: `https://your-username.github.io/Travel-Dating/**`

### 3단계: RLS 정책 업데이트
SQL Editor에서 `update_rls_policies.sql` 실행:
- 로그인한 사용자만 todos/comments 수정 가능
- 모든 사용자는 읽기 가능

### 4단계: 설정 파일 업데이트
`config.js` 파일을 열어 API 키 입력:
```javascript
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_ANON_KEY'
};

const WEATHER_CONFIG = {
    apiKey: 'YOUR_OPENWEATHER_KEY', // openweathermap.org에서 무료 발급
    enabled: true
};
```

### 5단계: 데이터 마이그레이션
1. 브라우저에서 `migrate_to_supabase.html` 열기
2. "서울 데이터 업로드" 버튼 클릭
3. 성공 메시지 확인

### 6단계: 앱 실행
`index.html`을 브라우저에서 열면 완료!

## 🔐 사용 방법

### 비로그인 사용자 (읽기 전용)
- 모든 데이트 계획 조회 가능
- 지도, 식당, 카페 정보 확인 가능
- 메모/할일 추가 불가

### 로그인 사용자 (편집 가능)
1. 우측 상단 **"🔐 로그인"** 버튼 클릭
2. 이메일 입력 → 매직 링크 수신
3. 이메일의 링크 클릭 → 자동 로그인
4. 메모 추가/삭제, 할 일 추가/체크/삭제 가능

## 📂 파일 구조

```
Travel---Temporary/
├── index.html              # 메인 허브 (여행 목록)
├── view.html               # 상세 뷰어
├── app.js                  # 메인 로직
├── style.css               # 디자인
├── config.js               # API 키 설정
├── setup_database.sql      # DB 스키마
├── update_rls_policies.sql # 인증 정책
├── migrate_to_supabase.html # 마이그레이션 도구
├── components/
│   ├── auth.js             # 로그인/로그아웃
│   ├── weather.js          # 날씨 위젯
│   ├── todos.js            # 할 일 목록
│   └── comments.js         # 메모 기능
└── itineraries/
    └── seoul_feb_2026.js   # 백업 데이터
```

## 🎨 디자인 테마
- **컬러:** 핑크 계열 (#ff6b9d, #fff5f7)
- **스타일:** 부드러운 카드 레이아웃, 둥근 모서리
- **폰트:** Apple 시스템 폰트

## 🔮 향후 계획
- 🇰🇷 카카오 로그인
- 🌍 공개 플랜 피드
- 📍 지역별 필터링
- ❤️ 좋아요 시스템

---
*Created with ❤️ for romantic getaways*
