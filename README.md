# AI Chess Battle - 3D

A stunning web application where AI models play chess against each other on a beautiful 3D chess board with real-time move visualization. Watch Claude AI battle against traditional chess engines!

## Features

- **3D Chess Board**: Premium 3D visualization with cinematic lighting, shadows, and smooth animations
- **Claude AI Integration**: Connect to Anthropic's API to have Claude play chess with strategic thinking
- **AI vs AI Gameplay**: Configure different AI opponents for White and Black
- **Multiple AI Strategies**:
  - **Claude AI (API)**: Uses Anthropic's Claude 3.5 Sonnet for intelligent chess playing
  - **Minimax Algorithm**: Traditional chess AI with alpha-beta pruning (depth 2)
  - **Aggressive**: Prioritizes capturing opponent pieces
  - **Random Moves**: Simple random move selection
- **Real-time Move Display**: Smooth 3D animations for every move
- **Move History**: Complete history showing which AI made each move
- **Interactive Controls**:
  - Orbit, zoom, and pan camera around the board
  - Pause/Resume gameplay
  - Adjustable move delay
  - Reset game anytime
- **Beautiful UI**: Modern glassmorphic design with gradient effects

## Technologies Used

- **Three.js**: Advanced 3D graphics and rendering
- **chess.js**: Chess game logic and move validation
- **Anthropic API**: Claude AI for strategic chess playing
- **OrbitControls**: Interactive camera control
- **Pure JavaScript**: No build tools required

## Setup Instructions

### Quick Start (Local Development)

1. Open a terminal in the project directory
2. Start a local server:
   ```bash
   npm start
   ```
   Or use Python:
   ```bash
   python3 -m http.server 8000
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

### Deploy to Vercel

The easiest way to deploy this app to the web:

1. **Install Vercel CLI** (if you haven't already):
   ```bash
   npm install -g vercel
   ```

2. **Deploy the app**:
   ```bash
   cd /path/to/Infinite-Chess
   vercel
   ```

3. **Follow the prompts**:
   - Log in to your Vercel account (or create one)
   - Confirm the project settings
   - Deploy!

4. **Your app will be live** at a URL like: `https://your-project.vercel.app`

