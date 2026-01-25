// Data for Seoul Date Itinerary
const ORAKAI_LOCATION = {
    name: "오라카이 인사동 스위트",
    lat: 37.5741,
    lng: 126.9854,
    address: "서울 종로구 인사동4길 18"
};

const restaurants = [
    {
        name: "미쉬매쉬",
        category: "한식 (퓨전)",
        area: "북촌",
        distance: "택시 5-8분",
        description: "창덕궁 돌담뷰가 보이는 분위기 좋은 한옥 레스토랑. 셰프의 독창적인 코스 요리를 즐길 수 있습니다. (화-일 영업)",
        platform: "네이버 지도",
        link: "https://map.naver.com/p/search/%EB%AF%B8%EC%89%AC%EB%A7%A4%EC%89%AC",
        rating: "⭐4.4/5",
        lat: 37.582100000000004,
        lng: 126.9934,
        type: "restaurant"
    },
    {
        name: "온6.5",
        category: "막걸리 다이닝",
        area: "북촌",
        distance: "택시 5-8분",
        description: "세련된 한옥 공간에서 즐기는 김치 베이스의 창작 요리와 프리미엄 막걸리. 분위기가 매우 뛰어납니다. (매일 영업)",
        platform: "네이버 지도",
        link: "https://map.naver.com/p/search/%EC%98%A86.5",
        rating: "⭐4.4/5",
        lat: 37.5901,
        lng: 127.0014,
        type: "restaurant"
    },
    {
        name: "산촌",
        category: "사찰음식 / 한정식",
        area: "인사동",
        distance: "도보 5분",
        description: "고즈넉한 한옥에서 즐기는 전통 사찰음식. 자극적이지 않고 건강한 맛으로, 저녁에는 공연도 있습니다. (매일 영업)",
        platform: "네이버 지도",
        link: "https://map.naver.com/p/search/%EC%82%B0%EC%B4%87%20%EC%9D%B8%EC%82%AC%EB%8F%99",
        rating: "⭐4.4/5",
        lat: 37.5981,
        lng: 127.0094,
        type: "restaurant"
    },
    {
        name: "목멱산방",
        category: "한식 / 비빔밥",
        area: "남산",
        distance: "택시 10분",
        description: "남산 자락에 위치해 숲속 뷰를 즐기며 먹는 미쉐린 비빔밥 맛집. 산책 후 식사하기 좋습니다. (매일 영업)",
        platform: "네이버 지도",
        link: "https://map.naver.com/p/search/%EB%AA%A9%EB%A9%B1%EC%82%B0%EB%B0%A9",
        rating: "⭐4.4/5",
        lat: 37.6061,
        lng: 127.0174,
        type: "restaurant"
    },
    {
        name: "꽃, 밥에 피다",
        category: "유기농 한식",
        area: "인사동",
        distance: "도보 5분",
        description: "미쉐린 그린스타를 받은 유기농 한식당. 친환경 식재료로 만든 정갈하고 예쁜 한 상을 제공합니다. (매일 영업)",
        platform: "네이버 지도",
        link: "https://map.naver.com/p/search/%EA%BD%83%EB%B0%A5%EC%97%90%ED%94%BC%EB%8B%A4",
        rating: "⭐4.4/5",
        lat: 37.6381,
        lng: 127.04939999999999,
        type: "restaurant"
    },
    {
        name: "개성만두 궁",
        category: "만두전골",
        area: "인사동",
        distance: "도보 3분",
        description: "70년 전통의 이북식 손만두 전문점. 슴슴하고 담백한 국물이 일품이며, 한옥 분위기가 아늑합니다. (매일 영업)",
        platform: "네이버 지도",
        link: "https://map.naver.com/p/search/%EA%B0%9C%EC%84%B1%EB%A7%8C%EB%91%90%20%EA%B6%81",
        rating: "⭐4.4/5",
        lat: 37.646100000000004,
        lng: 127.0574,
        type: "restaurant"
    }
];

