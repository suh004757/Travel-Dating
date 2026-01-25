// Data for Seoul Date Itinerary
const ORAKAI_LOCATION = {
    name: "Orakai Insadong Suites",
    lat: 37.5741,
    lng: 126.9854,
    address: "18 Insadong 4-Gil, Jongno-gu, Seoul"
};

const restaurants = [
    {
        name: "미쉬매쉬 (Mishmash)",
        category: "Hansik",
        area: "Bukchon",
        distance: "5-8 min taxi",
        bestDay: "Feb 11",
        description: "Intimate Hanok with palace wall views offering creative Korean cuisine. Chef-led tasting menu with carefully sourced ingredients",
        platform: "Catchtable",
        link: "https://map.naver.com/p/search/Mishmash%20Seoul",
        rating: "⭐4.4/5",
        lat: 37.582100000000004,
        lng: 126.9934,
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
        link: "https://map.naver.com/p/search/On6.5%20Seoul",
        rating: "⭐4.4/5",
        lat: 37.5901,
        lng: 127.0014,
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
        link: "https://map.naver.com/p/search/Sanchon%20Insadong",
        rating: "⭐4.4/5",
        lat: 37.5981,
        lng: 127.0094,
        type: "restaurant"
    },
    {
        name: "목멱산방 (Mokmyeoksanbang)",
        category: "Hansik / View Restaurant",
        area: "Namsan",
        distance: "10 min taxi",
        bestDay: "Feb 11",
        description: "🏔️ NAMSAN FOREST VIEW - Award-winning bibimbap on Namsan slopes with nature views away from city noise. Intimate setting perfect for couples",
        platform: "Naver Maps",
        link: "https://map.naver.com/p/search/Mokmyeoksanbang",
        rating: "⭐4.4/5",
        lat: 37.6061,
        lng: 127.0174,
        type: "restaurant"
    },
    {
        name: "꽃, 밥에 피다 (A Flower Blossom on the Rice)",
        category: "Hansik / Organic",
        area: "Insadong",
        distance: "5 min walk",
        bestDay: "Feb 10",
        description: "Michelin Green Star organic restaurant with calm, healing atmosphere. Farm-to-table meals with seasonal vegetables and no raw seafood. ⭐4.6/5",
        platform: "Catchtable",
        link: "https://map.naver.com/p/search/A%20Flower%20Blossom%20on%20the%20Rice",
        rating: "⭐4.4/5",
        lat: 37.6381,
        lng: 127.04939999999999,
        type: "restaurant"
    },
    {
        name: "개성만두 궁 (Gaeseong Mandu Koong)",
        category: "Hansik / Dumpling",
        area: "Insadong",
        distance: "3 min walk",
        bestDay: "Feb 10",
        description: "Cozy Hanok serving warm comfort food ideal for gentle arrival evening. Famous for handmade dumplings with various fillings. ⭐4.4/5",
        platform: "Naver Maps",
        link: "https://map.naver.com/p/search/Gaeseong%20Mandu%20Koong",
        rating: "⭐4.4/5",
        lat: 37.646100000000004,
        lng: 127.0574,
        type: "restaurant"
    }
];

