import { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, List, MapPin } from 'lucide-react';
import ShopCard from './ShopCard';

const BottomSheet = ({ shops, selectedShop, onSelectShop, onFlagShop, isLoading }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const sheetRef = useRef(null);
  const listRef = useRef(null);

  // Scroll to selected shop
  useEffect(() => {
    if (selectedShop && listRef.current) {
      const selectedElement = listRef.current.querySelector(`[data-shop-id="${selectedShop.id}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedShop]);

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = startY - currentY;
    
    if (diff > 50 && !isExpanded) {
      setIsExpanded(true);
      setIsDragging(false);
    } else if (diff < -50 && isExpanded) {
      setIsExpanded(false);
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const openShopsCount = shops.filter(s => s.isOpen === true && !s.isFlagged).length;

  return (
    <div
      ref={sheetRef}
      className={`
        fixed bottom-0 left-0 right-0 z-50 
        bg-night-800 bottom-sheet
        transition-all duration-300 ease-out
        ${isExpanded ? 'h-[75vh]' : 'h-auto max-h-[40vh]'}
      `}
      style={{ touchAction: 'none' }}
    >
      {/* Handle bar */}
      <div
        className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={toggleExpanded}
      >
        <div className="w-12 h-1.5 bg-night-600 rounded-full mb-3" />
        
        {/* Header */}
        <div className="flex items-center justify-between w-full px-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-neon-green/10">
              <List className="w-5 h-5 text-neon-green" />
            </div>
            <div>
              <h2 className="font-display font-bold text-white">
                {isLoading ? 'Searching...' : `${shops.length} Shops Found`}
              </h2>
              {!isLoading && openShopsCount > 0 && (
                <p className="text-sm text-neon-green">
                  {openShopsCount} confirmed open
                </p>
              )}
            </div>
          </div>
          
          <button 
            className="p-2 rounded-lg hover:bg-night-700 transition-colors"
            aria-label={isExpanded ? 'Collapse list' : 'Expand list'}
          >
            {isExpanded ? (
              <ChevronDown className="w-6 h-6 text-night-400" />
            ) : (
              <ChevronUp className="w-6 h-6 text-night-400" />
            )}
          </button>
        </div>
      </div>

      {/* Shop list */}
      <div 
        ref={listRef}
        className="overflow-y-auto px-4 pb-6 safe-bottom"
        style={{ 
          maxHeight: isExpanded ? 'calc(75vh - 80px)' : 'calc(40vh - 80px)',
          overscrollBehavior: 'contain'
        }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="spinner mb-4" />
            <p className="text-night-400 font-medium">Finding night shops...</p>
          </div>
        ) : shops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <MapPin className="w-12 h-12 text-night-500 mb-4" />
            <p className="text-white font-display font-bold mb-2">No shops found</p>
            <p className="text-night-400 text-sm text-center">
              Try expanding your search area or check back later
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {shops.map((shop) => (
              <div 
                key={shop.id} 
                data-shop-id={shop.id}
                onClick={() => onSelectShop(shop)}
              >
                <ShopCard
                  shop={shop}
                  isSelected={selectedShop?.id === shop.id}
                  onFlag={onFlagShop}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BottomSheet;
