import React, { useState, useCallback } from 'react';
import type { SceneConfig, AnchorImage, Mood, AspectRatio, Quality } from '../types';
import { MOODS, ASPECT_RATIOS, QUALITIES } from '../constants';
import { UploadIcon, SpinnerIcon } from './icons';

interface ComposeScreenProps {
  onGenerate: (config: SceneConfig) => void;
  onDemo: () => void;
  isLoading: boolean;
}

const ComposeScreen: React.FC<ComposeScreenProps> = ({ onGenerate, onDemo, isLoading }) => {
  const [seed, setSeed] = useState('');
  const [anchors, setAnchors] = useState<AnchorImage[]>([]);
  const [mood, setMood] = useState<Mood>('Cinematic');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [quality, setQuality] = useState<Quality>('Draft');
  const [continuityNotes, setContinuityNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (anchors.length + files.length > 4) {
      setError("You can upload a maximum of 4 anchor images.");
      return;
    }
    setError(null);

    const newAnchors: AnchorImage[] = [...anchors];
    for (const file of Array.from(files)) {
      const { fileToBase64 } = await import('../services/geminiService');
      const { base64, mimeType } = await fileToBase64(file);
      newAnchors.push({ id: `${file.name}-${Date.now()}`, file, base64, mimeType });
    }
    setAnchors(newAnchors);
  }, [anchors]);
  
  const removeAnchor = (id: string) => {
    setAnchors(anchors.filter(anchor => anchor.id !== id));
  };

  const handleSubmit = () => {
    if (!seed.trim()) {
        setError("Please enter a scene idea to get started.");
        return;
    }
    setError(null);
    onGenerate({ seed, anchors, mood, aspectRatio, quality, continuityNotes });
  };
  
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">StoryDirector AI</h1>
        <p className="mt-4 text-lg text-slate-600">Turn your vision into a cinematic storyboard in seconds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Panel: Controls */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200/80 space-y-6">
          <div>
            <label htmlFor="seed" className="block text-sm font-semibold text-slate-700">1. Scene Idea</label>
            <input
              type="text"
              id="seed"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              className="mt-2 block w-full bg-slate-50 border border-slate-300 rounded-lg shadow-sm py-3 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g. Rooftop duel at dusk — spy vs wizard"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
                <label htmlFor="mood" className="block text-sm font-semibold text-slate-700">2. Mood</label>
                <select id="mood" value={mood} onChange={(e) => setMood(e.target.value as Mood)} className="mt-2 block w-full bg-slate-50 border border-slate-300 rounded-lg shadow-sm py-3 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    {MOODS.map(m => <option key={m}>{m}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="aspect" className="block text-sm font-semibold text-slate-700">3. Aspect</label>
                <select id="aspect" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} className="mt-2 block w-full bg-slate-50 border border-slate-300 rounded-lg shadow-sm py-3 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    {ASPECT_RATIOS.map(a => <option key={a}>{a}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="quality" className="block text-sm font-semibold text-slate-700">4. Quality</label>
                <select id="quality" value={quality} onChange={(e) => setQuality(e.target.value as Quality)} className="mt-2 block w-full bg-slate-50 border border-slate-300 rounded-lg shadow-sm py-3 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    {QUALITIES.map(q => <option key={q}>{q}</option>)}
                </select>
            </div>
          </div>
           <div>
            <label htmlFor="continuity" className="block text-sm font-semibold text-slate-700">5. Continuity Notes (Optional)</label>
            <textarea
              id="continuity"
              value={continuityNotes}
              onChange={(e) => setContinuityNotes(e.target.value)}
              rows={2}
              className="mt-2 block w-full bg-slate-50 border border-slate-300 rounded-lg shadow-sm py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g. Character wears a red scarf, holds a glowing orb."
            />
             <p className="text-xs text-slate-500 mt-1">Details to keep consistent across all shots.</p>
          </div>
        </div>

        {/* Right Panel: Anchors */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200/80 flex flex-col">
           <label className="block text-sm font-semibold text-slate-700">6. Character Anchors (Optional)</label>
           <p className="text-xs text-slate-500 mb-4">Upload 1-4 images for character consistency (face + full-body preferred).</p>
          <div className="flex-grow border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center relative min-h-[200px]">
            {anchors.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                {anchors.map(anchor => (
                  <div key={anchor.id} className="relative group aspect-square">
                    <img src={URL.createObjectURL(anchor.file)} alt="anchor" className="w-full h-full object-cover rounded-lg" />
                    <button onClick={() => removeAnchor(anchor.id)} className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-red-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
                <div className="text-center">
                    <UploadIcon className="mx-auto h-12 w-12 text-slate-400" />
                    <p className="mt-2 text-sm text-slate-500">Drag & drop or <span className="font-semibold text-blue-600">click to upload</span></p>
                </div>
            )}
             <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>
        </div>
      </div>
        
      {error && <p className="text-center text-red-600 mt-4">{error}</p>}

      <div className="flex justify-center items-center space-x-4 pt-6">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-base font-semibold rounded-full shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
        >
          {isLoading ? <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" /> : null}
          {isLoading ? 'Directing...' : 'Write My Scene'}
        </button>
        <button
          onClick={onDemo}
          disabled={isLoading}
          className="px-10 py-4 border border-slate-300 text-base font-semibold rounded-full text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-50 transition-colors shadow-sm"
        >
          Try Demo
        </button>
      </div>
    </div>
  );
};

export default ComposeScreen;