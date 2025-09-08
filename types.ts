export enum AppStep {
  Compose = 1,
  Story = 2,
  Generate = 3,
}

export interface AnchorImage {
  id: string;
  file: File;
  base64: string;
  mimeType: string;
}

export type Mood = 'Cinematic' | 'Noir' | 'Whimsical' | 'Magical' | 'Bright' | 'Custom';
export type AspectRatio = '16:9' | '3:2' | '1:1';
export type Quality = 'Draft' | 'Final';

export interface SceneConfig {
  seed: string;
  anchors: AnchorImage[];
  mood: Mood;
  aspectRatio: AspectRatio;
  quality: Quality;
  continuityNotes: string;
  story?: string;
}

export interface Shot {
  id: string;
  title: string;
  shot_type: string;
  duration: number;
  camera_notes: string;
  short_prompt: string;
  image?: string; // base64 image data
  status: 'pending' | 'generating' | 'success' | 'failed';
}