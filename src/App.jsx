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
        const details = err?.message ? ` (${err.message})` : "";
        setSearchError(
          "API Error: Ensure 'Places API' is enabled in Google Console.",
          `Could not load nearby places. Check that Places API is enabled, billing is active, and key restrictions allow Maps JavaScript + Places${details}`,
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
@@ -127,32 +128,33 @@ function App() {
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
          error={searchError}
        />
      </div>
    </APIProvider>
  );
}

export default App;