const cafes = [
    {
        name: "그린마일커피 북촌점",
        category: "루프탑 / 뷰",
        area: "북촌",
        distance: "안국역 도보 10분",
        description: "📸 루프탑 한옥뷰 - 3층 루프탑에서 내려다보는 기와지붕 뷰가 유명합니다. 커피 맛도 훌륭한 모던한 카페. (08:00-21:00)",
        platform: "네이버 지도",
        link: "https://map.naver.com/p/search/%EA%B7%B8%EB%A6%B0%EB%A7%88%EC%9D%BC%EC%BB%A4%ED%94%BC",
        rating: "⭐4.5/5",
        lat: 37.5805,
        lng: 126.9830,
        type: "cafe"
    },
    {
        name: "차마시는뜰",
        category: "전통찻집 / 한옥",
        area: "북촌",
        distance: "안국역 도보 15분",
        description: "🍵 힐링 뷰 - 언덕 위에 위치해 산과 마을이 내려다보이는 'ㅁ'자 구조의 아름다운 한옥 찻집. (12:00-21:00)",
        platform: "네이버 지도",
        link: "https://map.naver.com/p/search/%EC%B0%A8%EB%A7%88%EC%8B%9C%EB%8A%94%EB%9C%B0",
        rating: "⭐4.6/5",
        lat: 37.5840,
        lng: 126.9820,
        type: "cafe"
    },
    {
        name: "어니언 안국",
        category: "베이커리 / 한옥",
        area: "안국",
        distance: "안국역 도보 3분",
        description: "🏚️ 힙한 한옥 - 대청마루에 앉아 빵과 커피를 즐길 수 있는 인기 카페. 팡도르가 유명합니다. (07:00-22:00)",
        platform: "네이버 지도",
        link: "https://map.naver.com/p/search/%EC%96%B4%EB%8B%88%EC%96%B8%20%EC%95%88%EA%B5%AD",
        rating: "⭐4.4/5",
        lat: 37.5775,
        lng: 126.9865,
        type: "cafe"
    },
    {
        name: "청수당",
        category: "정원 / 분위기",
        area: "익선동",
        distance: "오라카이 도보 10분",
        description: "🏮 포토존 - 입구의 징검다리와 등불이 환상적인 분위기를 자아냅니다. 수플레 카스텔라 추천. (10:30-21:00)",
        platform: "네이버 지도",
        link: "https://map.naver.com/p/search/%EC%B2%AD%EC%88%98%EB%8B%B9",
        rating: "⭐4.3/5",
        lat: 37.5740,
        lng: 126.9895,
        type: "cafe"
    },
    {
        name: "오설록 티하우스 북촌점",
        category: "모던 한옥 / 차",
        area: "북촌",
        distance: "안국역 도보 10분",
        description: "🍵 프리미엄 티 - 1930년대 양옥과 한옥이 어우러진 공간. 3층 바설록이나 테라스 뷰가 좋습니다. (11:00-21:00)",
        platform: "네이버 지도",
        link: "https://map.naver.com/p/search/%EC%98%A4%EC%84%A4%EB%A1%9D%20%ED%8B%B0%ED%95%98%EC%9A%B0%EC%8A%A4%20%EB%B6%81%EC%B4%8C",
        rating: "⭐4.6/5",
        lat: 37.5795,
        lng: 126.9840,
        type: "cafe"
    },
    {
        name: "블루보틀 삼청",
        category: "모던 / 뷰",
        area: "삼청동",
        distance: "안국역 도보 15분",
        description: "🖼️ 액자 뷰 - 2층 통창 너머로 보이는 한옥 기와 풍경이 한 폭의 그림 같습니다. 깔끔한 커피. (09:00-20:00)",
        platform: "네이버 지도",
        link: "https://map.naver.com/p/search/%EB%B8%94%EB%A3%A8%EB%B3%B4%ED%8B%80%20%EC%82%BC%EC%B2%AD",
        rating: "⭐4.5/5",
        lat: 37.5810,
        lng: 126.9810,
        type: "cafe"
    },
    {
        name: "산모퉁이",
        category: "산 뷰 / 드라마",
        area: "부암동",
        distance: "택시 20분",
        description: "⛰️ 파노라마 뷰 - 드라마 '커피프린스 1호점' 촬영지. 북악산 성곽길과 서울 전경이 시원하게 펼쳐집니다. (11:00-19:00)",
        platform: "네이버 지도",
        link: "https://map.naver.com/p/search/%EC%82%B0%EB%AA%A8%ED%89%81%EC%9D%B4",
        rating: "⭐4.4/5",
        lat: 37.5950,
        lng: 126.9650,
        type: "cafe"
    },
    {
        name: "로우루프",
        category: "한옥 뷰 / 테라스",
        area: "북촌",
        distance: "안국역 도보 5분",
        description: "🏡 가든 뷰 - 휘겸재 한옥을 마당처럼 공유하는 현대식 카페. 날씨 좋으면 야외 좌석이 최고입니다. (10:00-20:00)",
        platform: "네이버 지도",
        link: "https://map.naver.com/p/search/%EB%A1%9C%EC%9A%B0%EB%A3%A8%ED%94%84",
        rating: "⭐4.3/5",
        lat: 37.5785,
        lng: 126.9850,
        type: "cafe"
    }
];

