const axios = require('axios');

const getEmbedding = async (text) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`;

  const response = await axios.post(url, {
    model: `models/${model}`,
    content: {
      parts: [{ text }]
    },
    outputDimensionality: parseInt(process.env.QDRANT_VECTOR_SIZE || '768', 10)
  });

  if (response.data && response.data.embedding && response.data.embedding.values) {
    return response.data.embedding.values;
  }
  throw new Error('Failed to generate embedding');
};

const analyzeQueryScope = async (query) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_CHAT_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `Analyze the following user query for a customer support AI.
Categorize the query into one of the following:
1. "CONVERSATIONAL": General greetings, small talk, polite phrases, thanking, saying goodbye, or asking about the AI's identity/capability (e.g., "hi", "how are you?", "who are you?", "what is your name?", "good morning", "thank you", "bye", "what can you do?").
2. "BUSINESS": Any business-related queries, flight booking questions, tickets, schedules, support requests, policies, services, etc.

Also, determine if the query is "outOfScope". Out-of-scope actions are business/operational tasks that MUST require a human, such as refund approvals, billing modifications, account deletions, administrator access requests, direct database changes, or manual booking changes.

Respond only with a JSON object in this format:
{
  "category": "CONVERSATIONAL" | "BUSINESS",
  "outOfScope": true | false,
  "reason": "brief reason here",
  "confidence": 0.95
}

User Query: "${query}"`;

  try {
    const response = await axios.post(url, {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });
    const text = response.data.candidates[0].content.parts[0].text;
    const result = JSON.parse(text.trim());
    return {
      category: result.category || 'BUSINESS',
      outOfScope: !!result.outOfScope,
      reason: result.reason || 'Out of scope request',
      confidence: typeof result.confidence === 'number' ? result.confidence : 1.0
    };
  } catch (err) {
    const lowerQuery = query.toLowerCase().trim();
    const conversationalGreetings = ['hi', 'hello', 'hey', 'how are you', 'who are you', 'good morning', 'good afternoon', 'good evening', 'thank you', 'thanks', 'bye', 'goodbye', 'help'];
    const isConversational = conversationalGreetings.some(greet => lowerQuery.startsWith(greet) || lowerQuery === greet);

    const isMatched = lowerQuery.includes('refund') ||
                      lowerQuery.includes('billing') ||
                      lowerQuery.includes('delete account') ||
                      lowerQuery.includes('admin') ||
                      lowerQuery.includes('cancel my account');
    return {
      category: isConversational ? 'CONVERSATIONAL' : 'BUSINESS',
      outOfScope: isMatched,
      reason: isMatched ? 'Potential operational query detected' : '',
      confidence: 1.0
    };
  }
};

const generateResponse = async (query, history, contextChunks, isConversational = false) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_CHAT_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  let systemInstruction;
  if (isConversational) {
    systemInstruction = `You are a friendly, helpful customer support AI. Respond to the user's greeting, small talk, or general question naturally and concisely. You do not need to refer to any knowledge base. Keep the tone warm, professional, and helpful.`;
  } else {
    const contextText = contextChunks.map(c => `- ${c.chunkText}`).join('\n');
    systemInstruction = `You are a helpful customer support AI. Use the provided Knowledge Base context to answer the user query.
If the context does not contain the answer to the user query, or if you cannot answer the query using the context, you MUST respond with exactly the word "UNANSWERABLE". Do not make up any facts or answer using external information.

Knowledge Base Context:
${contextText}`;
  }

  const contents = [];
  for (const msg of history) {
    contents.push({
      role: msg.senderType === 'USER' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: `${systemInstruction}\n\nUser Query: ${query}` }]
  });

  const response = await axios.post(url, {
    contents
  });

  if (response.data && response.data.candidates && response.data.candidates[0]) {
    const text = response.data.candidates[0].content.parts[0].text;
    return text;
  }
  throw new Error('Failed to generate response');
};

module.exports = {
  getEmbedding,
  analyzeQueryScope,
  generateResponse
};
