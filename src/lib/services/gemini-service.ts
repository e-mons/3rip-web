import { GoogleGenerativeAI } from "@google/generative-ai";


export interface AISuggestion {
  suggestion: string;
  confidence: number;
  dataPoints: any;
}

export class GeminiService {
  private static genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
  private static model = GeminiService.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  private static cleanJson(text: string): string {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
  }

  static async getSmartPricing(distance: number, demandLevel: 'low' | 'medium' | 'high'): Promise<AISuggestion> {
    const prompt = `Analyze pricing for a ride-hailing app. 
    Distance: ${distance}km. Current Demand: ${demandLevel}. 
    Provide a suggested price in USD and a brief 1-sentence rationale. 
    Return ONLY JSON: { "suggestion": "$XX.XX - Rationale", "confidence": 0.XX }`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(this.cleanJson(response.text()));
    } catch (error) {
      return { suggestion: "$12.50 - Standard pricing applied (AI Engine Offline)", confidence: 0.5, dataPoints: {} };
    }
  }

  static async getDemandPrediction(region: string): Promise<AISuggestion> {
    const prompt = `Predict ride demand for region ${region} for the next 4 hours based on standard urban patterns.
    Return ONLY JSON: { "suggestion": "High demand expected at 6PM due to rush hour.", "confidence": 0.XX }`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(this.cleanJson(response.text()));
    } catch (error) {
      return { suggestion: "Normal demand levels expected across all sectors.", confidence: 0.5, dataPoints: {} };
    }
  }

  static async optimizeDriverFleet(drivers: any[]): Promise<AISuggestion> {
    const prompt = `Given ${drivers.length} drivers, suggest 3 key locations they should move to for optimal coverage.
    Return ONLY JSON: { "suggestion": "Relocate drivers to Downtown, Airport, and Financial District.", "confidence": 0.XX }`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(this.cleanJson(response.text()));
    } catch (error) {
      return { suggestion: "Maintain current distribution. Monitor airport arrivals.", confidence: 0.5, dataPoints: {} };
    }
  }

  static async getDashboardInsights(stats: any): Promise<string> {
    const prompt = `As a 3rip Platform Analyst, provide a 2-sentence summary of these stats:
    Revenue: $${stats.revenue}, Bookings: ${stats.bookings}, Active Drivers: ${stats.drivers}, Active Riders: ${stats.riders}.
    Identify one trend and one recommendation. Keep it professional and concise.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      return "Platform performing within expected parameters. Monitor driver retention.";
    }
  }
}
