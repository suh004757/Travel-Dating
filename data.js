// Data for Seoul Date Itinerary
const ORAKAI_LOCATION = {
    name: "Orakai Insadong Suites",
    lat: 37.5741,
    lng: 126.9854,
    address: "18 Insadong 4-Gil, Jongno-gu, Seoul"
};

const restaurants = [
    // LUXURY & SPECIAL OCCASION
    {
        name: "발우공양 (Balwoo Gongyang)",
        category: "Hanjeongsik / Temple Food",
        area: "Jongno",
        distance: "8 min walk",
        bestDay: "Feb 11",
        description: "Michelin-starred temple cuisine in serene setting with private rooms available. Buddhist vegetarian courses showcase seasonal ingredients without raw seafood",
        platform: "Catchtable",
        link: "https://www.catchtable.co.kr/",
        rating: "Michelin ⭐",
        lat: 37.5717,
        lng: 126.9850,
        type: "restaurant"
    },
    {
        name: "미쉬매쉬 (Mishmash)",
        category: "Hansik",
        area: "Bukchon",
        distance: "5-8 min taxi",
        bestDay: "Feb 11",
        description: "Intimate Hanok with palace wall views offering creative Korean cuisine. Chef-led tasting menu with carefully sourced ingredients",
        platform: "Catchtable",
        link: "https://www.catchtable.co.kr/",
        rating: "⭐4.7/5",
        lat: 37.5825,
        lng: 126.9850,
        type: "restaurant"
    },
    {
        name: "온6.5 (On6.5)",
        category: "Makgeolli Bar",
        area: "Bukchon",
        distance: "5-8 min taxi",
        bestDay: "Feb 11",
        description: "Sophisticated modern space with creative fermented dishes and premium makgeolli pairings. Unique atmosphere in renovated Hanok",
        platform: "Catchtable",
        link: "https://www.catchtable.co.kr/",
        rating: "⭐4.6/5",
        lat: 37.5820,
        lng: 126.9840,
        type: "restaurant"
    },
    {
        name: "산촌 (Sanchon)",
        category: "Hanjeongsik / Temple Food",
        area: "Insadong",
        distance: "5 min walk",
        bestDay: "Feb 11",
        description: "Beautiful traditional house with plant-filled courtyard and occasional cultural performances. Seasonal temple food without raw seafood",
        platform: "TripAdvisor",
        link: "https://www.tripadvisor.com/Search?q=Sanchon+Insadong+Seoul",
        rating: "⭐4.5/5",
        lat: 37.5735,
        lng: 126.9860,
        type: "restaurant"
    },
    {
        name: "목멱산방 (Mokmyeoksanbang)",
        category: "Hansik / View Restaurant",
        area: "Namsan",
        distance: "10 min taxi",
        bestDay: "Feb 11",
        description: "🏔️ NAMSAN FOREST VIEW - Award-winning bibimbap on Namsan slopes with nature views away from city noise. Intimate setting perfect for couples",
        platform: "Google Maps",
        link: "https://www.google.com/maps/search/Mokmyeoksanbang+Namsan+Seoul",
        rating: "⭐4.6/5",
        lat: 37.5505,
        lng: 126.9910,
        type: "restaurant"
    },
    {
        name: "남산서울타워 한쿡 (N Seoul Tower Hancook)",
        category: "View Restaurant",
        area: "Namsan",
        distance: "15 min taxi",
        bestDay: "Feb 11",
        description: "🌆 NAMSAN VIEW HIGHLIGHT - Rotating restaurant with panoramic Seoul views serving Korean fusion cuisine. Romantic setting with food presentation focused on aesthetic beauty",
        platform: "Google Maps",
        link: "https://www.google.com/maps/search/N+Seoul+Tower+Hancook",
        rating: "⭐4.4/5",
        lat: 37.5512,
        lng: 126.9882,
        type: "restaurant"
    },
    // CASUAL & HIGHLY RATED
    {
        name: "꽃, 밥에 피다 (A Flower Blossom on the Rice)",
        category: "Hansik / Organic",
        area: "Insadong",
        distance: "5 min walk",
        bestDay: "Feb 10",
        description: "Michelin Green Star organic restaurant with calm, healing atmosphere. Farm-to-table meals with seasonal vegetables and no raw seafood",
        platform: "Catchtable",
        link: "https://www.catchtable.co.kr/",
        rating: "⭐4.6/5",
        lat: 37.5750,
        lng: 126.9865,
        type: "restaurant"
    },
    {
        name: "개성만두 궁 (Gaeseong Mandu Koong)",
        category: "Hansik / Dumpling",
        area: "Insadong",
        distance: "3 min walk",
        bestDay: "Feb 10",
        description: "Cozy Hanok serving warm comfort food ideal for gentle arrival evening. Famous for handmade dumplings with various fillings",
        platform: "Google Maps",
        link: "https://www.google.com/maps/search/Gaeseong+Mandu+Koong+Insadong",
        rating: "⭐4.4/5",
        lat: 37.5745,
        lng: 126.9858,
        type: "restaurant"
    },
    {
        name: "지리산 (Jirisan)",
        category: "Hansik / Tofu",
        area: "Insadong",
        distance: "5 min walk",
        bestDay: "Feb 10",
        description: "Traditional tofu-focused restaurant with quiet ambiance and easy-to-digest meals. All dishes centered around silken tofu preparations",
        platform: "Google Maps",
        link: "https://www.google.com/maps/search/Jirisan+Restaurant+Insadong",
        rating: "⭐4.5/5",
        lat: 37.5738,
        lng: 126.9862,
        type: "restaurant"
    },
    {
        name: "북촌손만두 (Bukchon Son Mandu)",
        category: "Dumplings",
        area: "Anguk",
        distance: "2 min walk from Anguk Stn",
        bestDay: "Feb 11",
        description: "Legendary dumpling spot with perfect wrapper texture. Cozy atmosphere, incredibly popular but fast turnover",
        platform: "Google Maps",
        link: "https://www.google.com/maps/search/Bukchon+Son+Mandu+Anguk",
        rating: "⭐4.5/5",
        lat: 37.5765,
        lng: 126.9835,
        type: "restaurant"
    }
];

