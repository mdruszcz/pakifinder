import { MapPin, Navigation, AlertCircle, RefreshCw } from 'lucide-react';

const LocationPermission = ({ error, onRetry, isLoading }) => {
  const isPermissionDenied = error?.code === 1;

  return (
    <div className="fixed inset-0 bg-night-900 flex flex-col items-center justify-center p-6 z-50">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #00ff88 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-sm">
        {/* Icon */}
        <div className={`
          w-24 h-24 rounded-3xl mb-8 flex items-center justify-center
          ${isPermissionDenied 
            ? 'bg-neon-red/10 border-2 border-neon-red/30' 
            : 'bg-neon-green/10 border-2 border-neon-green/30 animate-pulse'
          }
        `}>
          {isPermissionDenied ? (
            <AlertCircle className="w-12 h-12 text-neon-red" />
          ) : isLoading ? (
            <Navigation className="w-12 h-12 text-neon-green animate-bounce" />
          ) : (
            <MapPin className="w-12 h-12 text-neon-green" />
          )}
        </div>

        {/* Title */}
        <h1 className="font-display font-bold text-3xl text-white text-center mb-3">
          {isPermissionDenied ? 'Location Blocked' : isLoading ? 'Finding You...' : 'Enable Location'}
        </h1>

        {/* Description */}
        <p className="text-night-400 text-center mb-8 leading-relaxed">
          {isPermissionDenied ? (
            <>
              Location access is required to find night shops near you.
              <span className="block mt-2 text-neon-yellow text-sm">
                Please enable location in your browser settings.
              </span>
            </>
          ) : isLoading ? (
            'Getting your location to find the nearest open night shops...'
          ) : (
            'We need your location to show you the closest open night shops right now.'
          )}
        </p>

        {/* Error message */}
        {error && !isPermissionDenied && (
          <div className="w-full p-4 mb-6 rounded-xl bg-neon-red/10 border border-neon-red/30">
            <p className="text-neon-red text-sm text-center">{error.message}</p>
          </div>
        )}

        {/* Retry button */}
        {!isLoading && (
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl
                     bg-neon-green text-night-900 font-display font-bold text-lg
                     hover:bg-neon-green/90 active:scale-[0.98] transition-all
                     shadow-lg shadow-neon-green/20"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="spinner" />
            <p className="text-neon-green font-medium">Locating...</p>
          </div>
        )}

        {/* Help text for permission denied */}
        {isPermissionDenied && (
          <div className="mt-8 p-4 rounded-xl bg-night-800 border border-night-600">
            <p className="text-white font-medium mb-2">How to enable location:</p>
            <ol className="text-night-400 text-sm space-y-1 list-decimal list-inside">
              <li>Tap the lock icon in your browser's address bar</li>
              <li>Find "Location" in the permissions</li>
              <li>Change to "Allow"</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPermission;
