
import { GoogleGenAI } from "@google/genai";
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
`;

export const getGeminiResponse = async (userMessage: string, history: Message[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    // Using gemini-3-flash-preview for fast and cost-effective responses
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.9,
      }
    });

    return response.text || "متاسفانه پاسخی دریافت نشد.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("خطا در ارتباط با هوش مصنوعی. لطفا اتصال خود را چک کنید.");
  }
};
