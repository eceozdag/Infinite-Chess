// AI Chess Battle - Main Application
class ChessGame {
    constructor() {
        this.game = new Chess();
        this.moveHistory = [];
        this.isPlaying = false;
        this.isPaused = false;
        this.moveCount = 0;
        this.moveDelay = 1000;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.pieces = {};
        this.board = null;
        this.animating = false;

        this.whiteTime = 0;
        this.blackTime = 0;
        this.currentTurnStartTime = null;
        this.clockInterval = null;
        this.autoRestart = false;

        this.gamesPlayed = 0;
        this.whiteWins = 0;
        this.blackWins = 0;
        this.draws = 0;

        this.init();
    }

    init() {
        try {
            console.log('Initializing Chess Game...');
            console.log('THREE available:', typeof THREE !== 'undefined');
            console.log('Chess available:', typeof Chess !== 'undefined');
            console.log('OrbitControls available:', typeof THREE.OrbitControls !== 'undefined');

            this.initThreeJS();
            this.createBoard();
            this.createPieces();
            this.setupEventListeners();
            this.animate();

            document.getElementById('loading').style.display = 'none';
            console.log('Chess game initialized successfully!');
        } catch (error) {
            console.error('Error initializing chess game:', error);
            document.getElementById('loading').textContent = 'Error loading game: ' + error.message;
        }
    }

    initThreeJS() {
        const container = document.getElementById('canvas-container');

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a15);
        this.scene.fog = new THREE.Fog(0x0a0a15, 15, 30);

        this.camera = new THREE.PerspectiveCamera(
            50,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 14, 14);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        container.appendChild(this.renderer.domElement);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 8;
        this.controls.maxDistance = 25;
        this.controls.maxPolarAngle = Math.PI / 2.2;

        const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
        this.scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(8, 15, 8);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -12;
        mainLight.shadow.camera.right = 12;
        mainLight.shadow.camera.top = 12;
        mainLight.shadow.camera.bottom = -12;
        mainLight.shadow.bias = -0.0001;
        this.scene.add(mainLight);

        const fillLight = new THREE.DirectionalLight(0x6b8cff, 0.4);
        fillLight.position.set(-8, 10, -8);
        this.scene.add(fillLight);

        const backLight = new THREE.DirectionalLight(0xffaa88, 0.3);
        backLight.position.set(0, 5, -10);
        this.scene.add(backLight);

        const hemisphereLight = new THREE.HemisphereLight(0x4466ff, 0x223344, 0.5);
        this.scene.add(hemisphereLight);