const activities = [
    // FEB 10 - ARRIVAL DAY
    {
        name: "Orakai to Insadong Main Street",
        type: "Walk",
        area: "Insadong",
        duration: "5 min",
        bestDay: "Feb 10",
        description: "Gentle evening stroll to decompress after flight. Lined with galleries and traditional shops without crowds",
        bestTime: "Evening",
        link: "https://www.google.com/maps/dir/Orakai+Insadong+Suites/Insadong+Street",
        rating: "TripAdvisor: 4.5/5",
        lat: 37.5730,
        lng: 126.9860,
        activityType: "activity"
    },
    {
        name: "Ssamziegil Shopping Complex",
        type: "Cultural Spot",
        area: "Insadong",
        duration: "30 min",
        bestDay: "Feb 10",
        description: "Five-story spiral mall with hand-crafted goods, antiques, and rooftop terrace. Explore at your own pace with café breaks",
        bestTime: "Evening",
        link: "https://www.google.com/maps/search/Ssamziegil+Insadong",
        rating: "TripAdvisor: 4.4/5",
        lat: 37.5735,
        lng: 126.9855,
        activityType: "activity"
    },
    {
        name: "Traditional Tea House - Osulloc",
        type: "Café",
        area: "Insadong",
        duration: "45 min",
        bestDay: "Feb 10",
        description: "Premium Korean green tea tasting in serene Hanok setting. Soft interior lighting, traditional seating perfect for conversation",
        bestTime: "Evening",
        link: "https://www.google.com/maps/search/Osulloc+Insadong",
        rating: "TripAdvisor: 4.6/5",
        lat: 37.5728,
        lng: 126.9858,
        activityType: "activity"
    },
    // FEB 11 - MAIN DAY
    {
        name: "Changdeokgung Palace & Secret Garden Tour",
        type: "Cultural Spot",
        area: "Jongno",
        duration: "90-120 min",
        bestDay: "Feb 11",
        description: "UNESCO World Heritage site with authentic restoration. The Secret Garden (Biwon) is most romantic part - requires advance booking. English guides available",
        bestTime: "Day",
        link: "https://www.google.com/maps/search/Changdeokgung+Palace+Seoul",
        rating: "TripAdvisor: 4.7/5",
        lat: 37.5794,
        lng: 126.9910,
        activityType: "activity"
    },
    {
        name: "Bukchon Hanok Village Main Route",
        type: "Walk",
        area: "Bukchon",
        duration: "60 min",
        bestDay: "Feb 11",
        description: "Scenic traditional neighborhood with preserved wooden houses. Best route: start at top (near palace), wind down through Gahoe Museum area",
        bestTime: "Day (10am-3pm)",
        link: "https://www.google.com/maps/search/Bukchon+Hanok+Village",
        rating: "TripAdvisor: 4.6/5",
        lat: 37.5825,
        lng: 126.9850,
        activityType: "activity"
    },
    {
        name: "Namsan Seoul Tower (N Tower)",
        type: "Viewpoint",
        area: "Namsan",
        duration: "60-90 min",
        bestDay: "Feb 11",
        description: "Iconic observation deck with 360° Seoul views. Cable car available (reduces walking by 70%). Best at sunset for romantic atmosphere",
        bestTime: "Sunset/Evening",
        link: "https://www.google.com/maps/search/N+Seoul+Tower",
        rating: "TripAdvisor: 4.6/5",
        lat: 37.5512,
        lng: 126.9882,
        activityType: "activity"
    },
    {
        name: "Cheonggyecheon Stream Full Walk",
        type: "Walk",
        area: "Jongno/Jung",
        duration: "45 min",
        bestDay: "Feb 11",
        description: "Peaceful 10.8km urban stream restoration project. Walk 2-3km section from Cheonggyecheon Plaza area. Tree-lined, water fountains, excellent for photos",
        bestTime: "Day/Evening",
        link: "https://www.google.com/maps/search/Cheonggyecheon+Stream",
        rating: "TripAdvisor: 4.5/5",
        lat: 37.5695,
        lng: 126.9780,
        activityType: "activity"
    },
    {
        name: "Jogyesa Temple & Buddhist Ceremony",
        type: "Cultural Spot",
        area: "Jongno",
        duration: "30-45 min",
        bestDay: "Feb 11",
        description: "Active Buddhist temple in city center. Check if evening chanting ceremony (17:00) is available. English explanations provided",
        bestTime: "Day/Evening",
        link: "https://www.google.com/maps/search/Jogyesa+Temple+Seoul",
        rating: "TripAdvisor: 4.6/5",
        lat: 37.5710,
        lng: 126.9830,
        activityType: "activity"
    },
    // FEB 12
    {
        name: "Gwangjang Market (Culinary & Cultural)",
        type: "Cultural Spot",
        area: "Jongno",
        duration: "60 min",
        bestDay: "Feb 12",
        description: "Historic 1905-established market with street food specialties. Best: early morning (8-10am) for fewer crowds and freshest items",
        bestTime: "Morning",
        link: "https://www.google.com/maps/search/Gwangjang+Market+Seoul",
        rating: "TripAdvisor: 4.4/5",
        lat: 37.5705,
        lng: 127.0095,
        activityType: "activity"
    },
    {
        name: "경복궁 (Gyeongbokgung Palace) Grand Tour",
        type: "Cultural Spot",
        area: "Jongno",
        duration: "120 min",
        bestDay: "Feb 12",
        description: "Largest of the 5 royal palaces with extensive grounds. Multiple museum galleries within. Changing of guard ceremony every 2 hours. English audio guides",
        bestTime: "Day",
        link: "https://www.google.com/maps/search/Gyeongbokgung+Palace+Seoul",
        rating: "TripAdvisor: 4.7/5",
        lat: 37.5788,
        lng: 126.9770,
        activityType: "activity"
    }
];

