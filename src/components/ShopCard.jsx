import { useState } from 'react';
import { Navigation, Phone, AlertTriangle, Check, X, Star, Clock, ChevronRight } from 'lucide-react';
import { formatDistance, getNavigationUrl, flagShop, clearShopFlag } from '../utils/api';

const ShopCard = ({ shop, onFlag, isSelected = false }) => {
  const [showFlagConfirm, setShowFlagConfirm] = useState(false);
  const [localFlagged, setLocalFlagged] = useState(shop.isFlagged);

  const handleNavigate = (e, useWaze = false) => {
    e.stopPropagation();
    const url = getNavigationUrl(shop.location, useWaze);
    window.open(url, '_blank');
  };

  const handleFlag = (e) => {
    e.stopPropagation();
    setShowFlagConfirm(true);
  };

  const confirmFlag = (e, isClosed) => {
    e.stopPropagation();
    if (isClosed) {
      flagShop(shop.id);
      setLocalFlagged(true);
      onFlag?.(shop.id, true);
    } else {
      clearShopFlag(shop.id);
      setLocalFlagged(false);
      onFlag?.(shop.id, false);
    }
    setShowFlagConfirm(false);
  };

  const getStatusColor = () => {
    if (localFlagged) return 'text-neon-yellow';
    if (shop.isOpen === true) return 'text-neon-green';
    return 'text-neon-yellow';
  };

  const getStatusText = () => {
    if (localFlagged) return 'Reported Closed';
    if (shop.isOpen === true) return 'Open Now';
    return 'Hours Unknown';
  };

  return (
    <div 
      className={`
        relative p-4 rounded-2xl transition-all duration-300
        ${isSelected 
          ? 'bg-night-600 border-2 border-neon-green/50' 
          : 'bg-night-700 border border-night-600 hover:border-night-500'
        }
      `}
    >
      {/* Main content */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Shop name */}
          <h3 className="font-display text-lg font-bold text-white truncate">
            {shop.name}
          </h3>
          
          {/* Status and distance */}
          <div className="flex items-center gap-3 mt-1">
            <span className={`flex items-center gap-1.5 text-sm font-medium ${getStatusColor()}`}>
              <span className={`w-2 h-2 rounded-full ${getStatusColor()} bg-current ${shop.isOpen && !localFlagged ? 'animate-pulse' : ''}`} />
              {getStatusText()}
            </span>
            <span className="text-night-400 text-sm">
              {formatDistance(shop.distance)}
            </span>
          </div>

          {/* Address */}
          <p className="text-night-400 text-sm mt-2 truncate">
            {shop.address}
          </p>

          {/* Rating */}
          {shop.rating && (
            <div className="flex items-center gap-1.5 mt-2">
              <Star className="w-4 h-4 text-neon-yellow fill-neon-yellow" />
              <span className="text-white text-sm font-medium">{shop.rating}</span>
              <span className="text-night-400 text-sm">({shop.totalRatings})</span>
            </div>
          )}
        </div>

        {/* Navigate button */}
        <button
          onClick={(e) => handleNavigate(e, false)}
          className="flex-shrink-0 w-14 h-14 rounded-xl bg-neon-green/10 border border-neon-green/30 
                     flex items-center justify-center text-neon-green
                     hover:bg-neon-green/20 active:scale-95 transition-all"
          aria-label="Navigate"
        >
          <Navigation className="w-6 h-6" />
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-night-600">
        {/* Waze button */}
        <button
          onClick={(e) => handleNavigate(e, true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
                     bg-night-600 text-white text-sm font-medium
                     hover:bg-night-500 active:scale-[0.98] transition-all"
        >
          <span className="text-neon-blue">W</span>
          Waze
          <ChevronRight className="w-4 h-4 text-night-400" />
        </button>

        {/* Flag button */}
        <button
          onClick={handleFlag}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
                     text-sm font-medium transition-all active:scale-[0.98]
                     ${localFlagged 
                       ? 'bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/30' 
                       : 'bg-night-600 text-white hover:bg-night-500'
                     }`}
        >
          <AlertTriangle className="w-4 h-4" />
          {localFlagged ? 'Flagged' : 'Report'}
        </button>
      </div>

      {/* Flag confirmation overlay */}
      {showFlagConfirm && (
        <div 
          className="absolute inset-0 bg-night-800/95 backdrop-blur-sm rounded-2xl 
                     flex flex-col items-center justify-center p-4 animate-fade-in z-10"
        >
          <Clock className="w-10 h-10 text-neon-yellow mb-3" />
          <p className="text-white font-display font-bold text-center mb-1">
            Is this shop actually open?
          </p>
          <p className="text-night-400 text-sm text-center mb-4">
            Help others find open shops
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={(e) => confirmFlag(e, true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                       bg-neon-red/10 border border-neon-red/30 text-neon-red font-medium
                       hover:bg-neon-red/20 active:scale-[0.98] transition-all"
            >
              <X className="w-5 h-5" />
              Closed
            </button>
            <button
              onClick={(e) => confirmFlag(e, false)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                       bg-neon-green/10 border border-neon-green/30 text-neon-green font-medium
                       hover:bg-neon-green/20 active:scale-[0.98] transition-all"
            >
              <Check className="w-5 h-5" />
              Open
            </button>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setShowFlagConfirm(false); }}
            className="mt-3 text-night-400 text-sm hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default ShopCard;
