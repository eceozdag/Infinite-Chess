# Changelog

## [2.0.0] - 2026-01-10

### Major Changes - Vercel AI SDK Integration

#### Added
- **Vercel AI SDK Integration**: Replaced direct API calls with unified AI SDK
  - `@ai-sdk/anthropic` for Claude AI
  - `@ai-sdk/openai` for OpenAI GPT-4
  - `ai` core package for text generation
- **Express Backend**: Node.js server to handle AI SDK requests
  - Endpoint: `POST /api/ai-move`
  - CORS support for development
  - Static file serving
- **New Documentation**:
  - `AI_SDK_INTEGRATION.md`: Comprehensive AI SDK integration guide
  - Updated `README.md` with new setup instructions
  - Updated `DEPLOYMENT.md` for Node.js deployment

#### Changed
- **Claude AI Model**: Upgraded to `claude-sonnet-4-5-20250929` (latest Sonnet 4.5)
- **Architecture**: Frontend now communicates with backend API instead of direct provider APIs
- **Port**: Application now runs on port 3001 (was 8000)
- **Startup**: Use `npm start` instead of Python HTTP server
- **Dependencies**: Added Express, CORS, and AI SDK packages

#### Technical Improvements
- **Unified Interface**: Same code structure for all AI providers
- **Better Error Handling**: Centralized error management
- **Maintainability**: Easier to add new AI providers
- **Security**: API keys processed server-side only

#### What Stayed the Same
- ✅ All UI and UX elements unchanged
- ✅ 3D chess board rendering
- ✅ Game logic and chess rules
- ✅ Move history and statistics
- ✅ Auto-restart functionality
- ✅ All traditional chess AI strategies (Minimax, Aggressive, Random)
- ✅ Camera controls and animations

### Migration Guide

**Before (v1.x):**
```bash
npm start  # Started Python HTTP server on port 8000
```

**After (v2.0):**
```bash
npm install  # Install dependencies
npm start    # Start Node.js server on port 3001
```

**API Key Entry:** Same as before - enter keys in the UI sidebar

### Dependencies

```json
{
  "ai": "^6.0.27",
  "@ai-sdk/anthropic": "^3.0.9",
  "@ai-sdk/openai": "^3.0.7",
  "express": "^5.2.1",
  "cors": "^2.8.5"
}
```

### Breaking Changes

- **Node.js Required**: Application now requires Node.js 18+ (no longer runs as static HTML)
- **Port Change**: Default port changed from 8000 → 3001
- **Backend Required**: Cannot run frontend-only; server must be running

### Upgrade Instructions

1. Pull latest code
2. Run `npm install` to install new dependencies
3. Update any scripts/bookmarks to use port 3001
4. Start with `npm start`

### Future Roadmap

- [ ] Add streaming AI responses
- [ ] Support for additional AI providers (Gemini, Mistral, etc.)
- [ ] Position caching for faster responses
- [ ] Multi-agent AI conversations
- [ ] Post-game AI analysis with commentary

---

## [1.0.0] - 2026-01-09

### Initial Release

- 3D chess board with Three.js
- AI vs AI gameplay
- Claude AI integration (direct API)
- OpenAI GPT-4 integration (direct API)
- Traditional chess engines (Minimax, Aggressive, Random)
- Move history and statistics
- Auto-restart mode
- Chess clocks
