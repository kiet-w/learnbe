import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { Category } from './constants';
import { GoogleGenAI } from '@google/genai';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Note } from '@prisma/client';

export const AiAnalysisSchema = z.object({
  title: z.string(),
  summary: z.string(),
  bullets: z.array(z.string()),
  category: z.nativeEnum(Category),
});

export type AiAnalysis = z.infer<typeof AiAnalysisSchema>;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private ai: GoogleGenAI;

  constructor() {
    // Initialize the new Google Gen AI SDK
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async analyze(content: string): Promise<AiAnalysis> {
    this.logger.log('MOCKING AI: Analyzing content...');
    
    // Simulate AI processing time (e.g., 5 seconds to test stream/heartbeat)
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Return mock data matching the AiAnalysis schema
    return {
      title: 'Mocked Note Title',
      summary: 'This is a mocked summary of the note content. The real Gemini API is currently bypassed for testing purposes.',
      bullets: [
        'Mocked bullet point 1: ' + content.slice(0, 20),
        'Mocked bullet point 2: Bypassing Gemini API',
        'Mocked bullet point 3: Testing frontend-backend SSE flow',
      ],
      category: Category.TECH,
    };
  }

  async answerQuestion(query: string, notes: Note[]): Promise<string> {
    this.logger.log('MOCKING AI: Answering question...');
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    return `This is a mock answer to your question: "${query}". You have ${notes.length} notes in context. Bypassing real Gemini API to save quota!`;
  }
}
