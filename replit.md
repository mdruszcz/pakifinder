# Night Shop Finder

## Overview
A React-based web application that helps users find night shops (convenience stores, late-night shops) near their location using Google Maps integration.

## Tech Stack
- **Frontend Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with PostCSS
- **Maps**: Google Maps JavaScript API via @react-google-maps/api
- **Icons**: Lucide React

## Project Structure
```
├── src/
│   ├── components/       # React components
│   │   ├── BottomSheet.jsx
│   │   ├── Header.jsx
│   │   ├── LocationPermission.jsx
│   │   ├── MapComponent.jsx
│   │   ├── RecenterButton.jsx
│   │   └── ShopCard.jsx
│   ├── hooks/           # Custom React hooks
│   │   └── useGeolocation.js
│   ├── utils/           # Utility functions
│   │   ├── api.js
│   │   └── mapStyles.js
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles with Tailwind
├── public/              # Static assets
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # Dependencies and scripts
```

## Running the Application
```bash
npm run dev     # Start development server on port 5000
npm run build   # Build for production
npm run preview # Preview production build
```

## Environment Variables
- `VITE_GOOGLE_MAPS_API_KEY` - Required Google Maps API key with Maps JavaScript API and Places API enabled

## Configuration
- Development server runs on port 5000
- Configured for Replit environment with all hosts allowed
