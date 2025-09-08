import React, { useState } from 'react';
import type { Shot, SceneConfig } from '../types';
import { SpinnerIcon, DownloadIcon } from './icons';

declare const JSZip: any;

interface ExportModalProps {
  shots: Shot[];
  sceneConfig: SceneConfig;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ shots, sceneConfig, onClose }) => {
  const [isZipping, setIsZipping] = useState(false);

  const handleDownload = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      
      const manifest = {
        scene: sceneConfig.seed,
        mood: sceneConfig.mood,
        aspectRatio: sceneConfig.aspectRatio,
        continuityNotes: sceneConfig.continuityNotes,
        shots: shots.map(({ image, status, ...rest }) => rest),
      };
      
      zip.file("manifest.json", JSON.stringify(manifest, null, 2));

      const imageFolder = zip.folder("images");
      if(imageFolder) {
        for (const shot of shots) {
            if (shot.image) {
                imageFolder.file(`${shot.id}.png`, shot.image, { base64: true });
            }
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      const safeFilename = sceneConfig.seed.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `StoryDirector_${safeFilename}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error creating ZIP file:", error);
    } finally {
      setIsZipping(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-slate-200 shadow-2xl m-4">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Export Your Scene</h2>
        <p className="text-slate-600 mb-6">A ZIP file will be downloaded containing:</p>
        <ul className="space-y-2 text-slate-600 mb-8">
          <li className="flex items-center"><svg className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Storyboard Images (.png)</li>
          <li className="flex items-center"><svg className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Shot Metadata (manifest.json)</li>
        </ul>
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors">Cancel</button>
          <button onClick={handleDownload} disabled={isZipping} className="inline-flex items-center px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-slate-400 transition-colors">
            {isZipping ? <SpinnerIcon className="animate-spin -ml-1 mr-2 h-5 w-5" /> : <DownloadIcon className="-ml-1 mr-2 h-5 w-5" />}
            {isZipping ? 'Zipping...' : 'Download ZIP'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;