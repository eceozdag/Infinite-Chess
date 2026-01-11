import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// AI move endpoint
app.post('/api/ai-move', async (req, res) => {
    try {
        const { provider, apiKey, currentTurn, fen, legalMoves, moveHistory, withCommentary } = req.body;

        if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' });
        }

        // Enhanced GM commentary prompt for Groq
        const gmPrompt = `You are a world-renowned chess Grandmaster providing live commentary on a game. You are playing as ${currentTurn}.

Current position (FEN): ${fen}
Legal moves: ${legalMoves.map(m => m.san).join(', ')}
Recent moves: ${moveHistory.length > 0 ? moveHistory.slice(-10).map(m => m.san).join(' ') : 'Opening position'}

Analyze this position like a GM commentator. Think about:
1. Immediate tactical threats and opportunities
2. Positional considerations (center control, piece activity, pawn structure)
3. King safety for both sides
4. Strategic plans

Choose the best move and explain your thinking with personality and insight.

IMPORTANT: Respond with ONLY valid JSON in this exact format:
{"move": "e4", "commentary": "Your insightful analysis here (2-3 sentences max)"}

The move MUST be from the legal moves list. Be confident, insightful, and occasionally witty.`;

        // Simple prompt for non-commentary requests
        const simplePrompt = `You are playing chess as ${currentTurn}.

Current board position (FEN): ${fen}

Legal moves available: ${legalMoves.map(m => m.san).join(', ')}

Move history: ${moveHistory.length > 0 ? moveHistory.slice(-10).map(m => m.san).join(' ') : 'Game just started'}

Please analyze the position and choose your best move. Consider:
- Piece safety and control of the center
- Tactical opportunities (forks, pins, skewers)
- King safety
- Material balance

Respond with ONLY the move in standard algebraic notation (e.g., "e4", "Nf3", "O-O"). Choose from the legal moves listed above.`;

        const prompt = withCommentary ? gmPrompt : simplePrompt;

        let result;

        if (provider === 'claude') {
            const anthropic = createAnthropic({
                apiKey: apiKey,
            });

            result = await generateText({
                model: anthropic('claude-sonnet-4-5-20250929'),
                prompt: prompt,
                maxTokens: withCommentary ? 300 : 150,
                temperature: 0.4,
            });
        } else if (provider === 'deepseek') {
            // DeepSeek uses OpenAI-compatible API
            const deepseek = createOpenAI({
                apiKey: apiKey,
                baseURL: 'https://api.deepseek.com',
            });

            result = await generateText({
                model: deepseek('deepseek-chat'),
                prompt: prompt,
                maxTokens: withCommentary ? 300 : 150,
                temperature: 0.4,
            });
        } else if (provider === 'groq') {
            // Groq uses OpenAI-compatible API
            const groq = createOpenAI({
                apiKey: apiKey,
                baseURL: 'https://api.groq.com/openai/v1',
            });

            result = await generateText({
                model: groq('llama-3.3-70b-versatile'),
                prompt: prompt,
                maxTokens: withCommentary ? 300 : 150,
                temperature: 0.4,
            });
        } else {
            return res.status(400).json({ error: 'Invalid provider' });
        }

        const responseText = result.text.trim();

        // Try to parse as JSON for commentary mode
        if (withCommentary) {
            try {
                // Extract JSON from response (in case there's extra text)
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    res.json({
                        move: parsed.move,
                        commentary: parsed.commentary || ''
                    });
                    return;
                }
            } catch (e) {
                console.log('Failed to parse JSON commentary, falling back to move extraction');
            }
        }

        // Fallback: just return the move
        res.json({ move: responseText, commentary: '' });

    } catch (error) {
        console.error('AI move error:', error);
        const errorMessage = error.message || 'Failed to get AI move';
        const statusCode = error.status || 500;
        res.status(statusCode).json({
            error: errorMessage,
            details: error.cause?.message || null
        });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`AI Chess Backend running on http://localhost:${PORT}`);
    console.log(`Frontend available at http://localhost:${PORT}`);
});