const routePlans = {
    feb10: {
        title: "2월 10일 (화) - 도착 & 첫인상",
        options: [
            {
                name: "Option A: 낭만적인 한옥 산책",
                description: "호텔 체크인 후 인사동/익선동의 밤거리를 즐기는 편안한 코스",
                activities: [
                    { time: "15:00", name: "오라카이 체크인", description: "호텔 체크인 및 휴식" },
                    { time: "16:30", name: "청수당", description: "랜턴 가득한 정원에서 디저트 타임" },
                    { time: "19:00", name: "개성만두 궁", description: "따뜻한 만두전골 저녁" },
                    { time: "20:30", name: "인사동 쌈지길", description: "저녁 산책 및 소품 구경" }
                ]
            },
            {
                name: "Option B: 트렌디한 감성 충전",
                description: "힙한 카페와 미쉐린 맛집을 방문하는 코스",
                activities: [
                    { time: "15:00", name: "오라카이 체크인", description: "짐 풀기" },
                    { time: "16:00", name: "어니언 안국", description: "한옥 마루에서 즐기는 커피" },
                    { time: "18:00", name: "꽃, 밥에 피다", description: "건강하고 예쁜 유기농 한식 코스" },
                    { time: "20:00", name: "익선동 골목 투어", description: "아기자기한 골목 구경" }
                ]
            }
        ]
    },
    feb11: {
        title: "2월 11일 (수) - 메인 데이트 (북촌)",
        options: [
            {
                name: "Option A: 북촌 뷰 & 힐링",
                description: "북촌의 전망과 차를 즐기는 클래식 코스",
                activities: [
                    { time: "10:30", name: "그린마일커피", description: "루프탑에서 기와지붕 뷰 감상" },
                    { time: "12:30", name: "미쉬매쉬", description: "창덕궁 뷰 런치 코스" },
                    { time: "15:00", name: "차마시는뜰", description: "고즈넉한 한옥 찻집에서 휴식" },
                    { time: "19:00", name: "온6.5", description: "분위기 있는 막걸리 다이닝" }
                ]
            },
            {
                name: "Option B: 모던 한옥 탐방",
                description: "현대적으로 해석된 한옥 공간들을 둘러보는 코스",
                activities: [
                    { time: "11:00", name: "오설록 티하우스", description: "프리미엄 티 코스 또는 테라스" },
                    { time: "13:00", name: "로우루프", description: "한옥 마당이 보이는 가벼운 점심/커피" },
                    { time: "15:00", name: "북촌 한옥마을", description: "가회동 골목길 산책" },
                    { time: "18:00", name: "산촌", description: "사찰음식과 공연이 있는 특별한 저녁" }
                ]
            }
        ]
    },
    feb12: {
        title: "2월 12일 (목) - 자연 & 뷰",
        options: [
            {
                name: "Option A: 남산 숲속 힐링",
                description: "서울의 상징 남산에서 즐기는 여유",
                activities: [
                    { time: "11:00", name: "블루보틀 삼청", description: "액자 뷰 카페에서 모닝 커피" },
                    { time: "13:00", name: "목멱산방", description: "남산 숲속 비빔밥 점심" },
                    { time: "15:00", name: "남산 둘레길", description: "소화시킬 겸 가벼운 산책" },
                    { time: "18:00", name: "명동 구경", description: "활기찬 명동 거리로 마무리" }
                ]
            },
            {
                name: "Option B: 파노라마 드라이브",
                description: "탁 트인 뷰를 찾아가는 드라이브 코스 (택시 이용)",
                activities: [
                    { time: "11:00", name: "체크아웃 & 짐 보관", description: "호텔 로비" },
                    { time: "12:00", name: "부암동 이동", description: "택시로 이동 (약 20분)" },
                    { time: "12:30", name: "산모퉁이", description: "커피프린스 촬영지, 최고의 전망" },
                    { time: "15:00", name: "청와대 앞길", description: "산책하며 내려오기" }
                ]
            }
        ]
    }
};
