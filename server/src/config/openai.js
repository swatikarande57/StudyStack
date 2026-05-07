import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn('WARNING: OPENAI_API_KEY is missing in .env file');
}

export const openai = apiKey ? new OpenAI({ apiKey }) : null;