const cafes = [
    {
        name: "Green Mile Coffee Bukchon",
        category: "Rooftop/View",
        area: "Bukchon",
        distance: "10 min walk from Anguk",
        bestDay: "Feb 11",
        description: "📸 ROOFTOP VIEW - Famous for its 3rd-floor rooftop offering a stunning panoramic view of tiled Hanok roofs. Modern interior, excellent coffee. (Open 8am-9pm)",
        platform: "Naver Map",
        link: "https://map.naver.com/p/search/Green%20Mile%20Coffee%20Bukchon",
        rating: "⭐4.5/5",
        lat: 37.5805,
        lng: 126.9830,
        type: "cafe"
    },
    {
        name: "Cha-teul (Traditional Tea House)",
        category: "Hanok/Tea",
        area: "Bukchon",
        distance: "15 min walk from Anguk",
        bestDay: "Feb 11",
        description: "🍵 TRADITIONAL VIBE - Beautiful Hanok tea house on a hill with views of the mountains. Floor seating, peaceful garden, best for sunset. (Open 12pm-9pm)",
        platform: "Naver Map",
        link: "https://map.naver.com/p/search/Cha-teul%20Bukchon",
        rating: "⭐4.6/5",
        lat: 37.5840,
        lng: 126.9820,
        type: "cafe"
    },
    {
        name: "Cafe Onion Anguk",
        category: "Hanok/Bakery",
        area: "Anguk",
        distance: "3 min walk from Anguk Stn",
        bestDay: "Feb 10",
        description: "🏚️ TRENDY HANOK - Very popular converted Hanok with open courtyard. Known for Pandoraoro bread and unique mix of industrial & traditional. (Open 7am-10pm)",
        platform: "Catchtable",
        link: "https://map.naver.com/p/search/Cafe%20Onion%20Anguk",
        rating: "⭐4.4/5",
        lat: 37.5775,
        lng: 126.9865,
        type: "cafe"
    },
    {
        name: "Cheongsudang",
        category: "Garden/Atmosphere",
        area: "Ikseon-dong",
        distance: "10 min walk from Orakai",
        bestDay: "Feb 10",
        description: "🏮 LANTERN GARDEN - Incredible entrance with stepping stones and lanterns. Water features inside. Very romantic and photogenic 'Souffle Castella' is famous. (Open 10:30am-9pm)",
        platform: "Naver Map",
        link: "https://map.naver.com/p/search/Cheongsudang%20Ikseon",
        rating: "⭐4.3/5",
        lat: 37.5740,
        lng: 126.9895,
        type: "cafe"
    },
    {
        name: "O'Sulloc Tea House Bukchon",
        category: "Modern Hanok",
        area: "Bukchon",
        distance: "10 min walk from Anguk",
        bestDay: "Feb 11",
        description: "🍵 PREMIUM TEA - 3-story building incorporating a 1930s Hanok. Beautiful terrace views and signature green tea desserts. (Open 11am-8/9pm)",
        platform: "TripAdvisor",
        link: "https://map.naver.com/p/search/Osulloc%20Tea%20House%20Bukchon",
        rating: "⭐4.6/5",
        lat: 37.5795,
        lng: 126.9840,
        type: "cafe"
    },
    {
        name: "Blue Bottle Samcheong",
        category: "View/Modern",
        area: "Samcheong-dong",
        distance: "15 min walk from Anguk",
        bestDay: "Feb 11",
        description: "🖼️ FRAMED VIEW - 2nd floor window frames the Hanok village like a picture. Minimalist design contrasting with the traditional roof views.",
        platform: "Catchtable",
        link: "https://map.naver.com/p/search/Blue%20Bottle%20Samcheong",
        rating: "⭐4.5/5",
        lat: 37.5810,
        lng: 126.9810,
        type: "cafe"
    },
    {
        name: "Sanmotunggi",
        category: "Mountain/City View",
        area: "Buam-dong",
        distance: "20 min taxi",
        bestDay: "Feb 12",
        description: "⛰️ PANORAMIC VIEW - Famous filming location of 'Coffee Prince'. Incredible views of the old city wall and mountains. Relaxing escape. (Open 11am-7pm)",
        platform: "TripAdvisor",
        link: "https://map.naver.com/p/search/Sanmotoonge",
        rating: "⭐4.4/5",
        lat: 37.5950,
        lng: 126.9650,
        type: "cafe"
    },
    {
        name: "Low Roof (Cafe Low Roof)",
        category: "Hanok/Garden",
        area: "Bukchon",
        distance: "5 min walk from Anguk",
        bestDay: "Feb 11",
        description: "🏡 GARDEN VIEW - Modern cafe building with a large glass window overseeing a traditional Hanok guest house (Hwi-gyeom-jae). (Open 10am-8pm)",
        platform: "Naver Map",
        link: "https://map.naver.com/p/search/Cafe%20Low%20Roof",
        rating: "⭐4.3/5",
        lat: 37.5785,
        lng: 126.9850,
        type: "cafe"
    }
];

const routePlans = {
    feb10: {
        title: "Feb 10 - Arrival & Mood",
        activities: [
            { time: "15:00", name: "Check-in at Orakai", description: "Rest and freshen up" },
            { time: "16:30", name: "Cafe Visit: Cheongsudang or Onion", description: "Start with a beautiful cafe vibe" },
            { time: "18:30", name: "Dinner at Gaeseong Mandu Koong", description: "Warm dumplings for dinner" },
            { time: "20:30", name: "Insadong Night Stroll", description: "Quiet evening walk" }
        ]
    },
    feb11: {
        title: "Feb 11 - Main Date Day",
        activities: [
            { time: "10:00", name: "Brunch/Coffee at Green Mile", description: "Rooftop views to start the day" },
            { time: "12:30", name: "Lunch at Mishmash", description: "Fusion Korean dining" },
            { time: "14:30", name: "Tea Time at Cha-teul", description: "Traditional tea with mountain view" },
            { time: "17:00", name: "Bukchon Hanok Walk", description: "Golden hour photos" },
            { time: "19:00", name: "Dinner at On6.5", description: "Makgeolli bar & dining" }
        ]
    },
    feb12: {
        title: "Feb 12 - View & Relax",
        activities: [
            { time: "11:00", name: "Cafe: Blue Bottle Samcheong", description: "Framed Hanok view" },
            { time: "13:00", name: "Lunch at Mokmyeoksanbang", description: "Healthy Bibimbap" },
            { time: "15:00", name: "Sanmotunggi (Optional)", description: "Drive up for mountain views" },
            { time: "18:00", name: "Farewell Dinner", description: "Flexible choice" }
        ]
    }
};
