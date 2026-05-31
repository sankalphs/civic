AUTHORITIES = {
    "pothole": {
        "name": "Greater Bengaluru Authority (GBA)",
        "category": "Roads & Infrastructure",
        "helpline": "1800-425-2424",
        "email": "complaints@gba.karnataka.gov.in",
        "keywords": ["pothole", "road", "footpath", "sidewalk", "asphalt", "crack", "damage", "hole", "broken road", "bump"]
    },
    "garbage": {
        "name": "GBA - Sanitation",
        "category": "Solid Waste Management",
        "helpline": "1800-425-2424",
        "email": "sanitation@gba.karnataka.gov.in",
        "keywords": ["garbage", "waste", "trash", "dustbin", "bin", "litter", "dirty", "smell", "stink", "collection"]
    },
    "water": {
        "name": "BWSSB",
        "category": "Water Supply & Sewerage",
        "helpline": "1916",
        "email": "complaints@bwssb.karnataka.gov.in",
        "keywords": ["water", "leak", "pipe", "sewage", "drain", "sewer", "overflow", "tap", "no water", "water supply", "burst pipe"]
    },
    "electricity": {
        "name": "BESCOM",
        "category": "Electricity Supply",
        "helpline": "1912",
        "email": "complaints@bescom.karnataka.gov.in",
        "keywords": ["power", "electricity", "transformer", "streetlight", "street light", "wire", "cable", "outage", "cut", "power cut", "electric"]
    },
    "flood": {
        "name": "GBA - Stormwater Drains",
        "category": "Drainage & Flooding",
        "helpline": "1800-425-2424",
        "email": "drains@gba.karnataka.gov.in",
        "keywords": ["flood", "waterlogging", "rain", "storm", "drain", "clogged", "stagnant", "water log", "flooding"]
    },
    "encroachment": {
        "name": "BDA",
        "category": "Encroachment & Land Use",
        "helpline": "080-2224-4444",
        "email": "info@bdabangalore.org",
        "keywords": ["encroach", "illegal", "construction", "unauthorized", "occupation", "illegal building"]
    }
}


def classify_issue(text: str) -> dict:
    if not text or len(text.strip()) == 0:
        return {"category": None, "confidence": 0, "authority": None, "matched_keywords": []}

    lower = text.lower().strip()
    words = lower.split()

    best_match = None
    best_score = 0
    best_keywords = []

    for category, authority in AUTHORITIES.items():
        score = 0
        matched = []

        for keyword in authority["keywords"]:
            if keyword in lower:
                score += len(keyword.split())
                matched.append(keyword)

        if score > best_score:
            best_score = score
            best_match = category
            best_keywords = matched

    if not best_match:
        return {
            "category": "unknown",
            "confidence": 0,
            "authority": None,
            "matched_keywords": []
        }

    confidence = min(best_score / max(len(words) * 0.3, 1), 1)

    return {
        "category": best_match,
        "confidence": round(confidence * 100) / 100,
        "authority": AUTHORITIES[best_match],
        "matched_keywords": best_keywords
    }


def get_authority_for_category(category: str) -> dict:
    return AUTHORITIES.get(category, {})