const routePlans = {
    feb10: {
        title: "Feb 10 - Arrival Day (Low Energy)",
        items: [
            { time: "16:00", name: "Check-in at Orakai Insadong Suites", description: "Rest and freshen up" },
            { time: "17:30", name: "Gentle walk to Insadong Main Street", description: "5 min stroll to decompress" },
            { time: "18:00", name: "Dinner at 개성만두 궁 or 지리산", description: "Warm comfort food (3-5 min walk)" },
            { time: "19:30", name: "Traditional Tea at Osulloc", description: "Quiet conversation time (45 min)" },
            { time: "20:30", name: "Light browse at Ssamziegil", description: "Rooftop terrace views" },
            { time: "21:30", name: "Return to hotel", description: "Early rest for jet lag recovery" }
        ]
    },
    feb11: {
        title: "Feb 11 - Main Date Day",
        items: [
            { time: "09:30", name: "Breakfast near hotel", description: "Casual local spot" },
            { time: "10:30", name: "Changdeokgung Palace & Secret Garden", description: "2-hour guided tour (book in advance)" },
            { time: "13:00", name: "Lunch at 북촌손만두 or 미쉬매쉬", description: "Bukchon area dining" },
            { time: "14:30", name: "Bukchon Hanok Village Walk", description: "60 min scenic stroll with photos" },
            { time: "16:00", name: "Café break at Café Layered", description: "Hanok courtyard rest" },
            { time: "17:00", name: "Taxi to Namsan", description: "10-15 min ride" },
            { time: "17:30", name: "Namsan Seoul Tower Sunset", description: "Cable car up, observation deck" },
            { time: "19:00", name: "Dinner at 목멱산방 or N Tower Hancook", description: "Romantic view dining" },
            { time: "21:00", name: "Cheonggyecheon Stream Night Walk", description: "Illuminated stream stroll" },
            { time: "22:00", name: "Return to hotel", description: "Taxi from stream area" }
        ]
    },
    feb12: {
        title: "Feb 12 - Flexible Day",
        items: [
            { time: "09:00", name: "Gwangjang Market Morning Visit", description: "Street food breakfast (if energy allows)" },
            { time: "10:30", name: "Gyeongbokgung Palace", description: "2-hour tour with guard ceremony" },
            { time: "13:00", name: "Lunch in Samcheong-dong", description: "Trendy neighborhood behind palace" },
            { time: "14:30", name: "Free time / Shopping", description: "Myeongdong or rest at hotel" },
            { time: "18:00", name: "Farewell dinner at 발우공양 or 산촌", description: "Special temple food experience" },
            { time: "20:00", name: "Pack and prepare for departure", description: "Early rest" }
        ]
    }
};
