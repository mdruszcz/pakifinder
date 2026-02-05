import { Crosshair } from 'lucide-react';

const RecenterButton = ({ onClick, isVisible = true }) => {
  if (!isVisible) return null;

  return (
    <button
      onClick={onClick}
      className="fixed right-4 bottom-[45vh] z-40
                 w-12 h-12 rounded-xl
                 bg-night-800 border border-night-600
                 flex items-center justify-center
                 shadow-lg shadow-night-900/50
                 hover:border-neon-blue/50 hover:bg-night-700
                 active:scale-95 transition-all"
      aria-label="Center on my location"
    >
      <Crosshair className="w-5 h-5 text-neon-blue" />
    </button>
  );
};

export default RecenterButton;
