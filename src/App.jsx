import { useState, useCallback, useEffect, useRef } from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import useGeolocation from "./hooks/useGeolocation";
import { searchNearbyNightShops } from "./utils/api"; // Ensure this uses the new Place.searchNearby()
import Header from "./components/Header";
import BottomSheet from "./components/BottomSheet";
import LocationPermission from "./components/LocationPermission";
import RecenterButton from "./components/RecenterButton";

// Ensure this matches your Replit Secret key exactly
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

function App() {
  const {
    position,
    error: geoError,
    isLoading: geoLoading,
    refresh: refreshLocation,
  } = useGeolocation();
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const mapRef = useRef(null);

  // Updated search logic to handle the new Places API requirements
  const searchShops = useCallback(
    async (mapInstance) => {
      const targetMap = mapInstance || mapRef.current;
      if (!position || !targetMap) return;

      setIsSearching(true);
      setSearchError(null);

      try {
        const results = await searchNearbyNightShops(
          targetMap,
          { lat: position.lat, lng: position.lng },
          2000,
        );
        setShops(results);

        const nearestOpen = results.find(
          (s) => s.isOpen === true && !s.isFlagged,
        );
        if (nearestOpen) setSelectedShop(nearestOpen);
      } catch (err) {
        console.error("Search error:", err);
        setSearchError(
          "API Error: Ensure 'Places API' is enabled in Google Console.",
        );
      } finally {
        setIsSearching(false);
      }
    },
    [position],
  );

  const handleMapLoad = (ev) => {
    mapRef.current = ev.map;
    if (position) searchShops(ev.map);
  };

  useEffect(() => {
    if (position && mapRef.current) searchShops();
  }, [position, searchShops]);

  if (!position || geoError) {
    return (
      <LocationPermission
        error={geoError}
        onRetry={refreshLocation}
        isLoading={geoLoading}
      />
    );
  }

  // Blunt feedback if you forgot to set the Secret in Replit
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === "your_api_key_here") {
    return (
      <div className="fixed inset-0 bg-night-900 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-neon-red font-bold text-2xl mb-4">
          API KEY MISSING
        </h1>
        <p className="text-night-400 mb-4">
          Paste your key into Replit Secrets as <b>VITE_GOOGLE_MAPS_API_KEY</b>.
        </p>
        <code className="p-3 bg-black text-neon-green rounded">
          InvalidKeyMapError Detection Active
        </code>
      </div>
    );
  }

  return (
    <APIProvider
      apiKey={GOOGLE_MAPS_API_KEY}
      solutionChannel="GMP_GCC_public_0"
    >
      <div className="h-full w-full relative overflow-hidden bg-night-900">
        <Header
          onRefresh={() => {
            refreshLocation();
            searchShops();
          }}
          isLoading={isSearching || geoLoading}
          shopCount={
            shops.filter((s) => s.isOpen === true && !s.isFlagged).length
          }
        />

        <div className="absolute inset-0">
          <Map
            defaultCenter={position}
            defaultZoom={15}
            mapId="DEMO_MAP_ID" // REQUIRED for AdvancedMarkers
            onIdle={handleMapLoad}
            disableDefaultUI={true}
          >
            {/* User Location Marker */}
            <AdvancedMarker position={position}>
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg shadow-blue-500/50" />
            </AdvancedMarker>

            {/* Night Shop Markers */}
            {shops.map((shop) => (
              <AdvancedMarker
                key={shop.id}
                position={shop.location}
                onClick={() => setSelectedShop(shop)}
              >
                <span
                  className={`text-2xl ${shop.isFlagged ? "opacity-50" : ""}`}
                >
                  {shop.isOpen ? "🏪" : "🌑"}
                </span>
              </AdvancedMarker>
            ))}
          </Map>
        </div>

        <RecenterButton
          onClick={() => mapRef.current?.panTo(position)}
          isVisible={!!selectedShop}
        />

        <BottomSheet
          shops={shops}
          selectedShop={selectedShop}
          onSelectShop={setSelectedShop}
          isLoading={isSearching}
        />
      </div>
    </APIProvider>
  );
}

export default App;