**Alternative: Deploy via Vercel Dashboard**
1. Visit [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository (or drag & drop the project folder)
4. Click "Deploy"

The project includes a `vercel.json` configuration file for optimal deployment.

### Alternative Setup

Simply open [index.html](index.html) directly in a modern web browser. Note that some browsers may block external scripts when opening local files, so using a local server is recommended.

## How to Use

### Getting Your Anthropic API Key

To use Claude AI as a chess player:

1. Visit [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-...`)

### Playing a Game

1. **Configure AI Players**:
   - Select AI for **White Player** (Claude AI, Minimax, Aggressive, or Random)
   - Select AI for **Black Player** (Claude AI, Minimax, Aggressive, or Random)
   - If using Claude AI, paste your Anthropic API key
   - Adjust move delay in milliseconds (default: 1500ms)

2. **Start the Game**:
   - Click "Start AI Battle" to begin
   - Watch the AIs play automatically
   - Claude will analyze positions and make strategic moves via the Anthropic API

3. **Control Gameplay**:
   - Click "Pause Game" to pause/resume
   - Use mouse to rotate, zoom, and pan the camera
   - Click "Reset Game" to start a new match

4. **View Move History**:
   - All moves are displayed in the sidebar with AI indicators (🤖 Claude, 🧠 Minimax, etc.)
   - White moves have a white border, black moves have a black border
   - Captures are shown in the move notation

## AI Players Explained

### Claude AI (Anthropic API) 🤖
- **How it works**: Sends board position to Claude via Anthropic API
- **Strategy**: Analyzes position considering piece safety, tactics, king safety, and material
- **Strength**: Advanced strategic thinking with LLM reasoning
- **Speed**: Slower due to API calls (typically 1-3 seconds per move)
- **Cost**: Uses Anthropic API credits (approximately $0.003 per move)
- **Best for**: Watching intelligent, human-like chess playing

### Minimax Algorithm 🧠
- **How it works**: Traditional chess AI with alpha-beta pruning
- **Strategy**: Evaluates future positions up to depth 2
- **Strength**: Solid tactical play, material-focused
- **Speed**: Fast (< 100ms per move)
- **Cost**: Free (runs locally)
- **Best for**: Competitive games without API usage

### Aggressive ⚔️
- **How it works**: Prioritizes capturing moves
- **Strategy**: Always captures when possible
- **Strength**: Creates exciting, dynamic games
- **Speed**: Very fast (< 10ms per move)
- **Cost**: Free (runs locally)
- **Best for**: Action-packed demonstrations

### Random 🎲
- **How it works**: Selects legal moves randomly
- **Strategy**: No strategy
- **Strength**: Weak, unpredictable
- **Speed**: Instant (< 1ms per move)
- **Cost**: Free (runs locally)
- **Best for**: Quick tests and debugging

### Controls

**Mouse**
- Left click + drag: Rotate camera
- Right click + drag: Pan camera
- Scroll wheel: Zoom in/out

**Buttons**
- Start AI Battle: Begin automatic AI gameplay
- Pause Game: Pause/resume the current game
- Reset Game: Clear the board and start fresh

## Project Structure

```
Infinite-Chess/
├── index.html          # Main HTML file with UI structure
├── app.js             # Chess game logic and 3D rendering
├── package.json       # Project configuration
└── README.md          # This file
```

## How It Works

### 3D Rendering
- Three.js creates a perspective camera and WebGL renderer with HDR tone mapping
- Chess board built with layered meshes (squares, edges, base, frame)
- Pieces are composite 3D models with distinctive shapes per piece type
- Advanced lighting system:
  - Main directional light with high-res shadow maps (2048x2048)
  - Fill and back lights for depth and atmosphere
  - Point lights for highlights
  - Hemisphere and ambient lights for ambient illumination
  - Soft shadows with PCF filtering
- OrbitControls with distance and angle constraints
- Fog effect for depth perception

### Chess Logic
- chess.js library handles all game rules and validation
- Maintains game state using FEN notation
- Validates legal moves and detects check/checkmate/stalemate
- Tracks captured pieces and move history
- Supports standard algebraic notation (SAN) for moves

### AI Implementation
- **Claude AI**: Sends board position (FEN) and legal moves to Anthropic API
  - Provides strategic context in prompt (material, tactics, king safety)
  - Parses Claude's response to extract chosen move
  - Falls back to random move if parsing fails
  - Uses Claude 3.5 Sonnet model for best chess reasoning
- **Minimax**: Recursive algorithm that evaluates future positions
  - Alpha-beta pruning optimizes search
  - Position evaluation based on material count (P=1, N=3, B=3, R=5, Q=9, K=100)
  - Searches to depth 2 for balanced performance
- **Aggressive**: Filters moves for captures when possible, else random
- **Random**: Simple random selection from legal moves

### Move Animation
- Smooth interpolation between positions using cubic easing functions
- Pieces arc through the air during movement with sine wave trajectory
- Captured pieces removed from scene with fade effect
- 500ms animation duration for visual appeal
- Y-axis animation for realistic piece lifting

## Browser Compatibility

Works best in modern browsers with WebGL support:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Optimized rendering with requestAnimationFrame
- Efficient minimax with alpha-beta pruning
- Shadow mapping for realistic visuals
- Smooth 60 FPS animation

## Example Matchups

Try these interesting AI battles:

1. **Claude vs Claude**: Watch two instances of Claude play against each other (requires API key)
2. **Claude vs Minimax**: AI reasoning vs traditional chess algorithm
3. **Minimax vs Aggressive**: Strategic depth vs tactical aggression
4. **Claude vs Random**: See how Claude handles weak opposition

## API Usage and Costs

When using Claude AI:
- Each move costs approximately $0.003 USD
- A typical 40-move game costs about $0.12
- API calls take 1-3 seconds per move
- Requires active Anthropic account with API access

## Troubleshooting

**"Please enter your Anthropic API key" error**
- Make sure you've pasted your API key in the configuration panel
- Verify the key starts with `sk-ant-`

**Claude making invalid moves**
- This is rare but can happen
- The app automatically falls back to a random legal move
- Check browser console for details

**Slow performance**
- Disable shadows in browser if needed
- Reduce move delay to speed up the game
- Use local AI (Minimax, Aggressive, Random) instead of API calls

**Board not loading**
- Check browser console for errors
- Ensure you're using a modern browser with WebGL support
- Try using a local server instead of opening HTML directly

## Future Enhancements

Possible improvements:
- Support for other LLM APIs (OpenAI GPT, Google Gemini)
- Deeper minimax search with configurable depth
- Neural network-based chess engines
- Higher quality 3D piece models (STL/OBJ imports)
- Sound effects for moves, captures, and check
- Post-game analysis with move evaluation
- Save/load game state to localStorage
- PGN export for games
- Opening book for traditional AIs
- Stockfish engine integration

## License

This project is open source and available for educational purposes.

## Credits

Built with:
- Three.js for 3D graphics
- chess.js for chess engine
- Modern JavaScript ES6+

Enjoy watching the AI battle!
