import React, { useState } from 'react';
import type { Shot } from '../types';
import { SpinnerIcon, CheckCircleIcon, ExclamationCircleIcon, EditIcon } from './icons';

interface ShotCardProps {
  shot: Shot;
  onGenerate: (shotId: string) => void;
  onUpdatePrompt: (shotId: string, newPrompt: string) => void;
  isHighlighted?: boolean;
}

const ShotCard: React.FC<ShotCardProps> = ({ shot, onGenerate, onUpdatePrompt, isHighlighted }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [prompt, setPrompt] = useState(shot.short_prompt);

  const handlePromptSave = () => {
    onUpdatePrompt(shot.id, prompt);
    setIsEditing(false);
  };

  const getStatusIndicator = () => {
    switch (shot.status) {
      case 'generating':
        return <SpinnerIcon className="h-6 w-6 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'failed':
        return <ExclamationCircleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <div className="h-6 w-6 rounded-full bg-slate-300" />;
    }
  };

  return (
    <div className={`bg-white border border-slate-200/80 rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row gap-6 p-6 transition-all duration-300 hover:shadow-xl ${isHighlighted ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
      <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
        {shot.image ? (
          <img src={`data:image/png;base64,${shot.image}`} alt={shot.title} className="w-full aspect-video object-cover rounded-lg" />
        ) : (
          <div className="w-full aspect-video bg-slate-200 rounded-lg flex items-center justify-center">
            {shot.status === 'generating' ? <SpinnerIcon className="h-8 w-8 text-blue-500 animate-spin" /> : <p className="text-slate-500 text-sm">Awaiting Image</p>}
          </div>
        )}
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
            {getStatusIndicator()}
            <span className="capitalize">{shot.id.replace('_', ' ')}: {shot.title}</span>
          </h3>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{shot.shot_type}</span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-700">{shot.duration}s</span>
          </div>
        </div>
        <p className="text-sm text-slate-500 italic border-l-4 border-slate-200 pl-3">"{shot.camera_notes}"</p>
        
        {isEditing ? (
            <div className="space-y-2 pt-2">
                <textarea 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-300 rounded-md shadow-sm py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                    rows={3}
                />
                <div className="flex gap-2">
                    <button onClick={handlePromptSave} className="px-4 py-1.5 text-sm font-semibold rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors">Save</button>
                    <button onClick={() => { setIsEditing(false); setPrompt(shot.short_prompt); }} className="px-4 py-1.5 text-sm font-semibold rounded-md bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors">Cancel</button>
                </div>
            </div>
        ) : (
            <p className="text-sm text-slate-700 pt-2">{shot.short_prompt}</p>
        )}
      </div>
      <div className="flex flex-col md:justify-center items-center gap-2 md:w-auto self-center md:self-auto w-full">
        <button
          onClick={() => setIsEditing(!isEditing)}
          disabled={shot.status === 'generating' || isEditing}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <EditIcon className="h-4 w-4" /> Edit Prompt
        </button>
        <button
          onClick={() => onGenerate(shot.id)}
          disabled={shot.status === 'generating'}
          className="w-full md:w-auto flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          {shot.status === 'generating' ? <SpinnerIcon className="animate-spin h-5 w-5 mr-2" /> : null}
          {shot.status === 'generating' ? 'Generating' : shot.status === 'success' ? 'Regenerate' : 'Generate'}
        </button>
      </div>
    </div>
  );
};

export default ShotCard;