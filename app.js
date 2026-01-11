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

        // Main piece material - high contrast colors
        const mainColor = isWhite ? 0xffffff : 0x1a1a1a;
        const material = new THREE.MeshStandardMaterial({
            color: mainColor,
            roughness: isWhite ? 0.3 : 0.2,
            metalness: isWhite ? 0.1 : 0.4,
            emissive: isWhite ? 0x333333 : 0x000000,
            emissiveIntensity: 0.1
        });

        // Accent material for details
        const accentColor = isWhite ? 0xdddddd : 0x333333;
        const accentMaterial = new THREE.MeshStandardMaterial({
            color: accentColor,
            roughness: 0.4,
            metalness: 0.3
        });

        // Team color ring at base (blue for white, red for black)
        const ringColor = isWhite ? 0x4488ff : 0xff4444;
        const ringMaterial = new THREE.MeshStandardMaterial({
            color: ringColor,
            roughness: 0.3,
            metalness: 0.6,
            emissive: ringColor,
            emissiveIntensity: 0.4
        });

        // Base platform with colored ring
        const baseGeometry = new THREE.CylinderGeometry(0.38, 0.42, 0.08, 24);
        const baseMesh = new THREE.Mesh(baseGeometry, material);
        baseMesh.position.y = 0.04;
        baseMesh.castShadow = true;
        baseMesh.receiveShadow = true;
        pieceGroup.add(baseMesh);

        // Glowing ring
        const ringGeometry = new THREE.TorusGeometry(0.4, 0.04, 8, 32);
        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        ringMesh.position.y = 0.02;
        ringMesh.rotation.x = Math.PI / 2;
        pieceGroup.add(ringMesh);

        // Height scale factors for each piece type
        // Pawn: 0.7, Rook: 1.0, Knight: 1.1, Bishop: 1.2, Queen: 1.4, King: 1.6

        switch(type) {
            case 'p': // PAWN - smallest, simple rounded top (height ~0.7)
                const pawnStem = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.18, 0.28, 0.35, 16),
                    material
                );
                pawnStem.position.y = 0.26;
                pawnStem.castShadow = true;
                pieceGroup.add(pawnStem);

                const pawnNeck = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.12, 0.18, 0.15, 16),
                    material
                );
                pawnNeck.position.y = 0.51;
                pawnNeck.castShadow = true;
                pieceGroup.add(pawnNeck);

                const pawnHead = new THREE.Mesh(
                    new THREE.SphereGeometry(0.16, 16, 16),
                    material
                );
                pawnHead.position.y = 0.7;
                pawnHead.castShadow = true;
                pieceGroup.add(pawnHead);
                break;

            case 'r': // ROOK - castle tower with battlements (height ~1.0)
                const rookBase = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.28, 0.32, 0.2, 16),
                    material
                );
                rookBase.position.y = 0.18;
                rookBase.castShadow = true;
                pieceGroup.add(rookBase);

                const rookBody = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.24, 0.28, 0.5, 16),
                    material
                );
                rookBody.position.y = 0.53;
                rookBody.castShadow = true;
                pieceGroup.add(rookBody);

                const rookTop = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.3, 0.24, 0.15, 16),
                    material
                );
                rookTop.position.y = 0.86;
                rookTop.castShadow = true;
                pieceGroup.add(rookTop);

                // Battlements (4 merlons)
                for (let i = 0; i < 4; i++) {
                    const merlon = new THREE.Mesh(
                        new THREE.BoxGeometry(0.14, 0.18, 0.14),
                        material
                    );
                    const angle = (i / 4) * Math.PI * 2;
                    merlon.position.set(
                        Math.cos(angle) * 0.2,
                        1.02,
                        Math.sin(angle) * 0.2
                    );
                    merlon.castShadow = true;
                    pieceGroup.add(merlon);
                }
                break;

            case 'n': // KNIGHT - horse head shape (height ~1.1)
                const knightBase = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.26, 0.32, 0.25, 16),
                    material
                );
                knightBase.position.y = 0.21;
                knightBase.castShadow = true;
                pieceGroup.add(knightBase);

                // Horse neck (angled cylinder)
                const knightNeck = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.16, 0.22, 0.5, 16),
                    material
                );
                knightNeck.position.y = 0.55;
                knightNeck.position.z = -0.08;
                knightNeck.rotation.x = 0.3;
                knightNeck.castShadow = true;
                pieceGroup.add(knightNeck);

                // Horse head (elongated box)
                const knightHead = new THREE.Mesh(
                    new THREE.BoxGeometry(0.22, 0.35, 0.4),
                    material
                );
                knightHead.position.y = 0.9;
                knightHead.position.z = -0.15;
                knightHead.rotation.x = 0.4;
                knightHead.castShadow = true;
                pieceGroup.add(knightHead);

                // Horse snout
                const knightSnout = new THREE.Mesh(
                    new THREE.BoxGeometry(0.16, 0.18, 0.25),
                    material
                );
                knightSnout.position.y = 0.85;
                knightSnout.position.z = -0.38;
                knightSnout.rotation.x = 0.2;
                knightSnout.castShadow = true;
                pieceGroup.add(knightSnout);

                // Ears
                const ear1 = new THREE.Mesh(
                    new THREE.ConeGeometry(0.06, 0.15, 8),
                    material
                );
                ear1.position.set(-0.08, 1.12, -0.1);
                ear1.rotation.x = -0.3;
                ear1.castShadow = true;
                pieceGroup.add(ear1);

                const ear2 = new THREE.Mesh(
                    new THREE.ConeGeometry(0.06, 0.15, 8),
                    material
                );
                ear2.position.set(0.08, 1.12, -0.1);
                ear2.rotation.x = -0.3;
                ear2.castShadow = true;
                pieceGroup.add(ear2);
                break;

            case 'b': // BISHOP - tall with diagonal slit (height ~1.2)
                const bishopBase = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.26, 0.32, 0.2, 16),
                    material
                );
                bishopBase.position.y = 0.18;
                bishopBase.castShadow = true;
                pieceGroup.add(bishopBase);

                const bishopBody = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.14, 0.26, 0.6, 16),
                    material
                );
                bishopBody.position.y = 0.58;
                bishopBody.castShadow = true;
                pieceGroup.add(bishopBody);

                // Bishop mitre (pointed top)
                const bishopMitre = new THREE.Mesh(
                    new THREE.ConeGeometry(0.18, 0.35, 16),
                    material
                );
                bishopMitre.position.y = 1.06;
                bishopMitre.castShadow = true;
                pieceGroup.add(bishopMitre);

                // Diagonal slit (dark accent)
                const slitMaterial = new THREE.MeshStandardMaterial({
                    color: isWhite ? 0x222222 : 0x666666,
                    roughness: 0.5
                });
                const slit = new THREE.Mesh(
                    new THREE.BoxGeometry(0.22, 0.04, 0.08),
                    slitMaterial
                );
                slit.position.y = 1.0;
                slit.rotation.z = Math.PI / 4;
                pieceGroup.add(slit);

                // Top ball
                const bishopTop = new THREE.Mesh(
                    new THREE.SphereGeometry(0.08, 12, 12),
                    material
                );
                bishopTop.position.y = 1.28;
                bishopTop.castShadow = true;
                pieceGroup.add(bishopTop);
                break;

            case 'q': // QUEEN - crown with spikes (height ~1.4)
                const queenBase = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.28, 0.34, 0.2, 16),
                    material
                );
                queenBase.position.y = 0.18;
                queenBase.castShadow = true;
                pieceGroup.add(queenBase);

                const queenBody = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.18, 0.28, 0.7, 16),
                    material
                );
                queenBody.position.y = 0.63;
                queenBody.castShadow = true;
                pieceGroup.add(queenBody);

                const queenNeck = new THREE.Mesh(
                    new THREE.SphereGeometry(0.22, 16, 16),
                    material
                );
                queenNeck.position.y = 1.05;
                queenNeck.castShadow = true;
                pieceGroup.add(queenNeck);

                // Crown spikes (8 points)
                for (let i = 0; i < 8; i++) {
                    const spike = new THREE.Mesh(
                        new THREE.ConeGeometry(0.05, 0.2, 8),
                        material
                    );
                    const angle = (i / 8) * Math.PI * 2;
                    spike.position.set(
                        Math.cos(angle) * 0.15,
                        1.3,
                        Math.sin(angle) * 0.15
                    );
                    spike.castShadow = true;
                    pieceGroup.add(spike);
                }

                // Crown jewel on top
                const queenJewel = new THREE.Mesh(
                    new THREE.SphereGeometry(0.08, 12, 12),
                    ringMaterial
                );
                queenJewel.position.y = 1.42;
                pieceGroup.add(queenJewel);
                break;

            case 'k': // KING - tallest with prominent cross (height ~1.6)
                const kingBase = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.3, 0.36, 0.22, 16),
                    material
                );
                kingBase.position.y = 0.19;
                kingBase.castShadow = true;
                pieceGroup.add(kingBase);

                const kingBody = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.2, 0.3, 0.8, 16),
                    material
                );
                kingBody.position.y = 0.69;
                kingBody.castShadow = true;
                pieceGroup.add(kingBody);

                const kingNeck = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.22, 0.2, 0.15, 16),
                    material
                );
                kingNeck.position.y = 1.17;
                kingNeck.castShadow = true;
                pieceGroup.add(kingNeck);

                // Crown band
                const kingCrown = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.24, 0.22, 0.12, 16),
                    accentMaterial
                );
                kingCrown.position.y = 1.3;
                kingCrown.castShadow = true;
                pieceGroup.add(kingCrown);

                // Large cross - vertical
                const crossV = new THREE.Mesh(
                    new THREE.BoxGeometry(0.1, 0.4, 0.1),
                    material
                );
                crossV.position.y = 1.56;
                crossV.castShadow = true;
                pieceGroup.add(crossV);

                // Large cross - horizontal
                const crossH = new THREE.Mesh(
                    new THREE.BoxGeometry(0.3, 0.1, 0.1),
                    material
                );
                crossH.position.y = 1.6;
                crossH.castShadow = true;
                pieceGroup.add(crossH);
                break;
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
                    piece.position.y = 0.05;
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
        if (!this.isPlaying || this.isPaused || this.game.game_over()) return;

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
                case 'deepseek':
                    move = await this.getDeepSeekMove();
                    break;
                case 'groq':
                    move = await this.getGroqMove();
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
                this.updateEvalBar();

                // Update GM commentary if available
                if (move.commentary) {
                    this.updateCommentary(move.san, currentPlayer, move.commentary);
                } else if (strategy === 'groq' || strategy === 'claude' || strategy === 'deepseek') {
                    // Clear old commentary for AI moves without new commentary
                    this.updateCommentary(move.san, currentPlayer, '');
                }

                if (this.game.game_over()) {
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

        // Call backend API with AI SDK integration
        const response = await fetch('/api/ai-move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                provider: 'claude',
                apiKey: apiKey,
                currentTurn: currentTurn,
                fen: fen,
                legalMoves: legalMoves,
                moveHistory: moveHistory
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API request failed');
        }

        const data = await response.json();
        const moveText = data.move;

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

    async getDeepSeekMove() {
        const apiKey = document.getElementById('deepseek-key').value;
        if (!apiKey) {
            throw new Error('Please enter your DeepSeek API key');
        }

        const currentTurn = this.game.turn() === 'w' ? 'White' : 'Black';
        const fen = this.game.fen();
        const legalMoves = this.game.moves({ verbose: true });
        const moveHistory = this.game.history({ verbose: true });

        // Call backend API with AI SDK integration
        const response = await fetch('/api/ai-move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                provider: 'deepseek',
                apiKey: apiKey,
                currentTurn: currentTurn,
                fen: fen,
                legalMoves: legalMoves,
                moveHistory: moveHistory
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'DeepSeek API request failed');
        }

        const data = await response.json();
        const moveText = data.move;

        const selectedMove = legalMoves.find(m =>
            m.san === moveText ||
            m.lan === moveText ||
            (m.from + m.to) === moveText.toLowerCase()
        );

        if (!selectedMove) {
            console.warn(`DeepSeek suggested "${moveText}", falling back to random move`);
            return this.getRandomMove();
        }

        return selectedMove;
    }

    async getGroqMove() {
        const apiKey = document.getElementById('groq-key').value;
        if (!apiKey) {
            throw new Error('Please enter your Groq API key');
        }

        const currentTurn = this.game.turn() === 'w' ? 'White' : 'Black';
        const fen = this.game.fen();
        const legalMoves = this.game.moves({ verbose: true });
        const moveHistory = this.game.history({ verbose: true });

        console.log(`[Groq ${currentTurn}] FEN: ${fen}`);
        console.log(`[Groq ${currentTurn}] Legal moves:`, legalMoves.map(m => m.san).join(', '));

        const response = await fetch('/api/ai-move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                provider: 'groq',
                apiKey: apiKey,
                currentTurn: currentTurn,
                fen: fen,
                legalMoves: legalMoves,
                moveHistory: moveHistory,
                withCommentary: true
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Groq API request failed');
        }

        const data = await response.json();
        const moveText = (data.move || '').trim();
        const commentary = data.commentary || '';

        console.log(`[Groq ${currentTurn}] AI suggested: "${moveText}"`);
        if (commentary) {
            console.log(`[Groq ${currentTurn}] Commentary: "${commentary}"`);
        }

        // Try multiple parsing strategies
        let selectedMove = legalMoves.find(m => m.san === moveText);

        if (!selectedMove) {
            // Try without check/checkmate symbols
            const cleanMove = moveText.replace(/[+#]/g, '');
            selectedMove = legalMoves.find(m => m.san.replace(/[+#]/g, '') === cleanMove);
        }

        if (!selectedMove) {
            // Try LAN format (e2e4)
            selectedMove = legalMoves.find(m => m.lan === moveText.toLowerCase());
        }

        if (!selectedMove) {
            // Try from+to format
            selectedMove = legalMoves.find(m => (m.from + m.to) === moveText.toLowerCase().replace(/[^a-h1-8]/g, ''));
        }

        if (!selectedMove) {
            // Try extracting just the move from a longer response
            const moveMatch = moveText.match(/([KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?|O-O-O|O-O)/i);
            if (moveMatch) {
                const extractedMove = moveMatch[1];
                selectedMove = legalMoves.find(m => m.san === extractedMove || m.san.replace(/[+#]/g, '') === extractedMove);
                console.log(`[Groq ${currentTurn}] Extracted move from response: "${extractedMove}"`);
            }
        }

        if (!selectedMove) {
            console.warn(`[Groq ${currentTurn}] Could not parse "${moveText}", falling back to random move`);
            const randomMove = this.getRandomMove();
            console.log(`[Groq ${currentTurn}] Playing random move: ${randomMove.san}`);
            randomMove.commentary = '';
            return randomMove;
        }

        console.log(`[Groq ${currentTurn}] Playing: ${selectedMove.san} (${selectedMove.from}->${selectedMove.to})`);

        // Attach commentary to the move object
        selectedMove.commentary = commentary;
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
        if (depth === 0 || this.game.game_over()) {
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
        const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

        // Piece-square tables for positional bonuses (simplified)
        const pawnTable = [
            [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
            [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
            [0.1, 0.1, 0.2, 0.3, 0.3, 0.2, 0.1, 0.1],
            [0.05, 0.05, 0.1, 0.25, 0.25, 0.1, 0.05, 0.05],
            [0.0, 0.0, 0.0, 0.2, 0.2, 0.0, 0.0, 0.0],
            [0.05, -0.05, -0.1, 0.0, 0.0, -0.1, -0.05, 0.05],
            [0.05, 0.1, 0.1, -0.2, -0.2, 0.1, 0.1, 0.05],
            [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
        ];

        const knightTable = [
            [-0.5, -0.4, -0.3, -0.3, -0.3, -0.3, -0.4, -0.5],
            [-0.4, -0.2, 0.0, 0.0, 0.0, 0.0, -0.2, -0.4],
            [-0.3, 0.0, 0.1, 0.15, 0.15, 0.1, 0.0, -0.3],
            [-0.3, 0.05, 0.15, 0.2, 0.2, 0.15, 0.05, -0.3],
            [-0.3, 0.0, 0.15, 0.2, 0.2, 0.15, 0.0, -0.3],
            [-0.3, 0.05, 0.1, 0.15, 0.15, 0.1, 0.05, -0.3],
            [-0.4, -0.2, 0.0, 0.05, 0.05, 0.0, -0.2, -0.4],
            [-0.5, -0.4, -0.3, -0.3, -0.3, -0.3, -0.4, -0.5]
        ];

        const centerSquares = ['d4', 'd5', 'e4', 'e5'];

        let score = 0;
        let whiteMobility = 0;
        let blackMobility = 0;
        let whiteDevelopment = 0;
        let blackDevelopment = 0;

        const board = this.game.board();

        // Material and positional evaluation
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = board[row][col];
                if (square) {
                    const value = pieceValues[square.type];
                    const isWhite = square.color === 'w';
                    const r = isWhite ? row : 7 - row;

                    // Base material
                    score += isWhite ? value : -value;

                    // Positional bonuses
                    let posBonus = 0;
                    if (square.type === 'p') {
                        posBonus = pawnTable[r][col];
                    } else if (square.type === 'n') {
                        posBonus = knightTable[r][col];
                    } else if (square.type === 'b') {
                        // Bishops like long diagonals
                        posBonus = (row + col) % 2 === 0 ? 0.1 : 0.1;
                        if (row !== 0 && row !== 7) posBonus += 0.1; // Not on back rank
                    } else if (square.type === 'r') {
                        // Rooks like open files and 7th rank
                        if (r === 1) posBonus += 0.2; // 7th rank
                    } else if (square.type === 'q') {
                        // Queen shouldn't develop too early
                        if (this.moveCount < 10 && r < 6) posBonus -= 0.1;
                    }

                    score += isWhite ? posBonus : -posBonus;

                    // Development bonus (pieces moved from starting squares)
                    if (square.type === 'n' || square.type === 'b') {
                        const startRow = isWhite ? 7 : 0;
                        if (row !== startRow) {
                            if (isWhite) whiteDevelopment += 0.15;
                            else blackDevelopment += 0.15;
                        }
                    }
                }
            }
        }

        // Center control bonus
        for (const sq of centerSquares) {
            const file = sq.charCodeAt(0) - 'a'.charCodeAt(0);
            const rank = 8 - parseInt(sq[1]);
            const piece = board[rank][file];
            if (piece) {
                score += piece.color === 'w' ? 0.3 : -0.3;
            }
        }

        // Add development scores
        score += whiteDevelopment - blackDevelopment;

        // King safety (simplified - penalize exposed king)
        const whiteKingPos = this.findKing('w', board);
        const blackKingPos = this.findKing('b', board);

        if (whiteKingPos && this.moveCount > 10) {
            // Penalize king in center during middlegame
            if (whiteKingPos.col >= 2 && whiteKingPos.col <= 5) {
                score -= 0.3;
            }
        }
        if (blackKingPos && this.moveCount > 10) {
            if (blackKingPos.col >= 2 && blackKingPos.col <= 5) {
                score += 0.3;
            }
        }

        // Mobility (number of legal moves as a rough proxy)
        const currentTurn = this.game.turn();
        const moves = this.game.moves().length;
        if (currentTurn === 'w') {
            whiteMobility = moves * 0.02;
        } else {
            blackMobility = moves * 0.02;
        }
        score += whiteMobility - blackMobility;

        return score;
    }

    findKing(color, board) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.type === 'k' && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    updateEvalBar() {
        const score = this.evaluateBoard();
        const evalBlack = document.getElementById('eval-black');
        const evalScore = document.getElementById('eval-score');

        if (!evalBlack || !evalScore) return;

        // Convert score to percentage (sigmoid-like mapping)
        // Score of +5 = ~90% white, -5 = ~10% white
        const maxScore = 10;
        const clampedScore = Math.max(-maxScore, Math.min(maxScore, score));
        const whitePercent = 50 + (clampedScore / maxScore) * 45;
        const blackPercent = 100 - whitePercent;

        evalBlack.style.height = `${blackPercent}%`;

        // Format score display
        const displayScore = score >= 0 ? `+${score.toFixed(1)}` : score.toFixed(1);
        evalScore.textContent = displayScore;

        // Color the score based on who's winning
        if (score > 0.5) {
            evalScore.style.color = '#ffffff';
            evalScore.style.textShadow = '0 0 5px rgba(255, 255, 255, 0.5)';
        } else if (score < -0.5) {
            evalScore.style.color = '#333';
            evalScore.style.textShadow = '0 0 5px rgba(0, 0, 0, 0.5)';
        } else {
            evalScore.style.color = '#ffd966';
            evalScore.style.textShadow = '0 0 5px rgba(255, 217, 102, 0.5)';
        }
    }

    updateCommentary(move, player, commentary) {
        const moveEl = document.getElementById('commentary-move');
        const textEl = document.getElementById('commentary-text');

        if (!moveEl || !textEl) return;

        const badgeClass = player === 'White' ? 'white' : 'black';
        moveEl.innerHTML = `<span class="player-badge ${badgeClass}">${player}</span> plays <strong>${move}</strong>`;

        if (commentary) {
            textEl.textContent = commentary;
        } else {
            textEl.textContent = '';
        }
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
                      strategy === 'deepseek' ? '🧠 DeepSeek' :
                      strategy === 'groq' ? '⚡ Groq' :
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

        if (this.game.in_check()) {
            document.getElementById('status-text').textContent = 'CHECK!';
        }
    }

    updateMatchupDisplay() {
        const whiteStrategy = document.getElementById('white-player').value;
        const blackStrategy = document.getElementById('black-player').value;

        const getAIName = (strategy) => {
            switch(strategy) {
                case 'claude': return '🤖 Claude AI';
                case 'deepseek': return '🧠 DeepSeek AI';
                case 'groq': return '⚡ Groq AI';
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

        if (this.game.in_checkmate()) {
            winner = this.game.turn() === 'w' ? 'Black' : 'White';
            result = `Checkmate! ${winner} Wins!`;
            if (winner === 'White') {
                this.whiteWins++;
            } else {
                this.blackWins++;
            }
        } else if (this.game.in_draw()) {
            result = 'Game Draw!';
            this.draws++;
        } else if (this.game.in_stalemate()) {
            result = 'Stalemate!';
            this.draws++;
        } else if (this.game.in_threefold_repetition()) {
            result = 'Draw by Repetition!';
            this.draws++;
        } else if (this.game.insufficient_material()) {
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
        this.updateEvalBar();

        // Clear commentary
        const commentaryMove = document.getElementById('commentary-move');
        const commentaryText = document.getElementById('commentary-text');
        if (commentaryMove) commentaryMove.innerHTML = '';
        if (commentaryText) commentaryText.textContent = '';
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
