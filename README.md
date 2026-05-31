# CivicBLR - Bangalore Civic Issue Resolver

A local-language civic issue resolver for Bangalore. Citizens report potholes, garbage, water leaks, or power issues via voice, and the app auto-classifies, geotags, and routes them to the right authority.

## Quick Start

### Option 1: Start both servers (Windows)
```bash
start.bat
```

### Option 2: Manual start

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### URLs
- **Frontend:** http://localhost:5173
- **Admin Dashboard:** http://localhost:5173/admin
- **API Docs:** http://localhost:8000/docs

## Features

- **Voice Input:** Speak your issue in English (Web Speech API)
- **Auto-Classification:** Keyword-based categorization into 6 issue types
- **GPS + Map:** Auto-detect location or tap on Leaflet map
- **Photo Evidence:** Capture or upload photos
- **Smart Routing:** Automatically routes to GBA, BESCOM, BWSSB, or BDA
- **Tracking ID:** Get a tracking ID (BLR-2026-XXXXXX) to monitor status
- **Admin Dashboard:** Map view + list view with status management

## Issue Categories

| Category | Authority | Helpline |
|----------|-----------|----------|
| Potholes/Roads | GBA | 1800-425-2424 |
| Garbage/Waste | GBA Sanitation | 1800-425-2424 |
| Water/Sewage | BWSSB | 1916 |
| Electricity | BESCOM | 1912 |
| Drainage/Flooding | GBA Stormwater | 1800-425-2424 |
| Encroachment | BDA | 080-2224-4444 |

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + Leaflet + PWA
- **Backend:** Python FastAPI + SQLAlchemy + SQLite
- **Maps:** OpenStreetMap tiles (free, no API key)
- **Geocoding:** Nominatim (free, rate-limited)
- **Voice:** Web Speech API (built into Chrome/Edge)
- **Classification:** Keyword-based (zero cost, instant)

## Project Structure

```
civic/
├── frontend/          # React PWA
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API, geocoder, classifier
│   │   └── data/         # Authority mapping
│   └── vite.config.js
├── backend/           # FastAPI server
│   ├── app/
│   │   ├── main.py       # API endpoints
│   │   ├── models.py     # Database models
│   │   └── classifier.py # Issue classification
│   └── requirements.txt
└── start.bat          # Start both servers
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/issues` | Create new issue |
| GET | `/api/issues` | List issues (filter by status/category) |
| GET | `/api/issues/{id}` | Get issue by ID |
| GET | `/api/issues/track/{tracking_id}` | Track by tracking ID |
| PATCH | `/api/issues/{id}/status` | Update status |
| GET | `/api/stats` | Dashboard statistics |
