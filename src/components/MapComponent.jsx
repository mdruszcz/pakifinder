import { useCallback, useState, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Navigation, Star, AlertTriangle } from 'lucide-react';
import { mapOptions } from '../utils/mapStyles';
import { formatDistance, getNavigationUrl } from '../utils/api';

const libraries = ['places'];

const containerStyle = {
  width: '100%',
  height: '100%',
};

// Custom marker SVGs
const createMarkerIcon = (color, isFlagged = false) => {
  const baseColor = isFlagged ? '#ffcc00' : color;
  return {
    path: 'M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z',
    fillColor: baseColor,
    fillOpacity: 1,
    strokeColor: '#0a0a0f',
    strokeWeight: 2,
    scale: 1.8,
    anchor: { x: 12, y: 21 },
  };
};

// User location marker
const userLocationIcon = {
  path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
  fillColor: '#00d4ff',
  fillOpacity: 1,
  strokeColor: '#0a0a0f',
  strokeWeight: 3,
  scale: 1.5,
  anchor: { x: 12, y: 21 },
};

const MapComponent = ({ 
  userLocation, 
  shops, 
  selectedShop, 
  onSelectShop,
  onMapLoad,
  apiKey 
}) => {
  const [map, setMap] = useState(null);
  const [activeInfoWindow, setActiveInfoWindow] = useState(null);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries,
  });

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
    mapRef.current = mapInstance;
    onMapLoad?.(mapInstance);
  }, [onMapLoad]);

  const onUnmount = useCallback(() => {
    setMap(null);
    mapRef.current = null;
  }, []);

  // Center on selected shop
  useEffect(() => {
    if (map && selectedShop) {
      map.panTo(selectedShop.location);
      map.setZoom(17);
      setActiveInfoWindow(selectedShop.id);
    }
  }, [map, selectedShop]);

  // Fit bounds to show all shops
  useEffect(() => {
    if (map && shops.length > 0 && userLocation && !selectedShop) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(userLocation);
      shops.slice(0, 5).forEach(shop => {
        bounds.extend(shop.location);
      });
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 350, left: 50 });
    }
  }, [map, shops, userLocation, selectedShop]);

  const handleMarkerClick = (shop) => {
    onSelectShop(shop);
    setActiveInfoWindow(shop.id);
  };

  const handleInfoWindowClose = () => {
    setActiveInfoWindow(null);
  };

  const handleNavigate = (shop, useWaze = false) => {
    const url = getNavigationUrl(shop.location, useWaze);
    window.open(url, '_blank');
  };

  const getMarkerColor = (shop) => {
    if (shop.isFlagged) return '#ffcc00';
    if (shop.isOpen === true) return '#00ff88';
    return '#ff3366';
  };

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-night-900">
        <div className="text-center px-6">
          <p className="text-neon-red font-display font-bold text-xl mb-2">Map Error</p>
          <p className="text-night-400">Failed to load Google Maps</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-night-900">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={userLocation || { lat: 50.8503, lng: 4.3517 }} // Default to Brussels
      zoom={15}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      {/* User location marker */}
      {userLocation && (
        <Marker
          position={userLocation}
          icon={userLocationIcon}
          zIndex={1000}
          title="Your location"
        />
      )}

      {/* Shop markers */}
      {shops.map((shop) => (
        <Marker
          key={shop.id}
          position={shop.location}
          icon={createMarkerIcon(getMarkerColor(shop), shop.isFlagged)}
          onClick={() => handleMarkerClick(shop)}
          zIndex={selectedShop?.id === shop.id ? 999 : 100}
          animation={selectedShop?.id === shop.id ? window.google.maps.Animation.BOUNCE : null}
        />
      ))}

      {/* Info window for selected shop */}
      {activeInfoWindow && selectedShop && (
        <InfoWindow
          position={selectedShop.location}
          onCloseClick={handleInfoWindowClose}
          options={{
            pixelOffset: new window.google.maps.Size(0, -40),
            maxWidth: 280,
          }}
        >
          <div className="bg-night-800 p-3 min-w-[240px] -m-3">
            <h3 className="font-display font-bold text-white text-lg mb-1">
              {selectedShop.name}
            </h3>
            
            <div className="flex items-center gap-2 mb-2">
              {selectedShop.isFlagged ? (
                <span className="flex items-center gap-1 text-neon-yellow text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Reported Closed
                </span>
              ) : selectedShop.isOpen ? (
                <span className="flex items-center gap-1 text-neon-green text-sm">
                  <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                  Open Now
                </span>
              ) : (
                <span className="text-neon-yellow text-sm">Hours Unknown</span>
              )}
              <span className="text-night-400 text-sm">
                • {formatDistance(selectedShop.distance)}
              </span>
            </div>

            {selectedShop.rating && (
              <div className="flex items-center gap-1 mb-3">
                <Star className="w-4 h-4 text-neon-yellow fill-neon-yellow" />
                <span className="text-white text-sm">{selectedShop.rating}</span>
                <span className="text-night-400 text-sm">({selectedShop.totalRatings})</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleNavigate(selectedShop, false)}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg
                         bg-neon-green/20 text-neon-green text-sm font-medium
                         hover:bg-neon-green/30 transition-colors"
              >
                <Navigation className="w-4 h-4" />
                Google
              </button>
              <button
                onClick={() => handleNavigate(selectedShop, true)}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg
                         bg-neon-blue/20 text-neon-blue text-sm font-medium
                         hover:bg-neon-blue/30 transition-colors"
              >
                <span className="font-bold">W</span>
                Waze
              </button>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default MapComponent;
