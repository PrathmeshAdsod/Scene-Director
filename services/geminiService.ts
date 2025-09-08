import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { AnchorImage, SceneConfig, Shot, AspectRatio } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fileToBase64 = (file: File): Promise<{base64: string, mimeType: string}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        const mimeType = result.split(',')[0].split(':')[1].split(';')[0];
        resolve({ base64, mimeType });
    };
    reader.onerror = (error) => reject(error);
  });
};

export const generateStoryAndShotlist = async (config: SceneConfig): Promise<{story: string, shots: Shot[]}> => {
    const { seed, mood, aspectRatio, continuityNotes } = config;

    const continuityInstruction = continuityNotes
      ? `\n\nCRITICAL: Maintain the following continuity details across all shots: "${continuityNotes}"`
      : '';

    const prompt = `
      You are a professional screenwriter and film director. Your task is to take a scene idea and expand it into a short story and a detailed shotlist.

      **Step 1: Write a Short Story**
      - Write an engaging short story for the scene (around 200-400 words).
      - The story should have a clear beginning, middle, and end.
      - Weave the 'Mood' and 'Continuity Notes' into the narrative.
      - At the end of paragraphs that represent a key visual moment, insert a marker like "[SHOT:shot_id]", where "shot_id" is a unique identifier (e.g., "shot_1", "shot_2").

      **Step 2: Create a Detailed Shotlist**
      - Based on the story you wrote, identify 5 to 10 distinct, cinematic shots.
      - For each shot, provide a unique ID (must match the [SHOT:shot_id] in the story), a title, shot type (e.g., Wide Shot, Close-Up), duration in seconds, camera notes, and a concise, visually descriptive prompt for an AI image generator ('short_prompt').

      **CRITICAL 'short_prompt' GUIDELINES FOR IMAGE GENERATION SAFETY:**
      - The 'short_prompt' MUST be a purely visual description suitable for a modern AI image generator. It MUST be "safe for work" and avoid any sensitive topics to prevent being blocked by safety filters.
      - **Absolutely NO words implying violence, combat, or harm.** This includes words like 'duel', 'fight', 'attack', 'shoot', 'battle', 'weapon', 'gun', 'sword', 'kill', 'injure', 'blood', 'blast'.
      - **Instead of describing conflict, describe the visual elements of the scene.** For example, instead of "the spy fights the wizard", use "a spy in a tuxedo and a wizard in robes stand facing each other, one holds a glowing staff, the other holds a futuristic gadget".
      - **Describe actions visually and neutrally.** Instead of "he attacks with a magic blast", use "a beam of blue energy emerges from his hand".
      - Be descriptive about the setting, lighting, colors, character appearance, and mood. For example: "A wizard with a long white beard on a skyscraper rooftop at dusk, cinematic lighting, dramatic city skyline in the background."
      - DO NOT describe complex compositions (e.g., 'split-screen', 'picture-in-picture').
      - The prompt should be a single, concise sentence or a series of descriptive phrases.

      **Input Details:**
      - Scene Idea: "${seed}"
      - Mood: "${mood}"
      - Aspect Ratio: "${aspectRatio}"
      ${continuityInstruction}

      **Output Format:**
      Respond ONLY with a single valid JSON object. Do not include any other text or markdown.
      The JSON object must have two keys: "story" (a string containing the full story with shot markers) and "shots" (an array of shot objects).
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        story: { type: Type.STRING },
                        shots: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    title: { type: Type.STRING },
                                    shot_type: { type: Type.STRING },
                                    duration: { type: Type.NUMBER },
                                    camera_notes: { type: Type.STRING },
                                    short_prompt: { type: Type.STRING },
                                },
                                required: ["id", "title", "shot_type", "duration", "camera_notes", "short_prompt"],
                            },
                        }
                    },
                    required: ["story", "shots"],
                },
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        return {
            story: result.story,
            shots: result.shots.map((shot: Omit<Shot, 'status'>) => ({ ...shot, status: 'pending' }))
        };

    } catch (error) {
        console.error("Error generating story and shotlist:", error);
        throw new Error("Failed to generate story and shotlist. The AI model might be busy or the prompt could not be processed.");
    }
};


export const generateImage = async (prompt: string, anchors: AnchorImage[], aspectRatio: AspectRatio, continuityNotes: string): Promise<string> => {
    try {
        const imageParts = anchors.map(anchor => ({
            inlineData: {
                data: anchor.base64,
                mimeType: anchor.mimeType,
            },
        }));

        const fullPrompt = `${prompt}. The image should have a ${aspectRatio} aspect ratio.${continuityNotes ? ` Key continuity notes to maintain: ${continuityNotes}` : ''}`;
        const textPart = { text: fullPrompt };
        
        const allParts = [...imageParts, textPart];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: allParts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const candidate = response.candidates?.[0];
        if (candidate?.finishReason === 'SAFETY') {
            throw new Error("Image generation was blocked due to safety policies. Please revise the prompt to be more neutral.");
        }
        
        if (candidate?.content?.parts) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    return part.inlineData.data; // This is the base64 image string
                }
            }
        }
        
        console.error("Image generation failed. Full API response:", JSON.stringify(response, null, 2));
        const textResponse = response.text?.trim();
            if (textResponse) {
            throw new Error(`The model responded with text instead of an image: "${textResponse}"`);
        }
        throw new Error("The model did not return an image. This might be due to safety filters or the complexity of the request.");

    } catch (error) {
        console.error("Error generating image:", error);
        if (error instanceof Error) {
            if (error.message.includes("RESOURCE_EXHAUSTED") || error.message.includes("quota")) {
                throw new Error("You have exceeded your API quota. Please check your Google AI account plan and billing details.");
            }
            throw new Error(`Image generation failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred during image generation.");
    }
};