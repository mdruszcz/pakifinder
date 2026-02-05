# 🌙 Night Shop Finder - Belgium

A mobile-first web app that finds open night shops near you in Belgium. No more guessing if that "nachtwinkel" is actually open at 2 AM.

![Night Shop Finder](https://img.shields.io/badge/Made%20for-Belgium-yellow?style=flat-square)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-5-purple?style=flat-square)

## Features

- **Instant Location** - Gets your position immediately
- **Open Now Filter** - Only shows shops that are actually open
- **Dark Mode Map** - Easy on the eyes at 2 AM
- **Visual Status** - Green = Open, Yellow = Flagged/Unknown, Red = Closed
- **Crowdsourced Reports** - Users can flag shops that are actually closed
- **One-Tap Navigation** - Open directions in Google Maps or Waze
- **Belgian Focus** - Searches for "night shop", "nachtwinkel", "alimentation", "tabac"

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Maps**: Google Maps JavaScript API + Places API
- **Styling**: Custom dark theme with neon accents
- **Deployment**: Vercel (Free tier)

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd night-shop-finder
npm install
```

### 2. Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - **Maps JavaScript API**
   - **Places API**
4. Create credentials (API Key)
5. (Recommended) Restrict the key to your domain

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your API key:

```
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) on your phone or browser.

## Deploy to Vercel

### Option 1: Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option 2: GitHub Integration

1. Push to GitHub
2. Import in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variable: `VITE_GOOGLE_MAPS_API_KEY`
4. Deploy!

## Project Structure

```
night-shop-finder/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── BottomSheet.jsx    # Draggable shop list
│   │   ├── Header.jsx         # Top bar with time
│   │   ├── LocationPermission.jsx
│   │   ├── MapComponent.jsx   # Google Maps integration
│   │   ├── RecenterButton.jsx
│   │   └── ShopCard.jsx       # Individual shop display
│   ├── hooks/
│   │   └── useGeolocation.js  # Location hook
│   ├── utils/
│   │   ├── api.js            # Places API & helpers
│   │   └── mapStyles.js      # Dark map theme
│   ├── App.jsx               # Main component
│   ├── index.css             # Tailwind + custom styles
│   └── main.jsx              # Entry point
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
├── vercel.json
└── vite.config.js
```

## Customization

### Search Keywords

Edit `src/utils/api.js` to modify search terms:

```javascript
const SEARCH_KEYWORDS = [
  'night shop',
  'nachtwinkel',
  'alimentation',
  // Add more...
];
```

### Search Radius

In `src/App.jsx`, change the radius (in meters):

```javascript
const results = await searchNearbyNightShops(
  mapRef.current,
  { lat: position.lat, lng: position.lng },
  3000 // 3km radius
);
```

### Flag Duration

In `src/utils/api.js`, adjust how long flags last:

```javascript
const FLAG_DURATION = 2 * 60 * 60 * 1000; // 2 hours
```

## API Usage Notes

- The free tier of Google Maps has generous limits
- Places API charges per request after free quota
- Consider caching results for production use
- Monitor usage in Google Cloud Console

## Future Improvements

- [ ] Backend for persistent crowdsourced data
- [ ] User accounts for trusted flaggers
- [ ] Push notifications when near open shop
- [ ] Opening hours verification system
- [ ] Photo uploads from users
- [ ] Multi-language support (FR/NL/EN)

## License

MIT - Built with ☕ at 2 AM

---

Made for late-night snack runs in Belgium 🇧🇪
