// Template for New Date Itinerary
// Copy this file and rename it (e.g., tokyo_trip.js)
// Then update the new file name in view.html's loader logic if needed (or just use ?plan=filename)

const ORAKAI_LOCATION = {
    name: "Base Location Name",
    lat: 37.5741, // Update Latitude
    lng: 126.9854, // Update Longitude
    address: "Base Address"
};

const restaurants = [
    {
        name: "Restaurant Name",
        category: "Category (e.g., Italian, Korean)",
        area: "Neighborhood",
        distance: "Distance from base",
        description: "Description of the place...",
        platform: "Naver Map",
        link: "https://m.map.naver.com/search2/search.naver?query=RestaurantName",
        rating: "⭐0.0/5",
        lat: 37.5821,
        lng: 126.9934,
        type: "restaurant"
    }
    // Add more restaurants here...
];

const cafes = [
    {
        name: "Cafe Name",
        category: "Category (e.g., Rooftop, Bakery)",
        area: "Neighborhood",
        distance: "Distance",
        description: "Description...",
        platform: "Naver Map",
        link: "https://m.map.naver.com/search2/search.naver?query=CafeName",
        rating: "⭐0.0/5",
        lat: 37.5805,
        lng: 126.9830,
        type: "cafe"
    }
    // Add more cafes here...
];

const routePlans = {
    day1: {
        title: "Day 1 Title",
        options: [
            {
                name: "Option A",
                description: "Description of option A",
                activities: [
                    { time: "10:00", name: "Activity 1", description: "Desc" },
                    { time: "12:00", name: "Activity 2", description: "Desc" }
                ]
            }
        ]
    }
    // Add more days...
};
