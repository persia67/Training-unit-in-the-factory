import { GoogleGenAI } from "@google/genai";
import { Message, Language, ContentGenerationRequest, ImageSize } from "../types";

export const streamGeminiResponse = async function* (
  userMessage: string, 
  history: Message[], 
  lang: Language = 'fa',
  apiKey?: string
) {
  if (!apiKey) {
    yield lang === 'fa' ? "لطفاً کلید API را در تنظیمات وارد کنید." : "Please set the API Key in Settings.";
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemPrompt = lang === 'fa' 
    ? "شما یک مشاور هوشمند آموزش در شرکت فولادسازی دانیال استیل هستید. پاسخ‌های دقیق، مدیریتی و کوتاه بدهید."
    : "You are an intelligent training consultant at Danial Steel Company. Provide precise, executive, and concise answers.";

  try {
    const model = ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `System: ${systemPrompt}` }] },
        ...history.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        })),
        { role: 'user', parts: [{ text: userMessage }] }
      ]
    });

    // Correct way to iterate over the stream response
    const response = await model;
    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    yield lang === 'fa' ? "خطا در ارتباط با هوش مصنوعی." : "Error connecting to AI.";
  }
};

export const analyzeDashboardData = async (data: any, lang: Language = 'fa', apiKey?: string) => {
  if (!apiKey) return "API Key missing.";
  
  const ai = new GoogleGenAI({ apiKey });
  const prompt = lang === 'fa' 
    ? `به عنوان مدیر آموزش، یک تحلیل کوتاه (۳ خط) و مدیریتی روی این داده‌های آماری بنویس: ${JSON.stringify(data)}`
    : `As a Training Manager, write a short (3 lines) executive summary of this data: ${JSON.stringify(data)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text || "";
  } catch (error) {
    console.error(error);
    return "Error generating analysis.";
  }
};

export const generateCertificate = async (
  employeeName: string, 
  courseName: string, 
  logoBase64: string | null,
  ceoName: string,
  managerName: string,
  size: ImageSize,
  lang: Language,
  apiKey?: string
) => {
  // Simulating certificate generation via Canvas for immediate feedback
  // In a real scenario with Gemini, you might use an image generation model or sophisticated layout tool
  return new Promise<string>((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = size === '4K' ? 3840 : size === '2K' ? 2560 : 1920;
      canvas.height = size === '4K' ? 2160 : size === '2K' ? 1440 : 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve('');

      // Background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Border
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 40;
      ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

      ctx.textAlign = 'center';
      
      // Logo
      if (logoBase64) {
          const img = new Image();
          img.onload = () => {
              ctx.drawImage(img, canvas.width / 2 - 100, 100, 200, 200);
              drawText();
          };
          img.src = logoBase64;
      } else {
          drawText();
      }

      function drawText() {
          if (!ctx) return;
          // Title
          ctx.font = 'bold 80px "Vazirmatn", sans-serif';
          ctx.fillStyle = '#1e293b';
          ctx.fillText(lang === 'fa' ? 'گواهینامه پایان دوره' : 'CERTIFICATE OF COMPLETION', canvas.width / 2, 450);

          // Body
          ctx.font = '60px "Vazirmatn", sans-serif';
          ctx.fillStyle = '#475569';
          ctx.fillText(lang === 'fa' ? 'بدینوسیله گواهی می‌شود' : 'This is to certify that', canvas.width / 2, 600);

          // Name
          ctx.font = 'bold 100px "Vazirmatn", sans-serif';
          ctx.fillStyle = '#2563eb';
          ctx.fillText(employeeName, canvas.width / 2, 750);

          // Course
          ctx.font = '60px "Vazirmatn", sans-serif';
          ctx.fillStyle = '#475569';
          ctx.fillText(lang === 'fa' ? `دوره آموزشی «${courseName}» را با موفقیت گذرانده است.` : `Has successfully completed the course "${courseName}".`, canvas.width / 2, 900);

          // Signatures
          ctx.font = '50px "Vazirmatn", sans-serif';
          ctx.fillStyle = '#0f172a';
          
          ctx.fillText(managerName, canvas.width / 4, 1200);
          ctx.fillText(lang === 'fa' ? 'مدیر آموزش' : 'Training Manager', canvas.width / 4, 1270);
          
          ctx.fillText(ceoName, (canvas.width / 4) * 3, 1200);
          ctx.fillText(lang === 'fa' ? 'مدیر عامل' : 'C.E.O', (canvas.width / 4) * 3, 1270);

          resolve(canvas.toDataURL('image/png'));
      }
      
      if (!logoBase64) drawText();
  });
};

export const generateTrainingVideo = async (req: ContentGenerationRequest, lang: Language, apiKey?: string) => {
    // Placeholder for Veo model logic
    return "https://example.com/video_placeholder.mp4"; 
};

export const generateTrainingDocument = async (req: ContentGenerationRequest, lang: Language, apiKey?: string) => {
    if (!apiKey) return "API Key missing.";
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Create a detailed ${req.format} content for: ${req.topic}. Audience: ${req.targetAudience}. Description: ${req.description}. Language: ${lang}`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text || "";
};

// Placeholder class for Live API (WebSockets)
export class GeminiLiveSession {
    constructor(lang: Language, apiKey?: string) {}
    async connect() { console.log("Connected to Live API"); }
    async send(msg: string) { console.log("Sent:", msg); }
    disconnect() {}
}