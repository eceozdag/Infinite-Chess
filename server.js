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
        const { provider, apiKey, currentTurn, fen, legalMoves, moveHistory } = req.body;

        if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' });
        }

        const prompt = `You are playing chess as ${currentTurn}.

Current board position (FEN): ${fen}

Legal moves available: ${legalMoves.map(m => m.san).join(', ')}

Move history: ${moveHistory.length > 0 ? moveHistory.slice(-10).map(m => m.san).join(' ') : 'Game just started'}

Please analyze the position and choose your best move. Consider:
- Piece safety and control of the center
- Tactical opportunities (forks, pins, skewers)
- King safety
- Material balance

Respond with ONLY the move in standard algebraic notation (e.g., "e4", "Nf3", "O-O"). Choose from the legal moves listed above.`;

        let result;

        if (provider === 'claude') {
            const anthropic = createAnthropic({
                apiKey: apiKey,
            });

            result = await generateText({
                model: anthropic('claude-sonnet-4-5-20250929'),
                prompt: prompt,
                maxTokens: 150,
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
                maxTokens: 150,
                temperature: 0.7,
            });
        } else {
            return res.status(400).json({ error: 'Invalid provider' });
        }

        const moveText = result.text.trim();
        res.json({ move: moveText });

    } catch (error) {
        console.error('AI move error:', error);
        res.status(500).json({ error: error.message || 'Failed to get AI move' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`AI Chess Backend running on http://localhost:${PORT}`);
    console.log(`Frontend available at http://localhost:${PORT}`);
});
