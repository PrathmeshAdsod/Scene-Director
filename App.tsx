import React, { useState, useCallback, useEffect } from 'react';
import type { SceneConfig, Shot, AnchorImage } from './types';
import { AppStep } from './types';
import { DEMO_PRESET } from './constants';
import { generateStoryAndShotlist, generateImage } from './services/geminiService';
import Stepper from './components/Stepper';
import ComposeScreen from './components/ComposeScreen';
import ShotlistScreen from './components/ShotlistScreen';
import ExportModal from './components/ExportModal';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.Compose);
  const [sceneConfig, setSceneConfig] = useState<SceneConfig | null>(null);
  const [story, setStory] = useState<string>('');
  const [shots, setShots] = useState<Shot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleGenerateStoryAndShotlist = useCallback(async (config: SceneConfig) => {
    setIsLoading(true);
    setError(null);
    try {
      const { story: generatedStory, shots: generatedShots } = await generateStoryAndShotlist(config);
      setStory(generatedStory);
      setSceneConfig(config);
      setShots(generatedShots);
      setCurrentStep(AppStep.Story);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleUseDemo = useCallback(() => {
    setSceneConfig(DEMO_PRESET.config);
    setShots(DEMO_PRESET.shots);
    setStory(DEMO_PRESET.story);
    setCurrentStep(AppStep.Story);
  }, []);

  const updateShotStatus = useCallback((shotId: string, status: Shot['status'], image?: string) => {
    setShots(prev => prev.map(s => s.id === shotId ? { ...s, status, image: image ?? s.image } : s));
  }, []);

  const handleGenerateImage = useCallback(async (shotId: string) => {
    if (!sceneConfig) return;
    
    const shot = shots.find(s => s.id === shotId);
    if (!shot) return;

    updateShotStatus(shotId, 'generating');
    setError(null); // Clear previous errors
    try {
      const imageData = await generateImage(shot.short_prompt, sceneConfig.anchors, sceneConfig.aspectRatio, sceneConfig.continuityNotes);
      updateShotStatus(shotId, 'success', imageData);
    } catch (e) {
      updateShotStatus(shotId, 'failed');
      const errorMessage = e instanceof Error ? e.message : 'Image generation failed.';
      setError(`Error for "${shot.title}": ${errorMessage}`);
    }
  }, [sceneConfig, shots, updateShotStatus]);
  
  const handleUpdatePrompt = useCallback((shotId: string, newPrompt: string) => {
      setShots(prev => prev.map(s => s.id === shotId ? { ...s, short_prompt: newPrompt, status: 'pending', image: undefined } : s));
  }, []);
  
  const handleGenerateAll = useCallback(async () => {
    setIsGeneratingAll(true);
    setProgress(0);
    setError(null);
    const shotsToGenerate = shots.filter(s => s.status !== 'success');
    for (let i = 0; i < shotsToGenerate.length; i++) {
        const shot = shotsToGenerate[i];
        await handleGenerateImage(shot.id);
        setProgress(((i + 1) / shotsToGenerate.length) * 100);
    }
    setIsGeneratingAll(false);
    setCurrentStep(AppStep.Generate);
  }, [shots, handleGenerateImage]);

  const handleBackToCompose = () => {
    setCurrentStep(AppStep.Compose);
    setShots([]);
    setStory('');
    setSceneConfig(null);
    setError(null);
  };
  
  return (
    <div className="min-h-screen">
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-40 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.reload()}>
             <svg className="h-8 w-8 text-blue-600" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z"/>
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M8 4v16" />
                <path d="M16 4v16" />
                <path d="M4 8h16" />
                <path d="M4 16h16" />
                <path d="M4 12h16" />
             </svg>
            <span className="text-2xl font-bold text-slate-900">StoryDirector</span>
          </div>
          {currentStep > AppStep.Compose && (
            <button onClick={handleBackToCompose} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">&larr; Start Over</button>
          )}
        </div>
      </header>
      
      <main className="py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-4 mb-12">
            <Stepper currentStep={currentStep} />
        </div>
        
        {error && (
            <div className="max-w-4xl mx-auto my-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg" role="alert">
                <div className="flex">
                    <div className="py-1">
                        <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8h2v2H9v-2z"/></svg>
                    </div>
                    <div>
                        <p className="font-bold">An Error Occurred</p>
                        <p className="text-sm">{error}</p>
                    </div>
                     <button className="ml-auto pl-3" onClick={() => setError(null)} aria-label="Close">
                        <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                    </button>
                </div>
            </div>
        )}

        {currentStep === AppStep.Compose && <ComposeScreen onGenerate={handleGenerateStoryAndShotlist} onDemo={handleUseDemo} isLoading={isLoading} />}
        
        {currentStep >= AppStep.Story && sceneConfig && (
          <ShotlistScreen 
            story={story}
            shots={shots} 
            onGenerateImage={handleGenerateImage}
            onUpdatePrompt={handleUpdatePrompt}
            onGenerateAll={handleGenerateAll}
            onExport={() => setShowExportModal(true)}
            isGeneratingAll={isGeneratingAll}
            progress={progress}
          />
        )}
      </main>

      {showExportModal && sceneConfig && (
        <ExportModal shots={shots} sceneConfig={sceneConfig} onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
};

export default App;