
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Message } from "../types";

const SYSTEM_INSTRUCTION = `
شما یک مشاور متخصص و ارشد آموزش و توسعه منابع انسانی در صنعت فولاد هستید.
نام شرکت: "دانیال استیل" (تولیدکننده مقاطع فولادی).
وظایف شما:
1. مشاوره تخصصی در طراحی مسیرهای یادگیری برای اپراتورهای خط تولید، تکنیسین‌ها و مدیران.
2. تولید سرفصل‌های آموزشی مطابق با استانداردهای مدرن صنعت فولاد.
3. تحلیل نیازهای آموزشی و ارائه راهکارهای بهبود عملکرد.
4. پاسخ به سوالات فنی و مدیریتی حوزه آموزش در کارخانجات صنعتی.

لطفا همیشه به زبان فارسی محترمانه، فنی و دقیق پاسخ دهید.
پاسخ‌ها را با فرمت Markdown ارسال کنید تا خوانایی بهتری داشته باشند (از لیست‌ها، بولد، جداول و بلوک‌های کد استفاده کنید).
`;

export const streamGeminiResponse = async function* (userMessage: string, history: Message[]) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    // Upgraded to gemini-3-pro-preview for complex reasoning in chat
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents: [
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.9,
      }
    });

    for await (const chunk of responseStream) {
      yield chunk.text || "";
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("خطا در ارتباط با هوش مصنوعی. لطفا اتصال خود را چک کنید.");
  }
};

export const analyzeDashboardData = async (stats: any) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    // Using gemini-3-flash-preview for fast analysis
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { 
          role: 'user', 
          parts: [{ 
            text: `به عنوان مشاور ارشد آموزش، این داده‌های آماری ماهانه واحد آموزش را تحلیل کن و ۳ نقطه قوت و ۳ زمینه قابل بهبود را به صورت خلاصه و مدیریتی بنویس. داده‌ها: ${JSON.stringify(stats)}` 
          }] 
        }
      ],
      config: {
        temperature: 0.4,
      }
    });

    return response.text || "تحلیل در دسترس نیست.";
  } catch (error) {
    console.error("Dashboard Analysis Error:", error);
    throw new Error("خطا در تحلیل داده‌ها.");
  }
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

  async start(onClose: () => void) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    const outputNode = this.outputAudioContext.createGain();
    outputNode.connect(this.outputAudioContext.destination);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    this.sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      callbacks: {
        onopen: () => {
          console.log("Live session started");
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
        onclose: () => {
          console.log("Live session closed");
          onClose();
        },
        onerror: (err) => {
          console.error("Live session error:", err);
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
