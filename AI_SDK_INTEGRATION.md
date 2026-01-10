# Vercel AI SDK Integration Guide

This document explains how the Vercel AI SDK is integrated into the AI Chess Battle application.

## Overview

The application has been migrated from direct API calls to using the **Vercel AI SDK** for a cleaner, more maintainable AI integration.

## Architecture

### Before (Direct API Calls)
```
Browser → Direct API Call → Anthropic/OpenAI API → Response → Browser
```

### After (AI SDK)
```
Browser → Backend API → AI SDK → Anthropic/OpenAI API → Response → Backend → Browser
```

## Components

### 1. Backend Server ([server.js](server.js))

The Express server handles AI requests using the Vercel AI SDK:

```javascript
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

// Claude AI using AI SDK
const anthropic = createAnthropic({ apiKey });
const result = await generateText({
    model: anthropic('claude-sonnet-4-5-20250929'),
    prompt: chessPrompt,
    maxTokens: 150,
});

// OpenAI using AI SDK
const openai = createOpenAI({ apiKey });
const result = await generateText({
    model: openai('gpt-4'),
    prompt: chessPrompt,
    maxTokens: 150,
    temperature: 0.7,
});
```

### 2. Frontend ([app.js](app.js))

The frontend now makes requests to the backend instead of directly to AI providers:

```javascript
// Claude AI via backend
async getClaudeMove() {
    const response = await fetch('http://localhost:3001/api/ai-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            provider: 'claude',
            apiKey: apiKey,
            currentTurn: currentTurn,
            fen: fen,
            legalMoves: legalMoves,
            moveHistory: moveHistory
        })
    });

    const data = await response.json();
    return data.move;
}

// GPT-4 via backend
async getGPTMove() {
    // Same structure, provider: 'gpt'
}
```

## Benefits of AI SDK Integration

### 1. **Unified Interface**
- Same code structure for multiple AI providers
- Easy to add new providers (Gemini, Mistral, etc.)
- Consistent error handling

### 2. **Better Maintainability**
- Single source of truth for AI provider configuration
- Easier to update API versions
- Centralized prompt management

### 3. **Improved Security**
- API keys are only sent to the backend
- Backend validates requests before calling AI providers
- Reduced client-side code exposure

### 4. **Enhanced Features**
- Built-in streaming support (future enhancement)
- Automatic retry logic
- Better error messages

### 5. **Type Safety** (if using TypeScript)
- Full TypeScript support
- Type-safe model configurations
- Compile-time error detection

## Configuration

### AI Models Used

**Claude AI:**
- Provider: `@ai-sdk/anthropic`
- Model: `claude-sonnet-4-5-20250929`
- Latest Claude Sonnet 4.5 with enhanced reasoning

**OpenAI:**
- Provider: `@ai-sdk/openai`
- Model: `gpt-4`
- Temperature: 0.7

### API Endpoint

**POST** `/api/ai-move`

**Request Body:**
```json
{
  "provider": "claude" | "gpt",
  "apiKey": "sk-ant-... or sk-...",
  "currentTurn": "White" | "Black",
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "legalMoves": [...array of chess.js move objects...],
  "moveHistory": [...array of previous moves...]
}
```

**Response:**
```json
{
  "move": "e4"
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

## Dependencies

### NPM Packages

```json
{
  "ai": "^6.0.27",                    // Vercel AI SDK core
  "@ai-sdk/anthropic": "^3.0.9",      // Anthropic provider
  "@ai-sdk/openai": "^3.0.7",         // OpenAI provider
  "express": "^5.2.1",                // Web server
  "cors": "^2.8.5"                    // CORS middleware
}
```

### Installation

```bash
npm install ai @ai-sdk/anthropic @ai-sdk/openai express cors
```

## Running the Application

### Development Mode

```bash
# Install dependencies
npm install

# Start the server
npm start

# Server runs on http://localhost:3001
```

### Production Deployment

The application can be deployed to Vercel, which natively supports:
- Node.js backends
- Serverless functions
- AI SDK integration

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Adding New AI Providers

The AI SDK makes it easy to add new providers:

### Example: Adding Google Gemini

1. **Install the provider:**
```bash
npm install @ai-sdk/google
```

2. **Update server.js:**
```javascript
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// In the endpoint handler
if (provider === 'gemini') {
    const google = createGoogleGenerativeAI({ apiKey });
    result = await generateText({
        model: google('gemini-pro'),
        prompt: prompt,
        maxTokens: 150,
    });
}
```

3. **Update frontend:**
Add "gemini" option to the AI player dropdowns in [index.html](index.html)

## Troubleshooting

### Common Issues

**Error: "Cannot find module 'ai'"**
- Run `npm install` to install dependencies

**Error: "fetch is not defined"**
- Ensure you're using Node.js 18+ (native fetch support)

**Error: "CORS policy blocked"**
- The server includes CORS middleware, but ensure it's running on the correct port

**Error: "API key is required"**
- Check that API keys are entered in the UI
- Verify the keys start with the correct prefix (`sk-ant-` or `sk-`)

### Debug Mode

Enable detailed logging in the server:

```javascript
app.post('/api/ai-move', async (req, res) => {
    console.log('Received request:', {
        provider: req.body.provider,
        currentTurn: req.body.currentTurn,
        fen: req.body.fen
    });

    // ... rest of handler
});
```

## Future Enhancements

### Potential Features with AI SDK

1. **Streaming Responses**
   - Real-time move generation with `streamText()`
   - Show AI thinking process

2. **Multi-Agent Conversations**
   - AI players can "discuss" strategy
   - Post-game analysis with commentary

3. **Caching**
   - Cache common positions
   - Faster response times

4. **Fine-tuning Support**
   - Custom chess models
   - Player-specific strategies

5. **Parallel Processing**
   - Evaluate multiple moves simultaneously
   - Faster minimax-style AI

## Resources

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [AI SDK GitHub](https://github.com/vercel/ai)
- [Anthropic Provider](https://sdk.vercel.ai/providers/ai-sdk-providers/anthropic)
- [OpenAI Provider](https://sdk.vercel.ai/providers/ai-sdk-providers/openai)

## Migration Notes

### Changes from Direct API Calls

**What Changed:**
- ✅ Added Node.js backend server
- ✅ Integrated Vercel AI SDK
- ✅ Updated Claude to use latest model (Sonnet 4.5)
- ✅ Unified API interface for both providers
- ✅ Better error handling

**What Stayed the Same:**
- ✅ UI and UX unchanged
- ✅ 3D chess board rendering
- ✅ Game logic and rules
- ✅ Move history and statistics
- ✅ Auto-restart functionality
- ✅ All chess AI strategies (Minimax, Aggressive, Random)

**Breaking Changes:**
- Server now required (can't run as static HTML)
- Port changed from 8000 to 3001
- API keys still needed (but passed through backend)

## License

This project uses the Vercel AI SDK under the Apache 2.0 license.
