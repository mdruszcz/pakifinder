import { Moon, RefreshCw, MapPin } from 'lucide-react';
import { getCurrentTime } from '../utils/api';
import { useState, useEffect } from 'react';

const Header = ({ onRefresh, isLoading, shopCount }) => {
  const [time, setTime] = useState(getCurrentTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getCurrentTime());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 safe-top">
      <div className="bg-gradient-to-b from-night-900 via-night-900/95 to-transparent pb-8 pt-4 px-4">
        <div className="flex items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-green/20 to-neon-blue/20 
                            flex items-center justify-center border border-neon-green/30">
                <Moon className="w-6 h-6 text-neon-green" />
              </div>
              {shopCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-neon-green 
                               text-night-900 text-xs font-bold flex items-center justify-center">
                  {shopCount > 9 ? '9+' : shopCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-white tracking-wide">
                NIGHT<span className="text-neon-green">SHOP</span>
              </h1>
              <p className="text-night-400 text-xs font-medium tracking-wider">
                FINDER • BELGIUM
              </p>
            </div>
          </div>

          {/* Time and refresh */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-display font-bold text-2xl text-neon-green neon-text">
                {time}
              </p>
            </div>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={`
                w-11 h-11 rounded-xl bg-night-700 border border-night-600
                flex items-center justify-center
                hover:bg-night-600 hover:border-neon-green/30
                active:scale-95 transition-all
                ${isLoading ? 'animate-spin' : ''}
              `}
              aria-label="Refresh shops"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'text-neon-green' : 'text-white'}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
