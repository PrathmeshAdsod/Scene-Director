import React, { useState, useMemo } from 'react';
import type { Shot } from '../types';
import ShotCard from './ShotCard';
import AnimaticPlayer from './AnimaticPlayer';
import { SpinnerIcon, DownloadIcon } from './icons';

interface ShotlistScreenProps {
  story: string;
  shots: Shot[];
  onGenerateImage: (shotId: string) => void;
  onUpdatePrompt: (shotId: string, newPrompt: string) => void;
  onGenerateAll: () => void;
  onExport: () => void;
  isGeneratingAll: boolean;
  progress: number;
}

const ShotlistScreen: React.FC<ShotlistScreenProps> = ({ 
    story, 
    shots, 
    onGenerateImage, 
    onUpdatePrompt, 
    onGenerateAll, 
    onExport, 
    isGeneratingAll, 
    progress,
}) => {
    const [highlightedShotId, setHighlightedShotId] = useState<string | null>(null);
    const allGenerated = shots.length > 0 && shots.every(shot => shot.status === 'success' || shot.status === 'failed');
    
    const storyParts = useMemo(() => {
        const parts = story.split(/(\[SHOT:shot_\d+\])/g);
        const processed = [];
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const match = part.match(/\[SHOT:(shot_\d+)\]/);
            if (match) {
                const shotId = match[1];
                // Find the text associated with this shot ID
                const nextPart = parts[i + 1] || '';
                processed.push({ shotId, text: nextPart.trim() });
                i++; // Skip the next part since we've consumed it
            } else if (part.trim()) {
                // This is text before the first shot marker
                 processed.push({ shotId: null, text: part.trim() });
            }
        }
        return processed;
    }, [story]);
    
  return (
    <div className="max-w-screen-xl mx-auto p-4 md:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-3xl font-bold text-slate-800">Your Story & Shots</h2>
            <div className="flex gap-3 w-full sm:w-auto">
                <button 
                    onClick={onGenerateAll} 
                    disabled={isGeneratingAll}
                    className="w-1/2 sm:w-auto flex-1 inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors">
                     {isGeneratingAll && <SpinnerIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />}
                     {isGeneratingAll ? 'Generating...' : 'Generate All Shots'}
                </button>
                 <button 
                    onClick={onExport} 
                    disabled={!allGenerated || isGeneratingAll}
                    className="w-1/2 sm:w-auto flex-1 inline-flex items-center justify-center px-5 py-2.5 border border-slate-300 text-sm font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
                     <DownloadIcon className="h-5 w-5 mr-2" />
                     Export ZIP
                </button>
            </div>
        </div>

        {isGeneratingAll && (
            <div className="w-full bg-slate-200 rounded-full h-4 relative overflow-hidden">
                <div className="bg-blue-500 h-4 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">{Math.round(progress)}% Complete</span>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 items-start">
            {/* Left Column: Story */}
            <div className="lg:sticky top-28 bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80 prose max-w-none">
                 <h3 className="text-xl font-bold text-slate-800 mb-4">Scene Storyline</h3>
                 <div className="space-y-4 text-slate-600">
                     {storyParts.map(({ shotId, text }, index) => (
                        <p 
                            key={index}
                            onMouseEnter={() => setHighlightedShotId(shotId)}
                            onMouseLeave={() => setHighlightedShotId(null)}
                            className="transition-colors duration-200 p-2 -m-2 rounded-md hover:bg-blue-50"
                        >
                            {text}
                        </p>
                     ))}
                 </div>
            </div>

            {/* Right Column: Shots & Animatic */}
            <div className="space-y-6">
                <AnimaticPlayer shots={shots} />
                {shots.map(shot => (
                    <ShotCard 
                        key={shot.id} 
                        shot={shot} 
                        onGenerate={onGenerateImage}
                        onUpdatePrompt={onUpdatePrompt}
                        isHighlighted={highlightedShotId === shot.id}
                    />
                ))}
            </div>
        </div>
    </div>
  );
};

export default ShotlistScreen;