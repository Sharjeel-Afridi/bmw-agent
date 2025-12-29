/**
 * Gemini LLM Configuration
 * 
 * Centralizes Gemini model configuration to ensure consistency across all agents.
 * Uses environment variables for API keys to avoid hardcoding secrets.
 * 
 * WHY: Single source of truth for LLM settings makes it easy to:
 * - Switch models globally (flash to pro, etc.)
 * - Update API keys in one place
 * - Add rate limiting or retries later
 */

import { google } from '@ai-sdk/google';

// Validate API key at startup
if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    'GEMINI_API_KEY is required. Please set it in your .env file.\n' +
    'Get your key from: https://aistudio.google.com/apikey'
  );
}

/**
 * Default Gemini model for all agents
 * Using flash for speed and cost efficiency
 */
export const geminiFlash = google('gemini-2.5-flash', {
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Pro model available for complex tasks requiring better reasoning
 */
export const geminiPro = google('gemini-1.5-pro', {
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Model selector - use this to dynamically choose models
 */
export const getGeminiModel = (variant: 'flash' | 'pro' = 'flash') => {
  return variant === 'pro' ? geminiPro : geminiFlash;
};
