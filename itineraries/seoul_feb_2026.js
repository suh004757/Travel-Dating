// Data for Seoul Date Itinerary (Feb 10-12, 2026)
const ORAKAI_LOCATION = {
    name: 'Orakai Insadong Suites',
    lat: 37.5741,
    lng: 126.9854,
    address: '18 Insadong 4-gil, Jongno-gu, Seoul'
};

const restaurants = [
    {
        name: 'Mishmash',
        category: 'Korean Fusion',
        area: 'Bukchon',
        distance: '5-8 min by taxi',
        description: 'Hanok-style restaurant with creative course menu.',
        platform: 'Naver Map',
        link: 'https://m.map.naver.com/search2/search.naver?query=%EB%AF%B8%EC%89%AC%EB%A7%A4%EC%89%AC',
        rating: '4.4/5',
        lat: 37.5821,
        lng: 126.9934,
        type: 'restaurant'
    },
    {
        name: 'Gaeseong Mandu Gung',
        category: 'Dumpling Hotpot',
        area: 'Insadong',
        distance: '3 min walk',
        description: 'Long-running dumpling specialist with mild broth.',
        platform: 'Naver Map',
        link: 'https://m.map.naver.com/search2/search.naver?query=%EA%B0%9C%EC%84%B1%EB%A7%8C%EB%91%90%20%EA%B6%81',
        rating: '4.4/5',
        lat: 37.6461,
        lng: 127.0574,
        type: 'restaurant'
    }
];

const cafes = [
    {
        name: 'Onion Anguk',
        category: 'Bakery / Hanok',
        area: 'Anguk',
        distance: '3 min walk from Anguk Station',
        description: 'Popular bakery cafe with hanok-style seating.',
        platform: 'Naver Map',
        link: 'https://m.map.naver.com/search2/search.naver?query=%EC%96%B4%EB%8B%88%EC%96%B8%20%EC%95%88%EA%B5%AD',
        rating: '4.4/5',
        lat: 37.5775,
        lng: 126.9865,
        type: 'cafe'
    },
    {
        name: 'Cheongsudang',
        category: 'Garden / Ambience',
        area: 'Ikseon-dong',
        distance: '10 min walk from Orakai',
        description: 'Photo-friendly garden cafe with desserts.',
        platform: 'Naver Map',
        link: 'https://m.map.naver.com/search2/search.naver?query=%EC%B2%AD%EC%88%98%EB%8B%B9',
        rating: '4.3/5',
        lat: 37.5740,
        lng: 126.9895,
        type: 'cafe'
    }
];

const routePlans = {
    feb10: {
        title: 'Feb 10 (Tue) - Arrival and First Impressions',
        options: [
            {
                name: 'Option A: Evening Walk',
                description: 'Relaxed evening route after check-in.',
                activities: [
                    { time: '15:00', name: 'Orakai Check-in', description: 'Hotel check-in and rest' },
                    { time: '16:30', name: 'Cheongsudang', description: 'Dessert break' },
                    { time: '19:00', name: 'Gaeseong Mandu Gung', description: 'Hotpot dinner' }
                ]
            }
        ]
    },
    feb11: {
        title: 'Feb 11 (Wed) - Main Date Day',
        options: [
            {
                name: 'Option A: Bukchon Mood',
                description: 'Cafe and dinner focused route.',
                activities: [
                    { time: '11:00', name: 'Onion Anguk', description: 'Coffee and pastry' },
                    { time: '13:00', name: 'Mishmash', description: 'Lunch course' }
                ]
            }
        ]
    },
    feb12: {
        title: 'Feb 12 (Thu) - Wrap-up',
        options: [
            {
                name: 'Option A: Light City Route',
                description: 'Easy day before departure.',
                activities: [
                    { time: '11:00', name: 'Checkout and Luggage Hold', description: 'Hotel lobby' },
                    { time: '13:00', name: 'City Walk', description: 'Final walk and photos' }
                ]
            }
        ]
    }
};
