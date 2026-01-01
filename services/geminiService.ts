
import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";
import { Message, Language, ImageSize, ContentGenerationRequest } from "../types";

const SYSTEM_INSTRUCTION_FA = `
شما یک مشاور متخصص و ارشد آموزش و توسعه منابع انسانی در صنعت فولاد هستید.
نام شرکت: "دانیال استیل" (تولیدکننده مقاطع فولادی).
همیشه به زبان فارسی پاسخ دهید.
`;

const SYSTEM_INSTRUCTION_EN = `
You are a senior expert consultant in training and human resources development in the steel industry.
Company Name: "Danial Steel" (Steel sections manufacturer).
Always respond in English.
`;

const getSystemInstruction = (lang: Language) => lang === 'fa' ? SYSTEM_INSTRUCTION_FA : SYSTEM_INSTRUCTION_EN;

export const streamGeminiResponse = async function* (userMessage: string, history: Message[], lang: Language = 'fa') {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents: [
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: getSystemInstruction(lang),
        temperature: 0.7,
        topP: 0.9,
      }
    });

    for await (const chunk of responseStream) {
      yield chunk.text || "";
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(lang === 'fa' ? "خطا در ارتباط با هوش مصنوعی." : "Error connecting to AI.");
  }
};

export const analyzeDashboardData = async (stats: any, lang: Language = 'fa') => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const prompt = lang === 'fa' 
      ? `به عنوان مشاور ارشد آموزش، داده‌های زیر را تحلیل کن و ۳ نقطه قوت و ۳ زمینه قابل بهبود را خلاصه بگو. داده‌ها: ${JSON.stringify(stats)}`
      : `As a senior training consultant, analyze the following data and summarize 3 strengths and 3 areas for improvement. Data: ${JSON.stringify(stats)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { 
          role: 'user', 
          parts: [{ text: prompt }] 
        }
      ],
      config: {
        temperature: 0.4,
      }
    });

    return response.text || (lang === 'fa' ? "تحلیل در دسترس نیست." : "Analysis not available.");
  } catch (error) {
    console.error("Dashboard Analysis Error:", error);
    throw new Error("Analysis Error.");
  }
};

export const suggestTrainingCourses = async (skillData: any, lang: Language = 'fa') => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const prompt = lang === 'fa'
      ? `با توجه به داده‌های زیر (مهارت فعلی vs هدف)، ۳ دوره آموزشی اولویت‌دار پیشنهاد بده. خروجی فقط JSON.`
      : `Based on the following skill gap data (current vs target), suggest 3 priority training courses. Output JSON only.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          role: 'user',
          parts: [{
            text: `${prompt} Data: ${JSON.stringify(skillData)}`
          }]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              targetSkill: { type: Type.STRING },
              description: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ["High", "Medium"] },
              duration: { type: Type.STRING }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Course Suggestion Error:", error);
    throw new Error("Error generating suggestions.");
  }
};

export const generateCertificate = async (
  employeeName: string, 
  courseName: string, 
  logoBase64: string | null,
  ceoName: string,
  managerName: string,
  size: ImageSize = '1K',
  lang: Language = 'fa'
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const parts: any[] = [];
    
    if (logoBase64) {
      // Clean up base64 string if it has the prefix
      const base64Data = logoBase64.includes('base64,') ? logoBase64.split('base64,')[1] : logoBase64;
      parts.push({
        inlineData: {
          mimeType: 'image/png', // Assuming user uploads png/jpeg. The model handles standard image mimes.
          data: base64Data
        }
      });
    }

    const promptText = `
    Create a high-quality, high-resolution, professional Certificate of Completion.
    
    Details:
    - Recipient Name: "${employeeName}"
    - Course Name: "${courseName}" (IMPORTANT: Extract and include the English name of the course if available, or translate it to English. The English name must be prominent).
    - Design Style: Corporate, official, elegant borders (Blue/Gold theme fitting for a Steel Industry company).
    - Texture: High-quality paper texture, printable quality.
    
    Structure:
    - Header: "CERTIFICATE OF ACHIEVEMENT" or "CERTIFICATE OF COMPLETION".
    - Logo: Incorporate the provided logo image at the top center or top left if provided.
    - Signatures: Create two distinct signature areas at the bottom with lines. 
      * Left Side Label/Name: "Training Manager: ${managerName || 'Manager'}"
      * Right Side Label/Name: "CEO: ${ceoName || 'CEO'}"
      * LEAVE THE ACTUAL SIGNATURE SPACE EMPTY/BLANK for handwritten signatures.
    - Date: Include a placeholder for the date.
    
    Ensure the text is legible, sharp, and spelled correctly. The overall look should be premium and suitable for printing.
    `;

    parts.push({ text: promptText });

    // Using gemini-3-pro-image-preview for high quality output and size control
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: parts
      },
      config: {
        imageConfig: {
          aspectRatio: "4:3",
          imageSize: size // 1K, 2K, or 4K
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Certificate Generation Error:", error);
    throw new Error("Failed to generate certificate.");
  }
};