        const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 20);
        pointLight1.position.set(6, 8, 6);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xaaccff, 0.3, 20);
        pointLight2.position.set(-6, 8, -6);
        this.scene.add(pointLight2);

        window.addEventListener('resize', () => this.onWindowResize());
    }

    createBoard() {
        const boardGroup = new THREE.Group();
        const squareSize = 1;
        const boardSize = 8;

        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const isLight = (row + col) % 2 === 0;
                const geometry = new THREE.BoxGeometry(squareSize, 0.3, squareSize);
                const material = new THREE.MeshStandardMaterial({
                    color: isLight ? 0xece8e0 : 0x8b7355,
                    roughness: 0.4,
                    metalness: 0.15,
                    emissive: isLight ? 0x111111 : 0x050505,
                    emissiveIntensity: 0.05
                });

                const square = new THREE.Mesh(geometry, material);
                square.position.set(
                    col - 3.5,
                    -0.15,
                    row - 3.5
                );
                square.receiveShadow = true;
                square.castShadow = true;
                boardGroup.add(square);

                const edgeGeo = new THREE.BoxGeometry(squareSize + 0.02, 0.05, squareSize + 0.02);
                const edgeMat = new THREE.MeshStandardMaterial({
                    color: isLight ? 0xd4cfc4 : 0x6d5a45,
                    roughness: 0.6,
                    metalness: 0.1
                });
                const edge = new THREE.Mesh(edgeGeo, edgeMat);
                edge.position.set(col - 3.5, 0.025, row - 3.5);
                edge.receiveShadow = true;
                boardGroup.add(edge);
            }
        }

        const baseGeometry = new THREE.BoxGeometry(9.5, 0.4, 9.5);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2520,
            roughness: 0.3,
            metalness: 0.5,
            emissive: 0x0a0808,
            emissiveIntensity: 0.1
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(0, -0.4, 0);
        base.receiveShadow = true;
        base.castShadow = true;
        boardGroup.add(base);

        const frameGeometry = new THREE.BoxGeometry(10, 0.3, 10);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1512,
            roughness: 0.2,
            metalness: 0.7
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(0, -0.65, 0);
        frame.receiveShadow = true;
        frame.castShadow = true;
        boardGroup.add(frame);

        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

        for (let i = 0; i < 8; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(files[i], 32, 32);

            const texture = new THREE.CanvasTexture(canvas);
            const labelMat = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: 0.7
            });
            const labelGeo = new THREE.PlaneGeometry(0.3, 0.3);
            const label = new THREE.Mesh(labelGeo, labelMat);
            label.position.set(i - 3.5, -0.8, 4.2);
            label.rotation.x = -Math.PI / 2;
            boardGroup.add(label);
        }

        this.scene.add(boardGroup);
        this.board = boardGroup;
    }

    createPieces() {
        const fen = this.game.fen();
        const rows = fen.split(' ')[0].split('/');

        rows.forEach((row, rowIndex) => {
            let colIndex = 0;
            for (let char of row) {
                if (isNaN(char)) {
                    const piece = char;
                    const isWhite = piece === piece.toUpperCase();
                    const position = this.indexToPosition(rowIndex, colIndex);
                    this.createPiece(piece.toLowerCase(), isWhite, position);
                    colIndex++;
                } else {
                    colIndex += parseInt(char);
                }
            }
        });
    }

    createPiece(type, isWhite, position) {
        const pieceGroup = new THREE.Group();

        let mainGeometry;
        const baseGeometry = new THREE.CylinderGeometry(0.35, 0.4, 0.1, 16);

        switch(type) {
            case 'p':
                mainGeometry = new THREE.Group();
                const pawnBase = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.25, 0.3, 0.3, 16),
                    new THREE.MeshStandardMaterial()
                );
                pawnBase.position.y = 0.15;
                const pawnBody = new THREE.Mesh(
                    new THREE.SphereGeometry(0.22, 16, 16),
                    new THREE.MeshStandardMaterial()
                );
                pawnBody.position.y = 0.45;
                mainGeometry.add(pawnBase);
                mainGeometry.add(pawnBody);
                break;
            case 'r':
                mainGeometry = new THREE.Group();
                const rookBody = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.3, 0.32, 0.7, 16),
                    new THREE.MeshStandardMaterial()
                );
                rookBody.position.y = 0.35;
                const rookTop = new THREE.Mesh(
                    new THREE.BoxGeometry(0.65, 0.25, 0.65),
                    new THREE.MeshStandardMaterial()
                );
                rookTop.position.y = 0.825;
                mainGeometry.add(rookBody);
                mainGeometry.add(rookTop);
                break;
            case 'n':
                mainGeometry = new THREE.Group();
                const knightBase = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.28, 0.32, 0.4, 16),
                    new THREE.MeshStandardMaterial()
                );
                knightBase.position.y = 0.2;
                const knightHead = new THREE.Mesh(
                    new THREE.ConeGeometry(0.25, 0.6, 4),
                    new THREE.MeshStandardMaterial()
                );
                knightHead.position.y = 0.7;
                knightHead.rotation.y = Math.PI / 4;
                mainGeometry.add(knightBase);
                mainGeometry.add(knightHead);
                break;
            case 'b':
                mainGeometry = new THREE.Group();
                const bishopBody = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.25, 0.3, 0.8, 16),
                    new THREE.MeshStandardMaterial()
                );
                bishopBody.position.y = 0.4;
                const bishopTop = new THREE.Mesh(
                    new THREE.SphereGeometry(0.2, 16, 16),
                    new THREE.MeshStandardMaterial()
                );
                bishopTop.position.y = 0.95;
                const bishopCross = new THREE.Mesh(
                    new THREE.BoxGeometry(0.08, 0.25, 0.08),
                    new THREE.MeshStandardMaterial()
                );
                bishopCross.position.y = 1.15;
                mainGeometry.add(bishopBody);
                mainGeometry.add(bishopTop);
                mainGeometry.add(bishopCross);
                break;
            case 'q':
                mainGeometry = new THREE.Group();
                const queenBody = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.28, 0.33, 0.8, 16),
                    new THREE.MeshStandardMaterial()
                );
                queenBody.position.y = 0.4;
                const queenTop = new THREE.Mesh(
                    new THREE.SphereGeometry(0.35, 16, 16),
                    new THREE.MeshStandardMaterial()
                );
                queenTop.position.y = 1.0;
                const queenCrown = new THREE.Mesh(
                    new THREE.ConeGeometry(0.15, 0.3, 8),
                    new THREE.MeshStandardMaterial()
                );
                queenCrown.position.y = 1.35;
                mainGeometry.add(queenBody);
                mainGeometry.add(queenTop);
                mainGeometry.add(queenCrown);
                break;
            case 'k':
                mainGeometry = new THREE.Group();
                const kingBody = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.3, 0.34, 0.9, 16),
                    new THREE.MeshStandardMaterial()
                );
                kingBody.position.y = 0.45;
                const kingTop = new THREE.Mesh(
                    new THREE.SphereGeometry(0.32, 16, 16),
                    new THREE.MeshStandardMaterial()
                );
                kingTop.position.y = 1.05;
                const kingCrossV = new THREE.Mesh(
                    new THREE.BoxGeometry(0.08, 0.35, 0.08),
                    new THREE.MeshStandardMaterial()
                );
                kingCrossV.position.y = 1.45;
                const kingCrossH = new THREE.Mesh(
                    new THREE.BoxGeometry(0.25, 0.08, 0.08),
                    new THREE.MeshStandardMaterial()
                );
                kingCrossH.position.y = 1.45;
                mainGeometry.add(kingBody);
                mainGeometry.add(kingTop);
                mainGeometry.add(kingCrossV);
                mainGeometry.add(kingCrossH);
                break;
        }

        const material = new THREE.MeshStandardMaterial({
            color: isWhite ? 0xf5f5f5 : 0x1a1a1a,
            roughness: isWhite ? 0.5 : 0.4,
            metalness: isWhite ? 0.2 : 0.6,
            emissive: isWhite ? 0x222222 : 0x000000,
            emissiveIntensity: 0.05
        });

        const baseMesh = new THREE.Mesh(baseGeometry, material);
        baseMesh.castShadow = true;
        baseMesh.receiveShadow = true;
        pieceGroup.add(baseMesh);

        if (mainGeometry.children) {
            mainGeometry.children.forEach(child => {
                child.material = material;
                child.castShadow = true;
                child.receiveShadow = true;
            });
            pieceGroup.add(mainGeometry);
        } else {
            mainGeometry.material = material;
            mainGeometry.castShadow = true;
            mainGeometry.receiveShadow = true;
            pieceGroup.add(mainGeometry);
        }

        const pos = this.boardPositionToWorld(position);
        pieceGroup.position.set(pos.x, 0.05, pos.z);

        this.scene.add(pieceGroup);
        this.pieces[position] = pieceGroup;
    }

    indexToPosition(row, col) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        return files[col] + ranks[row];
    }

    boardPositionToWorld(position) {
        const file = position.charCodeAt(0) - 'a'.charCodeAt(0);
        const rank = 8 - parseInt(position[1]);
        return {
            x: file - 3.5,
            z: rank - 3.5
        };
    }

    async movePiece(from, to) {
        if (!this.pieces[from]) return;

        this.animating = true;
        const piece = this.pieces[from];
        const targetPos = this.boardPositionToWorld(to);

        if (this.pieces[to]) {
            this.scene.remove(this.pieces[to]);
            delete this.pieces[to];
        }

        const startPos = { x: piece.position.x, z: piece.position.z };
        const duration = 500;
        const startTime = Date.now();

        return new Promise(resolve => {
            const animateMove = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = this.easeInOutCubic(progress);

                piece.position.x = startPos.x + (targetPos.x - startPos.x) * eased;
                piece.position.z = startPos.z + (targetPos.z - startPos.z) * eased;
                piece.position.y = 0.5 + Math.sin(progress * Math.PI) * 0.5;

                if (progress < 1) {
                    requestAnimationFrame(animateMove);
                } else {
                    piece.position.y = 0.5;
                    this.pieces[to] = piece;
                    delete this.pieces[from];
                    this.animating = false;
                    resolve();
                }
            };
            animateMove();
        });
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    async makeAIMove() {
        if (!this.isPlaying || this.isPaused || this.game.isGameOver()) return;

        const currentTurn = this.game.turn();
        const currentPlayer = currentTurn === 'w' ? 'White' : 'Black';
        const strategySelect = currentTurn === 'w' ? 'white-player' : 'black-player';
        const strategy = document.getElementById(strategySelect).value;

        this.currentTurnStartTime = Date.now();
        let move;

        try {
            switch(strategy) {
                case 'random':
                    move = this.getRandomMove();
                    break;
                case 'minimax':
                    move = this.getMinimaxMove();
                    break;
                case 'aggressive':
                    move = this.getAggressiveMove();
                    break;
                case 'claude':
                    move = await this.getClaudeMove();
                    break;
                case 'gpt':
                    move = await this.getGPTMove();
                    break;
                default:
                    move = this.getRandomMove();
            }

            if (move) {
                const moveTime = (Date.now() - this.currentTurnStartTime) / 1000;
                if (currentTurn === 'w') {
                    this.whiteTime += moveTime;
                } else {
                    this.blackTime += moveTime;
                }

                this.game.move(move);
                await this.movePiece(move.from, move.to);

                this.moveCount++;
                this.addMoveToHistory(move, currentPlayer, strategy);
                this.updateStatus();
                this.updateClock();

                if (this.game.isGameOver()) {
                    this.endGame();
                } else {
                    setTimeout(() => this.makeAIMove(), this.moveDelay);
                }
            }
        } catch (error) {
            console.error('Error making AI move:', error);
            document.getElementById('status-text').textContent = `Error: ${error.message}`;
            this.pauseGame();
        }
    }

    async getClaudeMove() {
        const apiKey = document.getElementById('anthropic-key').value;
        if (!apiKey) {
            throw new Error('Please enter your Anthropic API key');
        }

        const currentTurn = this.game.turn() === 'w' ? 'White' : 'Black';
        const fen = this.game.fen();
        const legalMoves = this.game.moves({ verbose: true });
        const moveHistory = this.game.history({ verbose: true });

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

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 150,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API request failed');
        }

        const data = await response.json();
        const moveText = data.content[0].text.trim();

        const selectedMove = legalMoves.find(m =>
            m.san === moveText ||
            m.lan === moveText ||
            (m.from + m.to) === moveText.toLowerCase()
        );

        if (!selectedMove) {
            console.warn(`Claude suggested "${moveText}", falling back to random move`);
            return this.getRandomMove();
        }

        return selectedMove;
    }

    async getGPTMove() {
        const apiKey = document.getElementById('openai-key').value;
        if (!apiKey) {
            throw new Error('Please enter your OpenAI API key');
        }

        const currentTurn = this.game.turn() === 'w' ? 'White' : 'Black';
        const fen = this.game.fen();
        const legalMoves = this.game.moves({ verbose: true });
        const moveHistory = this.game.history({ verbose: true });

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

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                max_tokens: 150,
                temperature: 0.7,
                messages: [{
                    role: 'system',
                    content: 'You are a chess grandmaster. Respond only with the chess move in standard algebraic notation.'
                }, {
                    role: 'user',
                    content: prompt
                }]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'OpenAI API request failed');
        }

        const data = await response.json();
        const moveText = data.choices[0].message.content.trim();

        const selectedMove = legalMoves.find(m =>
            m.san === moveText ||
            m.lan === moveText ||
            (m.from + m.to) === moveText.toLowerCase()
        );

        if (!selectedMove) {
            console.warn(`GPT suggested "${moveText}", falling back to random move`);
            return this.getRandomMove();
        }

        return selectedMove;
    }

    getRandomMove() {
        const moves = this.game.moves({ verbose: true });
        return moves[Math.floor(Math.random() * moves.length)];
    }

    getMinimaxMove() {
        const moves = this.game.moves({ verbose: true });
        let bestMove = moves[0];
        let bestValue = -Infinity;
        const isMaximizing = this.game.turn() === 'w';

        for (let move of moves) {
            this.game.move(move);
            const value = this.minimax(1, -Infinity, Infinity, !isMaximizing);
            this.game.undo();

            if (value > bestValue) {
                bestValue = value;
                bestMove = move;
            }
        }

        return bestMove;
    }

    minimax(depth, alpha, beta, isMaximizing) {
        if (depth === 0 || this.game.isGameOver()) {
            return this.evaluateBoard();
        }

        const moves = this.game.moves({ verbose: true });

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let move of moves) {
                this.game.move(move);
                const eval_score = this.minimax(depth - 1, alpha, beta, false);
                this.game.undo();
                maxEval = Math.max(maxEval, eval_score);
                alpha = Math.max(alpha, eval_score);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let move of moves) {
                this.game.move(move);
                const eval_score = this.minimax(depth - 1, alpha, beta, true);
                this.game.undo();
                minEval = Math.min(minEval, eval_score);
                beta = Math.min(beta, eval_score);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    evaluateBoard() {
        const pieceValues = {
            p: 1, n: 3, b: 3, r: 5, q: 9, k: 100
        };

        let score = 0;
        const board = this.game.board();

        for (let row of board) {
            for (let square of row) {
                if (square) {
                    const value = pieceValues[square.type];
                    score += square.color === 'w' ? value : -value;
                }
            }
        }

        return score;
    }

    getAggressiveMove() {
        const moves = this.game.moves({ verbose: true });
        const captureMoves = moves.filter(m => m.captured);

        if (captureMoves.length > 0) {
            return captureMoves[Math.floor(Math.random() * captureMoves.length)];
        }

        return moves[Math.floor(Math.random() * moves.length)];
    }

    addMoveToHistory(move, player, strategy) {
        const movesList = document.getElementById('moves-list');
        const moveItem = document.createElement('div');
        moveItem.className = `move-item ${player.toLowerCase()}`;

        const aiName = strategy === 'claude' ? '🤖 Claude' :
                      strategy === 'gpt' ? '🧠 GPT-4' :
                      strategy === 'minimax' ? '⚙️ Minimax' :
                      strategy === 'aggressive' ? '⚔️ Aggressive' : '🎲 Random';

        moveItem.textContent = `${this.moveCount}. ${player} (${aiName}): ${move.san || move.from + '-' + move.to}${move.captured ? ' x' + move.captured.toUpperCase() : ''}`;
        movesList.appendChild(moveItem);
        movesList.scrollTop = movesList.scrollHeight;
    }

    updateStatus() {
        const currentPlayer = this.game.turn() === 'w' ? 'White' : 'Black';
        document.getElementById('status-text').textContent = this.isPlaying ? 'Game in Progress' : 'Game Paused';
        document.getElementById('current-player').textContent = `Current Turn: ${currentPlayer}`;
        document.getElementById('move-counter').textContent = `Moves: ${this.moveCount}`;

        const whitePlayer = document.querySelector('.player-info.white-player');
        const blackPlayer = document.querySelector('.player-info.black-player');

        if (whitePlayer && blackPlayer) {
            if (currentPlayer === 'White') {
                whitePlayer.classList.add('active');
                blackPlayer.classList.remove('active');
            } else {
                blackPlayer.classList.add('active');
                whitePlayer.classList.remove('active');
            }
        }

        if (this.game.inCheck()) {
            document.getElementById('status-text').textContent = 'CHECK!';
        }
    }

    updateMatchupDisplay() {
        const whiteStrategy = document.getElementById('white-player').value;
        const blackStrategy = document.getElementById('black-player').value;

        const getAIName = (strategy) => {
            switch(strategy) {
                case 'claude': return '🤖 Claude AI';
                case 'gpt': return '🧠 GPT-4';
                case 'minimax': return '⚙️ Minimax';
                case 'aggressive': return '⚔️ Aggressive';
                case 'random': return '🎲 Random';
                default: return strategy;
            }
        };

        document.getElementById('white-ai-name').textContent = getAIName(whiteStrategy);
        document.getElementById('black-ai-name').textContent = getAIName(blackStrategy);
    }

    endGame() {
        this.isPlaying = false;
        this.gamesPlayed++;
        let result = '';
        let winner = null;

        if (this.game.isCheckmate()) {
            winner = this.game.turn() === 'w' ? 'Black' : 'White';
            result = `Checkmate! ${winner} Wins!`;
            if (winner === 'White') {
                this.whiteWins++;
            } else {
                this.blackWins++;
            }
        } else if (this.game.isDraw()) {
            result = 'Game Draw!';
            this.draws++;
        } else if (this.game.isStalemate()) {
            result = 'Stalemate!';
            this.draws++;
        } else if (this.game.isThreefoldRepetition()) {
            result = 'Draw by Repetition!';
            this.draws++;
        } else if (this.game.isInsufficientMaterial()) {
            result = 'Draw by Insufficient Material!';
            this.draws++;
        }

        document.getElementById('status-text').textContent = result;
        this.updateStats();

        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }

        const movesList = document.getElementById('moves-list');
        const resultItem = document.createElement('div');
        resultItem.className = 'move-item result';
        resultItem.style.background = 'rgba(255, 215, 0, 0.2)';
        resultItem.style.borderLeft = '3px solid #ffd700';
        resultItem.style.fontWeight = 'bold';
        resultItem.textContent = `🏁 Game ${this.gamesPlayed}: ${result}`;
        movesList.appendChild(resultItem);
        movesList.scrollTop = movesList.scrollHeight;

        if (this.autoRestart) {
            document.getElementById('start-btn').disabled = false;
            document.getElementById('pause-btn').disabled = true;
            setTimeout(() => {
                this.resetGame();
                this.startGame();
            }, 3000);
        } else {
            document.getElementById('start-btn').disabled = false;
            document.getElementById('pause-btn').disabled = true;
        }
    }

    startGame() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.isPaused = false;
            this.moveDelay = parseInt(document.getElementById('move-delay').value);

            document.getElementById('start-btn').disabled = true;
            document.getElementById('pause-btn').disabled = false;

            this.updateStatus();
            this.makeAIMove();
        }
    }

    pauseGame() {
        this.isPaused = !this.isPaused;
        document.getElementById('pause-btn').textContent = this.isPaused ? 'Resume Game' : 'Pause Game';

        if (!this.isPaused) {
            this.makeAIMove();
        }
    }

    resetGame() {
        this.game.reset();
        this.isPlaying = false;
        this.isPaused = false;
        this.moveCount = 0;
        this.whiteTime = 0;
        this.blackTime = 0;

        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }

        for (let pos in this.pieces) {
            this.scene.remove(this.pieces[pos]);
        }
        this.pieces = {};

        this.createPieces();

        if (!this.autoRestart) {
            document.getElementById('moves-list').innerHTML = '';
        }

        document.getElementById('status-text').textContent = 'Ready to Start';
        document.getElementById('current-player').textContent = '-';
        document.getElementById('move-counter').textContent = 'Moves: 0';
        document.getElementById('start-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
        document.getElementById('pause-btn').textContent = 'Pause Game';
        this.updateClock();
    }

    updateClock() {
        const formatTime = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };

        const whiteClockEl = document.getElementById('white-clock');
        const blackClockEl = document.getElementById('black-clock');

        if (whiteClockEl) whiteClockEl.textContent = formatTime(this.whiteTime);
        if (blackClockEl) blackClockEl.textContent = formatTime(this.blackTime);
    }

    updateStats() {
        const statsEl = document.getElementById('game-stats');
        if (statsEl) {
            statsEl.innerHTML = `
                <div class="stat-item">Games: ${this.gamesPlayed}</div>
                <div class="stat-item">⚪ Wins: ${this.whiteWins}</div>
                <div class="stat-item">⚫ Wins: ${this.blackWins}</div>
                <div class="stat-item">🤝 Draws: ${this.draws}</div>
            `;
        }
    }

    setupEventListeners() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('pause-btn').addEventListener('click', () => this.pauseGame());
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.gamesPlayed = 0;
            this.whiteWins = 0;
            this.blackWins = 0;
            this.draws = 0;
            this.resetGame();
            this.updateStats();
        });

        const autoRestartCheckbox = document.getElementById('auto-restart');
        if (autoRestartCheckbox) {
            autoRestartCheckbox.addEventListener('change', (e) => {
                this.autoRestart = e.target.checked;
            });
        }

        document.getElementById('white-player').addEventListener('change', () => this.updateMatchupDisplay());
        document.getElementById('black-player').addEventListener('change', () => this.updateMatchupDisplay());

        this.updateMatchupDisplay();
    }

    onWindowResize() {
        const container = document.getElementById('canvas-container');
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    // Check if all required libraries are loaded
    if (typeof THREE === 'undefined') {
        console.error('Three.js library not loaded');
        document.getElementById('loading').textContent = 'Error: Three.js library failed to load';
        return;
    }

    if (typeof Chess === 'undefined') {
        console.error('Chess.js library not loaded');
        document.getElementById('loading').textContent = 'Error: Chess.js library failed to load';
        return;
    }

    if (typeof THREE.OrbitControls === 'undefined') {
        console.error('OrbitControls not loaded');
        document.getElementById('loading').textContent = 'Error: OrbitControls failed to load';
        return;
    }

    console.log('All libraries loaded successfully, initializing game...');
    new ChessGame();
});
