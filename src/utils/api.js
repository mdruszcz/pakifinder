// Night Shop Finder - Modern Google Places API (2026 Compatible)
const SEARCH_KEYWORDS = [
  "night shop",
  "nachtwinkel",
  "alimentation",
  "alimentation générale",
  "épicerie de nuit",
  "tabac",
  "convenience store",
  "late night shop",
];

const FLAGGED_SHOPS_KEY = "nightshop_flagged";
const FLAG_DURATION = 2 * 60 * 60 * 1000; // 2 hours

// --- Flagging Logic (Remains unchanged) ---
export const getFlaggedShops = () => {
  try {
    const stored = localStorage.getItem(FLAGGED_SHOPS_KEY);
    if (!stored) return {};
    const flagged = JSON.parse(stored);
    const now = Date.now();
    const cleaned = Object.entries(flagged).reduce((acc, [id, timestamp]) => {
      if (now - timestamp < FLAG_DURATION) acc[id] = timestamp;
      return acc;
    }, {});
    localStorage.setItem(FLAGGED_SHOPS_KEY, JSON.stringify(cleaned));
    return cleaned;
  } catch {
    return {};
  }
};

export const isShopFlagged = (placeId) => !!getFlaggedShops()[placeId];

// --- Modern Search Logic (The FIX) ---
/**
 * Search for nearby night shops using the NEW Place class
 */
export const searchNearbyNightShops = async (map, location, radius = 2000) => {
  if (!window.google || !window.google.maps) {
    throw new Error("Google Maps not loaded");
  }

  // Import the places library dynamically
  const placesLibrary = await google.maps.importLibrary("places");
  const { Place, SearchByTextRankPreference, SearchNearbyRankPreference } =
    placesLibrary;

  const allResults = [];
  const seenIds = new Set();
  let firstError = null;

  const addPlaces = (places = []) => {
    places.forEach((place) => {
      if (!place?.id || seenIds.has(place.id)) return;
      seenIds.add(place.id);
      allResults.push(place);
    });
  };

  // 1) Keyword-based text search (actual keyword use)
  if (typeof Place?.searchByText === "function") {
    for (const keyword of SEARCH_KEYWORDS) {
      const request = {
        fields: [
          "id",
          "displayName",
          "formattedAddress",
          "location",
          "isOpenNow",
          "rating",
          "userRatingCount",
          "photos",
        ],
        textQuery: keyword,
        locationBias: {
          circle: {
            center: location,
            radius,
          },
        },
        maxResultCount: 20,
        rankPreference: SearchByTextRankPreference?.DISTANCE,
      };

      try {
        const { places } = await Place.searchByText(request);
        addPlaces(places);
      } catch (err) {
        if (!firstError) firstError = err;
        console.warn(`Text search failed for keyword: ${keyword}`, err);
      }
    }
  }

  // 2) Fallback nearby search by types if text search yields nothing
  if (!allResults.length && typeof Place?.searchNearby === "function") {
    const nearbyRequest = {
      fields: [
        "id",
        "displayName",
        "formattedAddress",
        "location",
        "isOpenNow",
        "rating",
        "userRatingCount",
        "photos",
      ],
      locationRestriction: {
        center: location,
        radius,
      },
      includedPrimaryTypes: ["convenience_store", "grocery_store", "store"],
      maxResultCount: 20,
      rankPreference: SearchNearbyRankPreference?.DISTANCE,
    };

    try {
      const { places } = await Place.searchNearby(nearbyRequest);
      addPlaces(places);
    } catch (err) {
      if (!firstError) firstError = err;
      console.warn("Nearby fallback search failed", err);
    }
  }

  // If all API calls failed, surface the real failure to the UI
  if (!allResults.length && firstError) {
    throw firstError;
  }

  // Process and sort
  return allResults
    .filter((place) => place?.location)
    .map((place) => ({
      id: place.id,
      name: place.displayName,
      address: place.formattedAddress,
      location: {
        lat: place.location.lat(),
        lng: place.location.lng(),
      },
      isOpen: place.isOpenNow,
      rating: place.rating,
      totalRatings: place.userRatingCount,
      photos: place.photos,
      isFlagged: isShopFlagged(place.id),
      distance: calculateDistance(
        location.lat,
        location.lng,
        place.location.lat(),
        place.location.lng(),
      ),
    }))
    .filter((place) => place.isOpen !== false)
    .sort((a, b) => {
      if (a.isOpen === true && b.isOpen !== true) return -1;
      if (b.isOpen === true && a.isOpen !== true) return 1;
      if (a.isFlagged && !b.isFlagged) return 1;
      if (!a.isFlagged && b.isFlagged) return -1;
      return a.distance - b.distance;
    });
};

// --- Utilities ---
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const flagShop = (placeId) => {
  try {
    const stored = localStorage.getItem(FLAGGED_SHOPS_KEY);
    const flagged = stored ? JSON.parse(stored) : {};
    flagged[placeId] = Date.now();
    localStorage.setItem(FLAGGED_SHOPS_KEY, JSON.stringify(flagged));
  } catch {
    // Ignore
  }
};

export const clearShopFlag = (placeId) => {
  try {
    const stored = localStorage.getItem(FLAGGED_SHOPS_KEY);
    if (!stored) return;
    const flagged = JSON.parse(stored);
    delete flagged[placeId];
    localStorage.setItem(FLAGGED_SHOPS_KEY, JSON.stringify(flagged));
  } catch {
    // Ignore
  }
};

export const formatDistance = (m) =>
  m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;

export const getNavigationUrl = (dest) =>
  `https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}&travelmode=walking`;

export const getCurrentTime = () =>
  new Date().toLocaleTimeString("en-BE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
