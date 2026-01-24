import json
import random

# Insadong base coordinates
BASE_LAT = 37.5741
BASE_LNG = 126.9854

# Area coordinates (approximate)
AREA_COORDS = {
    "Insadong": (37.5741, 126.9854),
    "Jongno": (37.5717, 126.9850),
    "Bukchon": (37.5825, 126.9850),
    "Anguk": (37.5765, 126.9835),
    "Namsan": (37.5512, 126.9882),
    "Hyehwa": (37.5820, 127.0020),
    "Gwangjang Area": (37.5705, 127.0095),
    "Myeongdong": (37.5636, 126.9830),
    "Cheonggyecheon": (37.5695, 126.9780),
    "Cheonggyecheon Area": (37.5695, 126.9780),
    "Buamdong": (37.5900, 126.9650),
    "Hongdae": (37.5563, 126.9236),
    "Jung": (37.5636, 126.9830),
    "Jongno/Jung": (37.5695, 126.9780),
    "Near Myeongdong": (37.5636, 126.9830),
    "Songpa": (37.5145, 127.1060)
}

def get_coords(area):
    """Get coordinates for an area with small random offset"""
    base = AREA_COORDS.get(area, (BASE_LAT, BASE_LNG))
    # Add small random offset (about 100-200m)
    lat = base[0] + (random.random() - 0.5) * 0.002
    lng = base[1] + (random.random() - 0.5) * 0.002
    return round(lat, 6), round(lng, 6)

# Read from Python file (simplified - just copy the data)
restaurants_data = [
    ["발우공양 (Balwoo Gongyang)", "Hanjeongsik / Temple Food", "Jongno", "8 min walk", "Feb 11", 
     "Michelin-starred temple cuisine in serene setting with private rooms available. Buddhist vegetarian courses showcase seasonal ingredients without raw seafood", 
     "Catchtable", "https://www.catchtable.co.kr/"],
    
    ["미쉬매쉬 (Mishmash)", "Hansik", "Bukchon", "5-8 min taxi", "Feb 11", 
     "Intimate Hanok with palace wall views offering creative Korean cuisine. Chef-led tasting menu with carefully sourced ingredients", 
     "Catchtable", "https://www.catchtable.co.kr/"],
    
    ["온6.5 (On6.5)", "Makgeolli Bar", "Bukchon", "5-8 min taxi", "Feb 11", 
     "Sophisticated modern space with creative fermented dishes and premium makgeolli pairings. Unique atmosphere in renovated Hanok", 
     "Catchtable", "https://www.catchtable.co.kr/"],
    
    ["산촌 (Sanchon)", "Hanjeongsik / Temple Food", "Insadong", "5 min walk", "Feb 11", 
     "Beautiful traditional house with plant-filled courtyard and occasional cultural performances. Seasonal temple food without raw seafood", 
     "TripAdvisor", "https://www.tripadvisor.com/Search?q=Sanchon+Insadong+Seoul"],
    
    ["목멱산방 (Mokmyeoksanbang)", "Hansik / View Restaurant", "Namsan", "10 min taxi", "Feb 11", 
     "🏔️ NAMSAN FOREST VIEW - Award-winning bibimbap on Namsan slopes with nature views away from city noise. Intimate setting perfect for couples", 
     "Google Maps", "https://www.google.com/maps/search/Mokmyeoksanbang+Namsan+Seoul"],
    
    ["진진 (Jin Jin)", "Korean BBQ", "Jongno", "10 min walk", "Feb 11", 
     "Premium Korean BBQ with intimate booth seating and excellent service. High-quality beef from trusted suppliers", 
     "Catchtable", "https://www.catchtable.co.kr/"],
    
    ["궁 (Koong)", "Hanjeongsik", "Insadong", "7 min walk", "Either", 
     "Elegant traditional Korean course meals in refined Hanok atmosphere. Multi-course meal showcasing various cooking techniques without raw ingredients", 
     "Google Maps", "https://www.google.com/maps/search/Koong+Restaurant+Insadong"],
    
    ["남산서울타워 한쿡 (N Seoul Tower Hancook)", "View Restaurant", "Namsan", "15 min taxi", "Feb 11", 
     "🌆 NAMSAN VIEW HIGHLIGHT - Rotating restaurant with panoramic Seoul views serving Korean fusion cuisine. Romantic setting with food presentation focused on aesthetic beauty", 
     "Google Maps", "https://www.google.com/maps/search/N+Seoul+Tower+Hancook"],
    
    ["꽃, 밥에 피다 (A Flower Blossom on the Rice)", "Hansik / Organic", "Insadong", "5 min walk", "Feb 10", 
     "Michelin Green Star organic restaurant with calm, healing atmosphere. Farm-to-table meals with seasonal vegetables and no raw seafood. ⭐4.6/5", 
     "Catchtable", "https://www.catchtable.co.kr/"],
    
    ["개성만두 궁 (Gaeseong Mandu Koong)", "Hansik / Dumpling", "Insadong", "3 min walk", "Feb 10", 
     "Cozy Hanok serving warm comfort food ideal for gentle arrival evening. Famous for handmade dumplings with various fillings. ⭐4.4/5", 
     "Google Maps", "https://www.google.com/maps/search/Gaeseong+Mandu+Koong+Insadong"],
]

# Convert to JavaScript format
js_restaurants = []
for r in restaurants_data:
    lat, lng = get_coords(r[2])  # r[2] is area
    rating = "Michelin ⭐" if "Michelin" in r[5] else (r[5].split("⭐")[-1] if "⭐" in r[5] else "⭐4.5/5")
    
    js_restaurants.append({
        "name": r[0],
        "category": r[1],
        "area": r[2],
        "distance": r[3],
        "bestDay": r[4],
        "description": r[5],
        "platform": r[6],
        "link": r[7],
        "rating": rating,
        "lat": lat,
        "lng": lng,
        "type": "restaurant"
    })

# Print JavaScript code
print("// Generated restaurant data")
print("const restaurants = " + json.dumps(js_restaurants, indent=2, ensure_ascii=False) + ";")
