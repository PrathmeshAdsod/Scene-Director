import React, { useState, useEffect, useRef } from 'react';
import type { Shot } from '../types';
import { PlayIcon, PauseIcon } from './icons';

interface AnimaticPlayerProps {
  shots: Shot[];
}

const AnimaticPlayer: React.FC<AnimaticPlayerProps> = ({ shots }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);
  
  const imageShots = shots.filter(shot => shot.image);

  useEffect(() => {
    if (isPlaying && imageShots.length > 0) {
      const currentShotDuration = (imageShots[currentIndex]?.duration || 2) * 1000;
      intervalRef.current = window.setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % imageShots.length);
      }, currentShotDuration);
    } else if (intervalRef.current) {
      window.clearTimeout(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        window.clearTimeout(intervalRef.current);
      }
    };
  }, [isPlaying, currentIndex, imageShots]);
  
  // Reset to first frame if playing and at the end
  useEffect(() => {
      if(isPlaying && currentIndex === imageShots.length - 1) {
          const lastShotDuration = (imageShots[currentIndex]?.duration || 2) * 1000;
          const timer = setTimeout(() => {
              setCurrentIndex(0);
              setIsPlaying(false);
          }, lastShotDuration);
          return () => clearTimeout(timer);
      }
  }, [currentIndex, isPlaying, imageShots]);

  const togglePlay = () => {
    if (imageShots.length === 0) return;
    if (currentIndex === imageShots.length - 1 && !isPlaying) {
        setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  if (shots.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80 space-y-4">
      <h2 className="text-xl font-bold text-center text-slate-800">Animatic Preview</h2>
       {imageShots.length === 0 ? (
            <div className="aspect-video bg-slate-200 rounded-lg flex flex-col items-center justify-center text-center p-4">
                <h3 className="font-semibold text-slate-700">Ready to Preview</h3>
                <p className="text-slate-500 text-sm">Generate images to watch your scene come to life.</p>
            </div>
        ) : (
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <img
                    key={imageShots[currentIndex].id}
                    src={`data:image/png;base64,${imageShots[currentIndex].image}`}
                    alt={imageShots[currentIndex].title}
                    className="w-full h-full object-contain animate-fade-in"
                />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <button
                    onClick={togglePlay}
                    className="bg-black/50 text-white rounded-full p-3 hover:bg-black/75 transition-colors"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
                </button>
                </div>
            </div>
       )}
      <div className="flex space-x-2 overflow-x-auto p-2 -mx-2">
        {shots.map((shot) => {
          const shotImageIndex = imageShots.findIndex(s => s.id === shot.id);
          return (
          <div
            key={shot.id}
            onClick={() => shot.image && setCurrentIndex(shotImageIndex)}
            className={`w-24 h-14 flex-shrink-0 rounded-md overflow-hidden cursor-pointer ring-2 ring-offset-2 transition-all ${currentIndex === shotImageIndex ? 'ring-blue-500' : 'ring-transparent'}`}
          >
            {shot.image ? (
              <img src={`data:image/png;base64,${shot.image}`} alt={shot.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-200" />
            )}
          </div>
        )})}
      </div>
    </div>
  );
};

export default AnimaticPlayer;