export const generateTrainingVideo = async (req: ContentGenerationRequest, lang: Language) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const prompt = lang === 'fa' 
    ? `یک ویدیوی آموزشی کوتاه و حرفه‌ای برای کارکنان صنعت فولاد. موضوع: ${req.topic}. مخاطب: ${req.targetAudience}. توضیحات: ${req.description}. سبک: واقع‌گرایانه، سینمایی، محیط کارخانه فولاد، ایمن.`
    : `A short professional training video for steel industry workers. Topic: ${req.topic}. Audience: ${req.targetAudience}. Description: ${req.description}. Style: Realistic, cinematic, steel factory environment, safety focused.`;

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation failed.");
    
    // We return the raw URI. The frontend must fetch it with the API Key appended.
    return videoUri;

  } catch (error) {
    console.error("Veo API Error:", error);
    throw new Error("Video generation failed.");
  }
};

export const generateTrainingDocument = async (req: ContentGenerationRequest, lang: Language) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  let prompt = '';
  if (req.format === 'pamphlet') {
    prompt = lang === 'fa' 
       ? `یک جزوه آموزشی کامل و ساختاریافته بنویس. موضوع: ${req.topic}. مخاطب: ${req.targetAudience}. توضیحات: ${req.description}. خروجی باید فرمت Markdown داشته باشد با تیترها، بولت‌پوینت‌ها و پاراگراف‌های توضیحی.`
       : `Write a complete and structured training pamphlet. Topic: ${req.topic}. Audience: ${req.targetAudience}. Description: ${req.description}. Output must be in Markdown format with headers, bullet points, and explanatory paragraphs.`;
  } else {
    prompt = lang === 'fa'
       ? `یک طرح کلی (Outline) دقیق برای اسلایدهای پاورپوینت بنویس. موضوع: ${req.topic}. مخاطب: ${req.targetAudience}. توضیحات: ${req.description}. برای هر اسلاید، عنوان و متن‌های کلیدی (Bullet points) را بنویس. خروجی Markdown باشد.`
       : `Write a detailed PowerPoint slide outline. Topic: ${req.topic}. Audience: ${req.targetAudience}. Description: ${req.description}. For each slide, provide the Title and Key Bullet Points. Output in Markdown.`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
       temperature: 0.5
    }
  });

  return response.text || "";
};


/* --- Live API Implementation --- */

export class GeminiLiveSession {
  private sessionPromise: Promise<any> | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private lang: Language;

  constructor(lang: Language = 'fa') {
    this.lang = lang;
  }

  async start(onClose: () => void) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(this.lang === 'fa' ? "مرورگر شما از ضبط صدا پشتیبانی نمی‌کند." : "Your browser does not support audio recording.");
    }

    // Attempt to verify microphone presence
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasMic = devices.some(d => d.kind === 'audioinput');
        if (!hasMic) {
            throw new Error(this.lang === 'fa' ? "میکروفونی یافت نشد." : "No microphone found.");
        }
    } catch (e) {
        // Fallthrough if enumeration is restricted, getUserMedia will throw the definitive error
        if (e instanceof Error && (e.message.includes("found") || e.message.includes("یافت"))) {
             throw e;
        }
    }

    let stream: MediaStream;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err: any) {
        console.error("Microphone access failed:", err);
        let msg = this.lang === 'fa' ? "دسترسی به میکروفون امکان‌پذیر نیست." : "Microphone access failed.";
        
        if (err.name === 'NotFoundError' || err.message?.includes('not found') || err.message?.includes('Requested device')) {
            msg = this.lang === 'fa' ? "میکروفونی یافت نشد." : "No microphone device found.";
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            msg = this.lang === 'fa' ? "دسترسی به میکروفون رد شد." : "Microphone permission denied.";
        } else if (err.name === 'NotReadableError') {
             msg = this.lang === 'fa' ? "میکروفون در دسترس نیست (شاید توسط برنامه دیگری استفاده می‌شود)." : "Microphone is busy/unreadable.";
        }

        throw new Error(msg);
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    const outputNode = this.outputAudioContext.createGain();
    outputNode.connect(this.outputAudioContext.destination);

    this.sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
        systemInstruction: getSystemInstruction(this.lang),
      },
      callbacks: {
        onopen: () => {
          this.startAudioInput(stream);
        },
        onmessage: async (message: LiveServerMessage) => {
          const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          
          if (base64Audio && this.outputAudioContext) {
            this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
            
            const audioBuffer = await this.decodeAudioData(
              this.decode(base64Audio),
              this.outputAudioContext,
              24000,
              1
            );
            
            const source = this.outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputNode);
            source.addEventListener('ended', () => {
              this.sources.delete(source);
            });
            
            source.start(this.nextStartTime);
            this.nextStartTime += audioBuffer.duration;
            this.sources.add(source);
          }
        },
        onclose: () => onClose(),
        onerror: (err) => {
            console.error("Session error:", err);
            onClose();
        }
      }
    });
  }

  private startAudioInput(stream: MediaStream) {
    if (!this.inputAudioContext) return;

    this.inputSource = this.inputAudioContext.createMediaStreamSource(stream);
    this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
    
    this.scriptProcessor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = this.createBlob(inputData);
      
      this.sessionPromise?.then(session => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    this.inputSource.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.inputAudioContext.destination);
  }

  stop() {
    this.sources.forEach(source => source.stop());
    this.sources.clear();
    
    this.scriptProcessor?.disconnect();
    this.inputSource?.disconnect();
    
    this.inputAudioContext?.close();
    this.outputAudioContext?.close();
    
    this.sessionPromise?.then(session => session.close());
    
    this.sessionPromise = null;
    this.inputAudioContext = null;
    this.outputAudioContext = null;
  }

  private createBlob(data: Float32Array): any {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(binary);
    
    return {
      data: b64,
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  private decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }
}
