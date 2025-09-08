import type { Mood, AspectRatio, Quality, SceneConfig, Shot } from './types';

export const MOODS: Mood[] = ['Cinematic', 'Noir', 'Whimsical', 'Magical', 'Bright'];
export const ASPECT_RATIOS: AspectRatio[] = ['16:9', '3:2', '1:1'];
export const QUALITIES: Quality[] = ['Draft', 'Final'];

export const DEMO_PRESET: { config: SceneConfig, shots: Shot[], story: string } = {
  config: {
    seed: "A spy and a wizard have a tense meeting on a rooftop at dusk",
    anchors: [],
    mood: 'Cinematic',
    aspectRatio: '16:9',
    quality: 'Draft',
    continuityNotes: "The spy character has a small, barely visible scar above his right eyebrow. The wizard character wears a silver ring with a glowing blue gem on his index finger.",
  },
  story: `The city air hung thick and heavy, the last rays of sun painting the skyline in hues of orange and purple. On the windswept rooftop of the Zenith Tower, two figures stood in stark contrast. Elias, the wizard, wore robes the color of midnight, his silver ring pulsing with a soft, ethereal blue light. Across from him, the spy known only as 'Silas' was a silhouette in a perfectly tailored tuxedo, his posture relaxed but radiating lethal focus. A faint scar above his right eyebrow was the only imperfection on his otherwise flawless composure. [SHOT:shot_1]

Without a word, Elias raised a hand. The air crackled, and shimmering runes materialized around his fingers. He spoke a single, ancient word, and a beam of pure arcane energy projected from his hand, illuminating the rooftop. The wizard’s eyes glowed with the same blue as his ring, his expression one of immense concentration. He was a force of nature, a conduit of raw power. [SHOT:shot_2]

Silas moved with impossible grace. He sidestepped the brilliant beam, the energy striking a concrete ledge behind him and exploding into a shower of harmless sparks. As the light faded, Silas had already closed half the distance, his hand reaching inside his jacket. His movements were fluid, economical, a dance of deadly precision. [SHOT:shot_3]

From the wizard's perspective, Silas was a blur. The spy drew not a weapon, but a sleek, chrome device that hummed with a low-frequency energy. He thumbed a switch, and a shimmering barrier of golden light projected from it, just in time to block a second, more powerful wave of magic from Elias. The impact threw Silas back a step, his heels skidding on the gravel rooftop. [SHOT:shot_4]

The two adversaries were now at a silent impasse. The wizard's raw, untamed magic faced the spy's sophisticated, cutting-edge technology. Their faces were masks of intense determination, the cool blue light of the wizard's energy reflecting in the spy's focused eyes. The fate of the city below hung in the balance, a secret conflict waged in the dying light of dusk. [SHOT:shot_5]`,
  shots: [
    {
      id: "shot_1",
      title: "The Standoff",
      shot_type: "Wide Shot",
      duration: 3,
      camera_notes: "Establish the scene. Show both characters on the rooftop with the city skyline behind them as dusk settles. Low angle to make them look heroic.",
      short_prompt: "Epic wide shot of a spy in a sleek tuxedo and a wizard in flowing robes standing opposite each other on a skyscraper rooftop at dusk, dramatic city skyline, cinematic lighting, low angle.",
      status: "pending"
    },
    {
      id: "shot_2",
      title: "Wizard's Power",
      shot_type: "Medium Close-Up",
      duration: 2,
      camera_notes: "Focus on the wizard chanting, eyes glowing with magical energy. A beam of light projects from his hand.",
      short_prompt: "Medium close-up on a wise, old wizard with a long white beard, his eyes glowing blue with arcane energy as he casts a spell, a beam of light projecting from his hand, determined expression.",
      status: "pending"
    },
    {
      id: "shot_3",
      title: "Spy's Movement",
      shot_type: "Full Shot",
      duration: 2,
      camera_notes: "Capture the spy's athletic movement away from the light. Motion blur to emphasize speed. The background shows the light hitting a wall.",
      short_prompt: "Full shot of a nimble spy in a tuxedo gracefully moving to the side of a beam of blue magic, motion blur effect, on a skyscraper rooftop, cityscape background.",
      status: "pending"
    },
    {
      id: "shot_4",
      title: "Spy's Tech",
      shot_type: "Over-the-Shoulder",
      duration: 2,
      camera_notes: "Over the wizard's shoulder, we see the spy activating a futuristic gadget. A glint of light from the device.",
      short_prompt: "Over-the-shoulder view from behind a wizard, focusing on a spy activating a high-tech chrome gadget that emits a golden energy shield.",
      status: "pending"
    },
    {
      id: "shot_5",
      title: "The Impasse",
      shot_type: "Dynamic Close-Up",
      duration: 3,
      camera_notes: "Intense close-up on their faces as they observe each other. The wizard's magical aura contrasts with the spy's cool technology. Determined expressions.",
      short_prompt: "Dynamic close-up of a wizard's face, glowing with blue magical power, near a spy's cool, determined face reflecting golden light from a gadget.",
      status: "pending"
    }
  ]
};