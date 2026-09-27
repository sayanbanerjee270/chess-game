/* =========================================================
   GRANDMASTER CHESS
   Pure JavaScript Chess Engine
========================================================= */


/* =========================================================
   CONSTANTS
========================================================= */

const PIECES = {

    wK: "♔",
    wQ: "♕",
    wR: "♖",
    wB: "♗",
    wN: "♘",
    wP: "♙",

    bK: "♚",
    bQ: "♛",
    bR: "♜",
    bB: "♝",
    bN: "♞",
    bP: "♟"

};


const PIECE_VALUES = {

    P: 100,
    N: 320,
    B: 330,
    R: 500,
    Q: 900,
    K: 20000

};


const TIPS = [

    "Control the center early and develop your pieces.",

    "Try to castle early to keep your king safe.",

    "Avoid moving the same piece repeatedly during the opening.",

    "Look for checks, captures and threats before every move.",

    "Connect your rooks by developing your queen and bishops.",

    "Don't bring your queen out too early.",

    "A strong pawn structure can be more valuable than a single pawn."

];


/* =========================================================
   DOM
========================================================= */

const boardElement =
    document.getElementById("chessBoard");

const rankLabels =
    document.getElementById("rankLabels");

const fileLabels =
    document.getElementById("fileLabels");

const statusText =
    document.getElementById("statusText");

const turnInfo =
    document.getElementById("turnInfo");

const moveNumberElement =
    document.getElementById("moveNumber");

const moveListElement =
    document.getElementById("movesList");

const moveCountElement =
    document.getElementById("moveCount");

const capturedWhiteElement =
    document.getElementById("capturedWhite");

const capturedBlackElement =
    document.getElementById("capturedBlack");

const whiteClock =
    document.getElementById("whiteClock");

const blackClock =
    document.getElementById("blackClock");

const whiteName =
    document.getElementById("whiteName");

const blackName =
    document.getElementById("blackName");

const gameOverModal =
    document.getElementById("gameOverModal");

const gameOverTitle =
    document.getElementById("gameOverTitle");

const gameOverText =
    document.getElementById("gameOverText");

const gameOverIcon =
    document.getElementById("gameOverIcon");

const promotionModal =
    document.getElementById("promotionModal");

const chessTip =
    document.getElementById("chessTip");


/* =========================================================
   GAME STATE
========================================================= */

let board = [];

let currentTurn = "w";

let selectedSquare = null;

let legalMoves = [];

let moveHistory = [];

let capturedPieces = {
    w: [],
    b: []
};

let lastMove = null;

let gameOver = false;

let gameMode = "human";

let boardFlipped = false;

let boardTheme = 0;

let pendingPromotion = null;


/*
   Castling rights

   K = white king side
   Q = white queen side
   k = black king side
   q = black queen side
*/

let castlingRights = {

    K: true,
    Q: true,
    k: true,
    q: true

};


/*
   En passant target square.

   Example:
   { row: 2, col: 4 }

*/

let enPassantTarget = null;


/*
   Clocks
*/

let whiteTime = 600;

let blackTime = 600;

let clockInterval = null;


/*
   Game number
*/

let gameNumber = 1;


/* =========================================================
   INITIAL POSITION
========================================================= */

function createInitialBoard() {

    return [

        [
            "bR",
            "bN",
            "bB",
            "bQ",
            "bK",
            "bB",
            "bN",
            "bR"
        ],

        [
            "bP",
            "bP",
            "bP",
            "bP",
            "bP",
            "bP",
            "bP",
            "bP"
        ],

        [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        ],

        [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        ],

        [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        ],

        [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        ],

        [
            "wP",
            "wP",
            "wP",
            "wP",
            "wP",
            "wP",
            "wP",
            "wP"
        ],

        [
            "wR",
            "wN",
            "wB",
            "wQ",
            "wK",
            "wB",
            "wN",
            "wR"
        ]

    ];

}


/* =========================================================
   START GAME
========================================================= */

function initializeGame() {

    board =
        createInitialBoard();

    currentTurn = "w";

    selectedSquare = null;

    legalMoves = [];

    moveHistory = [];

    capturedPieces = {
        w: [],
        b: []
    };

    lastMove = null;

    gameOver = false;

    pendingPromotion = null;

    castlingRights = {

        K: true,
        Q: true,
        k: true,
        q: true

    };

    enPassantTarget = null;

    whiteTime = 600;

    blackTime = 600;

    clearInterval(clockInterval);

    clockInterval =
        setInterval(updateClock, 1000);

    renderBoard();

    renderMoveHistory();

    renderCaptured();

    updateGameInfo();

    updateStatus();

    updateClocks();

    chessTip.textContent =
        TIPS[
            Math.floor(
                Math.random() *
                TIPS.length
            )
        ];

    closeGameOver();

}


/* =========================================================
   RENDER BOARD
========================================================= */

function renderBoard() {

    boardElement.innerHTML = "";

    rankLabels.innerHTML = "";

    fileLabels.innerHTML = "";


    /*
       Coordinates
    */

    const ranks =
        boardFlipped
            ? [1, 2, 3, 4, 5, 6, 7, 8]
            : [8, 7, 6, 5, 4, 3, 2, 1];

    const files =
        boardFlipped
            ? [7, 6, 5, 4, 3, 2, 1, 0]
            : [0, 1, 2, 3, 4, 5, 6, 7];


    /*
       Rank labels
    */

    ranks.forEach(rank => {

        const div =
            document.createElement("div");

        div.textContent = rank;

        rankLabels.appendChild(div);

    });


    /*
       File labels
    */

    files.forEach(file => {

        const div =
            document.createElement("div");

        div.textContent =
            String.fromCharCode(
                97 + file
            );

        fileLabels.appendChild(div);

    });


    /*
       Squares
    */

    for (let displayRow = 0;
        displayRow < 8;
        displayRow++) {

        for (let displayCol = 0;
            displayCol < 8;
            displayCol++) {

            const row =
                boardFlipped
                    ? displayRow
                    : displayRow;

            const col =
                files[displayCol];

            const actualRow =
                boardFlipped
                    ? 7 - displayRow
                    : displayRow;


            createSquare(
                actualRow,
                col,
                displayRow,
                displayCol
            );

        }

    }

}


/* =========================================================
   CREATE SQUARE
========================================================= */

function createSquare(
    row,
    col,
    displayRow,
    displayCol
) {

    const square =
        document.createElement("div");

    square.classList.add("square");


    /*
       Square color
    */

    if ((row + col) % 2 === 0) {

        square.classList.add("light");

    } else {

        square.classList.add("dark");

    }


    /*
       Selection
    */

    if (
        selectedSquare &&
        selectedSquare.row === row &&
        selectedSquare.col === col
    ) {

        square.classList.add("selected");

    }


    /*
       Legal move
    */

    const isLegal =
        legalMoves.some(
            move =>
                move.row === row &&
                move.col === col
        );

    if (isLegal) {

        square.classList.add("legal");

        if (board[row][col]) {

            square.classList.add("capture");

        }

    }


    /*
       Last move
    */

    if (
        lastMove &&
        (
            (
                lastMove.from.row === row &&
                lastMove.from.col === col
            )
            ||
            (
                lastMove.to.row === row &&
                lastMove.to.col === col
            )
        )
    ) {

        square.classList.add("last-move");

    }


    /*
       Check
    */

    const piece =
        board[row][col];

    if (
        piece &&
        piece[1] === "K" &&
        isKingInCheck(
            board,
            piece[0]
        )
    ) {

        square.classList.add(
            "in-check"
        );

    }


    /*
       Piece
    */

    if (piece) {

        const pieceElement =
            document.createElement("div");

        pieceElement.classList.add(
            "piece"
        );

        pieceElement.classList.add(
            piece[0] === "w"
                ? "white"
                : "black"
        );

        pieceElement.textContent =
            PIECES[piece];

        square.appendChild(
            pieceElement
        );

    }


    square.addEventListener(
        "click",
        () => handleSquareClick(row, col)
    );


    boardElement.appendChild(square);

}


/* =========================================================
   HANDLE CLICK
========================================================= */

function handleSquareClick(row, col) {

    if (gameOver) {
        return;
    }


    /*
       Computer controls black
    */

    if (
        gameMode === "ai" &&
        currentTurn === "b"
    ) {

        return;

    }


    /*
       If promotion modal is open
    */

    if (pendingPromotion) {
        return;
    }


    const piece =
        board[row][col];


    /*
       Clicking a legal destination
    */

    const destination =
        legalMoves.find(
            move =>
                move.row === row &&
                move.col === col
        );

    if (selectedSquare && destination) {

        makeMove(
            selectedSquare,
            {
                row,
                col
            }
        );

        return;

    }


    /*
       Select own piece
    */

    if (
        piece &&
        piece[0] === currentTurn
    ) {

        selectedSquare = {
            row,
            col
        };

        legalMoves =
            getLegalMovesForPiece(
                row,
                col
            );

        renderBoard();

        return;
    }


    /*
       Clear selection
    */

    selectedSquare = null;

    legalMoves = [];

    renderBoard();

}


/* =========================================================
   GET LEGAL MOVES
========================================================= */

function getLegalMovesForPiece(row, col) {

    const piece =
        board[row][col];

    if (!piece) {
        return [];
    }


    const pseudoMoves =
        getPseudoMoves(
            board,
            row,
            col,
            true
        );


    return pseudoMoves.filter(
        move => {

            const testBoard =
                cloneBoard(board);

            applyMoveToBoard(
                testBoard,
                {
                    row,
                    col
                },
                move,
                true
            );

            return !isKingInCheck(
                testBoard,
                piece[0]
            );

        }
    );

}


/* =========================================================
   PSEUDO LEGAL MOVES
========================================================= */

function getPseudoMoves(
    position,
    row,
    col,
    includeSpecial = true
) {

    const piece =
        position[row][col];

    if (!piece) {
        return [];
    }


    const color =
        piece[0];

    const type =
        piece[1];

    const moves = [];


    /*
       PAWN
    */

    if (type === "P") {

        const direction =
            color === "w"
                ? -1
                : 1;

        const startRow =
            color === "w"
                ? 6
                : 1;

        const oneRow =
            row + direction;


        /*
           Forward
        */

        if (
            isInside(oneRow, col) &&
            !position[oneRow][col]
        ) {

            moves.push({
                row: oneRow,
                col: col
            });


            /*
               Two-square move
            */

            const twoRow =
                row +
                direction * 2;

            if (
                row === startRow &&
                !position[twoRow][col]
            ) {

                moves.push({
                    row: twoRow,
                    col: col,
                    doublePawn: true
                });

            }

        }


        /*
           Captures
        */

        for (
            const dc of [-1, 1]
        ) {

            const newCol =
                col + dc;

            if (
                !isInside(
                    oneRow,
                    newCol
                )
            ) {
                continue;
            }

            const target =
                position[oneRow][newCol];

            if (
                target &&
                target[0] !== color &&
                target[1] !== "K"
            ) {

                moves.push({
                    row: oneRow,
                    col: newCol
                });

            }


            /*
               En passant
            */

            if (
                includeSpecial &&
                enPassantTarget &&
                enPassantTarget.row === oneRow &&
                enPassantTarget.col === newCol
            ) {

                moves.push({
                    row: oneRow,
                    col: newCol,
                    enPassant: true
                });

            }

        }

    }


    /*
       KNIGHT
    */

    if (type === "N") {

        const jumps = [

            [-2, -1],
            [-2, 1],
            [-1, -2],
            [-1, 2],
            [1, -2],
            [1, 2],
            [2, -1],
            [2, 1]

        ];


        jumps.forEach(
            ([dr, dc]) => {

                addMoveIfValid(
                    moves,
                    position,
                    color,
                    row + dr,
                    col + dc
                );

            }
        );

    }


    /*
       BISHOP
    */

    if (type === "B") {

        addSlidingMoves(
            moves,
            position,
            color,
            row,
            col,
            [
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1]
            ]
        );

    }


    /*
       ROOK
    */

    if (type === "R") {

        addSlidingMoves(
            moves,
            position,
            color,
            row,
            col,
            [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1]
            ]
        );

    }


    /*
       QUEEN
    */

    if (type === "Q") {

        addSlidingMoves(
            moves,
            position,
            color,
            row,
            col,
            [

                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1],

                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1]

            ]
        );

    }


    /*
       KING
    */

    if (type === "K") {

        for (
            let dr = -1;
            dr <= 1;
            dr++
        ) {

            for (
                let dc = -1;
                dc <= 1;
                dc++
            ) {

                if (
                    dr === 0 &&
                    dc === 0
                ) {
                    continue;
                }

                addMoveIfValid(
                    moves,
                    position,
                    color,
                    row + dr,
                    col + dc
                );

            }

        }


        /*
           CASTLING
        */

        if (includeSpecial) {

            addCastlingMoves(
                moves,
                position,
                color,
                row,
                col
            );

        }

    }


    return moves;

}


/* =========================================================
   ADD NORMAL MOVE
========================================================= */

function addMoveIfValid(
    moves,
    position,
    color,
    row,
    col
) {

    if (
        !isInside(row, col)
    ) {
        return;
    }

    const target =
        position[row][col];

    if (!target) {

        moves.push({
            row,
            col
        });

        return;
    }


    if (
        target[0] !== color &&
        target[1] !== "K"
    ) {

        moves.push({
            row,
            col
        });

    }

}


/* =========================================================
   SLIDING PIECES
========================================================= */

function addSlidingMoves(
    moves,
    position,
    color,
    row,
    col,
    directions
) {

    directions.forEach(
        ([dr, dc]) => {

            let r = row + dr;

            let c = col + dc;

            while (
                isInside(r, c)
            ) {

                const target =
                    position[r][c];


                if (!target) {

                    moves.push({
                        row: r,
                        col: c
                    });

                } else {

                    if (
                        target[0] !== color &&
                        target[1] !== "K"
                    ) {

                        moves.push({
                            row: r,
                            col: c
                        });

                    }

                    break;

                }


                r += dr;

                c += dc;

            }

        }
    );

}


/* =========================================================
   CASTLING
========================================================= */

function addCastlingMoves(
    moves,
    position,
    color,
    row,
    col
) {

    /*
       King must not currently
       be in check.
    */

    if (
        isKingInCheck(
            position,
            color
        )
    ) {
        return;
    }


    if (color === "w") {

        /*
           Kingside
        */

        if (
            castlingRights.K &&
            position[7][5] === null &&
            position[7][6] === null &&
            position[7][7] === "wR" &&
            !isSquareAttacked(
                position,
                7,
                5,
                "b"
            ) &&
            !isSquareAttacked(
                position,
                7,
                6,
                "b"
            )
        ) {

            moves.push({
                row: 7,
                col: 6,
                castle: "K"
            });

        }


        /*
           Queenside
        */

        if (
            castlingRights.Q &&
            position[7][1] === null &&
            position[7][2] === null &&
            position[7][3] === null &&
            position[7][0] === "wR" &&
            !isSquareAttacked(
                position,
                7,
                3,
                "b"
            ) &&
            !isSquareAttacked(
                position,
                7,
                2,
                "b"
            )
        ) {

            moves.push({
                row: 7,
                col: 2,
                castle: "Q"
            });

        }

    }


    if (color === "b") {

        /*
           Kingside
        */

        if (
            castlingRights.k &&
            position[0][5] === null &&
            position[0][6] === null &&
            position[0][7] === "bR" &&
            !isSquareAttacked(
                position,
                0,
                5,
                "w"
            ) &&
            !isSquareAttacked(
                position,
                0,
                6,
                "w"
            )
        ) {

            moves.push({
                row: 0,
                col: 6,
                castle: "k"
            });

        }


        /*
           Queenside
        */

        if (
            castlingRights.q &&
            position[0][1] === null &&
            position[0][2] === null &&
            position[0][3] === null &&
            position[0][0] === "bR" &&
            !isSquareAttacked(
                position,
                0,
                3,
                "w"
            ) &&
            !isSquareAttacked(
                position,
                0,
                2,
                "w"
            )
        ) {

            moves.push({
                row: 0,
                col: 2,
                castle: "q"
            });

        }

    }

}


/* =========================================================
   MAKE MOVE
========================================================= */

function makeMove(
    from,
    to
) {

    const piece =
        board[from.row][from.col];

    const target =
        board[to.row][to.col];


    /*
       Save complete state
       for Undo.
    */

    const previousState =
        createState();


    /*
       Capture
    */

    let captured =
        target;


    /*
       En passant capture
    */

    if (
        piece[1] === "P" &&
        enPassantTarget &&
        to.row === enPassantTarget.row &&
        to.col === enPassantTarget.col &&
        !target
    ) {

        const capturedPawnRow =
            from.row;

        captured =
            board[
                capturedPawnRow
            ][
                to.col
            ];

    }


    /*
       Save captured piece
    */

    if (captured) {

        capturedPieces[
            captured[0]
        ].push(captured);

    }


    /*
       Move piece
    */

    board[to.row][to.col] =
        piece;

    board[from.row][from.col] =
        null;


    /*
       En passant remove pawn
    */

    if (
        piece[1] === "P" &&
        enPassantTarget &&
        to.row === enPassantTarget.row &&
        to.col === enPassantTarget.col &&
        !target
    ) {

        board[from.row][to.col] =
            null;

    }


    /*
       Castling
    */

    if (
        piece[1] === "K" &&
        Math.abs(
            to.col - from.col
        ) === 2
    ) {

        const rookFromCol =
            to.col === 6
                ? 7
                : 0;

        const rookToCol =
            to.col === 6
                ? 5
                : 3;

        board[from.row][rookToCol] =
            board[
                from.row
            ][rookFromCol];

        board[
            from.row
        ][rookFromCol] = null;

    }


    /*
       Update castling rights
    */

    updateCastlingRights(
        piece,
        from,
        to,
        target
    );


    /*
       Update en passant
    */

    enPassantTarget = null;

    if (
        piece[1] === "P" &&
        Math.abs(
            to.row - from.row
        ) === 2
    ) {

        enPassantTarget = {

            row:
                (
                    from.row +
                    to.row
                ) / 2,

            col:
                from.col

        };

    }


    /*
       Promotion
    */

    if (
        piece[1] === "P" &&
        (
            to.row === 0 ||
            to.row === 7
        )
    ) {

        pendingPromotion = {

            row: to.row,

            col: to.col,

            color: piece[0],

            previousState: previousState,

            from: from,

            to: to,

            captured: captured

        };


        renderBoard();

        promotionModal.classList.add(
            "show"
        );

        return;

    }


    /*
       Finish normal move
    */

    finishMove(
        previousState,
        from,
        to,
        captured
    );

}


/* =========================================================
   FINISH MOVE
========================================================= */

function finishMove(
    previousState,
    from,
    to,
    captured,
    promotionPiece = null
) {

    const piece =
        board[to.row][to.col];


    /*
       Move notation
    */

    const notation =
        createNotation(
            piece,
            from,
            to,
            captured,
            promotionPiece
        );


    /*
       Save history
    */

    moveHistory.push({

        previousState:

            previousState,

        from: {
            ...from
        },

        to: {
            ...to
        },

        piece: piece,

        captured: captured,

        notation: notation

    });


    /*
       Last move
    */

    lastMove = {

        from: {
            ...from
        },

        to: {
            ...to
        }

    };


    /*
       Switch turn
    */

    currentTurn =
        currentTurn === "w"
            ? "b"
            : "w";


    selectedSquare = null;

    legalMoves = [];


    /*
       Check game state
    */

    const result =
        evaluateGame();


    renderBoard();

    renderMoveHistory();

    renderCaptured();

    updateGameInfo();

    updateStatus();


    /*
       AI
    */

    if (
        !gameOver &&
        gameMode === "ai" &&
        currentTurn === "b"
    ) {

        setTimeout(
            computerMove,
            450
        );

    }

}


/* =========================================================
   PROMOTION
========================================================= */

document
    .querySelectorAll(
        ".promotion-options button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const choice =
                    button.dataset.piece;

                promotePawn(choice);

            }
        );

    });


function promotePawn(choice) {

    if (!pendingPromotion) {
        return;
    }


    const p =
        pendingPromotion;


    board[p.row][p.col] =
        p.color + choice;


    promotionModal.classList.remove(
        "show"
    );


    finishMove(
        p.previousState,
        p.from,
        p.to,
        p.captured,
        choice
    );


    pendingPromotion = null;

}


/* =========================================================
   UPDATE CASTLING RIGHTS
========================================================= */

function updateCastlingRights(
    piece,
    from,
    to,
    target
) {

    /*
       King moved
    */

    if (piece === "wK") {

        castlingRights.K = false;

        castlingRights.Q = false;

    }

    if (piece === "bK") {

        castlingRights.k = false;

        castlingRights.q = false;

    }


    /*
       Rook moved
    */

    if (piece === "wR") {

        if (from.row === 7 &&
            from.col === 0) {

            castlingRights.Q = false;

        }

        if (from.row === 7 &&
            from.col === 7) {

            castlingRights.K = false;

        }

    }

    if (piece === "bR") {

        if (from.row === 0 &&
            from.col === 0) {

            castlingRights.q = false;

        }

        if (from.row === 0 &&
            from.col === 7) {

            castlingRights.k = false;

        }

    }


    /*
       Captured rook
    */

    if (target === "wR") {

        if (to.row === 7 &&
            to.col === 0) {

            castlingRights.Q = false;

        }

        if (to.row === 7 &&
            to.col === 7) {

            castlingRights.K = false;

        }

    }

    if (target === "bR") {

        if (to.row === 0 &&
            to.col === 0) {

            castlingRights.q = false;

        }

        if (to.row === 0 &&
            to.col === 7) {

            castlingRights.k = false;

        }

    }

}


/* =========================================================
   CHECK DETECTION
========================================================= */

function isKingInCheck(
    position,
    color
) {

    let kingRow = -1;

    let kingCol = -1;


    /*
       Find king
    */

    for (
        let r = 0;
        r < 8;
        r++
    ) {

        for (
            let c = 0;
            c < 8;
            c++
        ) {

            if (
                position[r][c] ===
                color + "K"
            ) {

                kingRow = r;

                kingCol = c;

                break;

            }

        }

        if (kingRow !== -1) {
            break;
        }

    }


    if (kingRow === -1) {

        return true;

    }


    return isSquareAttacked(
        position,
        kingRow,
        kingCol,
        color === "w"
            ? "b"
            : "w"
    );

}


/* =========================================================
   ATTACK DETECTION
========================================================= */

function isSquareAttacked(
    position,
    row,
    col,
    byColor
) {

    /*
       Pawn attacks
    */

    const pawnRow =
        byColor === "w"
            ? row + 1
            : row - 1;

    for (
        const dc of [-1, 1]
    ) {

        const c = col + dc;

        if (
            isInside(
                pawnRow,
                c
            )
        ) {

            if (
                position[pawnRow][c] ===
                byColor + "P"
            ) {

                return true;

            }

        }

    }


    /*
       Knight attacks
    */

    const knightMoves = [

        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1]

    ];

    for (
        const [dr, dc]
        of knightMoves
    ) {

        const r = row + dr;

        const c = col + dc;

        if (
            isInside(r, c) &&
            position[r][c] ===
            byColor + "N"
        ) {

            return true;

        }

    }


    /*
       King attacks
    */

    for (
        let dr = -1;
        dr <= 1;
        dr++
    ) {

        for (
            let dc = -1;
            dc <= 1;
            dc++
        ) {

            if (
                dr === 0 &&
                dc === 0
            ) {
                continue;
            }

            const r = row + dr;

            const c = col + dc;

            if (
                isInside(r, c) &&
                position[r][c] ===
                byColor + "K"
            ) {

                return true;

            }

        }

    }


    /*
       Sliding attacks
    */

    const directions = [

        {
            pieces: ["R", "Q"],
            dirs: [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1]
            ]
        },

        {
            pieces: ["B", "Q"],
            dirs: [
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1]
            ]
        }

    ];


    for (
        const group of directions
    ) {

        for (
            const [dr, dc]
            of group.dirs
        ) {

            let r = row + dr;

            let c = col + dc;

            while (
                isInside(r, c)
            ) {

                const piece =
                    position[r][c];

                if (piece) {

                    if (
                        piece[0] === byColor &&
                        group.pieces.includes(
                            piece[1]
                        )
                    ) {

                        return true;

                    }

                    break;

                }

                r += dr;

                c += dc;

            }

        }

    }


    return false;

}


/* =========================================================
   EVALUATE GAME
========================================================= */

function evaluateGame() {

    const legalMoves =
        getAllLegalMoves(
            board,
            currentTurn
        );


    if (
        legalMoves.length === 0
    ) {

        gameOver = true;

        clearInterval(
            clockInterval
        );


        if (
            isKingInCheck(
                board,
                currentTurn
            )
        ) {

            const winner =
                currentTurn === "w"
                    ? "Black"
                    : "White";

            showGameOver(
                "♛",
                "Checkmate",
                `${winner} wins the game.`
            );

        } else {

            showGameOver(
                "½",
                "Stalemate",
                "The game ends in a draw."
            );

        }

        return true;

    }


    /*
       50-ish practical draw check

       This is a simplified
       material-only insufficient
       material detector.
    */

    if (
        isInsufficientMaterial()
    ) {

        gameOver = true;

        clearInterval(
            clockInterval
        );

        showGameOver(
            "½",
            "Draw",
            "Insufficient material."
        );

        return true;

    }


    return false;

}


/* =========================================================
   ALL LEGAL MOVES
========================================================= */

function getAllLegalMoves(
    position,
    color
) {

    const moves = [];


    for (
        let r = 0;
        r < 8;
        r++
    ) {

        for (
            let c = 0;
            c < 8;
            c++
        ) {

            const piece =
                position[r][c];

            if (
                !piece ||
                piece[0] !== color
            ) {

                continue;

            }


            const pseudo =
                getPseudoMoves(
                    position,
                    r,
                    c,
                    false
                );


            pseudo.forEach(
                move => {

                    const test =
                        cloneBoard(
                            position
                        );

                    applyMoveToBoard(
                        test,
                        {
                            row: r,
                            col: c
                        },
                        move,
                        true
                    );

                    if (
                        !isKingInCheck(
                            test,
                            color
                        )
                    ) {

                        moves.push({

                            from: {
                                row: r,
                                col: c
                            },

                            to: {
                                row: move.row,
                                col: move.col
                            },

                            ...move

                        });

                    }

                }
            );

        }

    }


    return moves;

}


/* =========================================================
   APPLY MOVE TO TEST BOARD
========================================================= */

function applyMoveToBoard(
    position,
    from,
    move,
    test
) {

    const piece =
        position[
            from.row
        ][
            from.col
        ];

    if (!piece) {
        return;
    }


    position[
        move.row
    ][
        move.col
    ] = piece;


    position[
        from.row
    ][
        from.col
    ] = null;


    /*
       En passant
    */

    if (
        move.enPassant &&
        piece[1] === "P"
    ) {

        position[
            from.row
        ][
            move.col
        ] = null;

    }


    /*
       Castling
    */

    if (
        move.castle &&
        piece[1] === "K"
    ) {

        const rookFrom =
            move.col === 6
                ? 7
                : 0;

        const rookTo =
            move.col === 6
                ? 5
                : 3;

        position[
            from.row
        ][
            rookTo
        ] =
            position[
                from.row
            ][
                rookFrom
            ];

        position[
            from.row
        ][
            rookFrom
        ] = null;

    }

}


/* =========================================================
   CLONE BOARD
========================================================= */

function cloneBoard(
    source
) {

    return source.map(
        row => [...row]
    );

}


/* =========================================================
   IS INSIDE BOARD
========================================================= */

function isInside(
    row,
    col
) {

    return (
        row >= 0 &&
        row < 8 &&
        col >= 0 &&
        col < 8
    );

}


/* =========================================================
   STATE SNAPSHOT
========================================================= */

function createState() {

    return {

        board:
            cloneBoard(board),

        currentTurn:
            currentTurn,

        castlingRights:
            {
                ...castlingRights
            },

        enPassantTarget:
            enPassantTarget
                ? {
                    ...enPassantTarget
                }
                : null,

        capturedPieces:
            {
                w: [
                    ...capturedPieces.w
                ],

                b: [
                    ...capturedPieces.b
                ]
            },

        lastMove:
            lastMove
                ? {
                    from: {
                        ...lastMove.from
                    },

                    to: {
                        ...lastMove.to
                    }
                }
                : null,

        whiteTime:
            whiteTime,

        blackTime:
            blackTime

    };

}


/* =========================================================
   RESTORE STATE
========================================================= */

function restoreState(
    state
) {

    board =
        cloneBoard(
            state.board
        );

    currentTurn =
        state.currentTurn;

    castlingRights =
        {
            ...state.castlingRights
        };

    enPassantTarget =
        state.enPassantTarget
            ? {
                ...state.enPassantTarget
            }
            : null;

    capturedPieces =
        {
            w: [
                ...state.capturedPieces.w
            ],

            b: [
                ...state.capturedPieces.b
            ]
        };

    lastMove =
        state.lastMove
            ? {
                from: {
                    ...state.lastMove.from
                },

                to: {
                    ...state.lastMove.to
                }
            }
            : null;

    whiteTime =
        state.whiteTime;

    blackTime =
        state.blackTime;

    selectedSquare = null;

    legalMoves = [];

}


/* =========================================================
   UNDO
========================================================= */

document
    .getElementById("undoBtn")
    .addEventListener(
        "click",
        undoMove
    );


function undoMove() {

    if (
        moveHistory.length === 0 ||
        pendingPromotion
    ) {

        return;

    }


    /*
       In AI mode undo two moves
       so user gets back to their turn.
    */

    let steps =
        gameMode === "ai"
            ? Math.min(
                2,
                moveHistory.length
            )
            : 1;


    while (steps > 0) {

        const last =
            moveHistory.pop();

        if (!last) {
            break;
        }

        restoreState(
            last.previousState
        );

        steps--;

    }


    gameOver = false;

    closeGameOver();

    renderBoard();

    renderMoveHistory();

    renderCaptured();

    updateGameInfo();

    updateStatus();

    updateClocks();

}


/* =========================================================
   MOVE NOTATION
========================================================= */

function createNotation(
    piece,
    from,
    to,
    captured,
    promotionPiece
) {

    const files =
        "abcdefgh";

    const fromSquare =
        files[from.col] +
        (8 - from.row);

    const toSquare =
        files[to.col] +
        (8 - to.row);


    if (
        piece[1] === "K" &&
        Math.abs(
            to.col - from.col
        ) === 2
    ) {

        return to.col === 6
            ? "O-O"
            : "O-O-O";

    }


    let notation = "";


    if (
        piece[1] !== "P"
    ) {

        notation += piece[1];

    }


    if (captured) {

        if (
            piece[1] === "P"
        ) {

            notation +=
                files[from.col];

        }

        notation += "x";

    }


    notation += toSquare;


    if (promotionPiece) {

        notation +=
            "=" +
            promotionPiece;

    }


    return notation;

}


/* =========================================================
   MOVE HISTORY UI
========================================================= */

function renderMoveHistory() {

    if (
        moveHistory.length === 0
    ) {

        moveListElement.innerHTML = `

            <div class="empty-moves">

                <span>♟</span>

                <p>
                    Make your first move
                </p>

                <small>
                    White to move
                </small>

            </div>

        `;

        moveCountElement.textContent =
            "0 moves";

        return;

    }


    moveListElement.innerHTML = "";


    for (
        let i = 0;
        i < moveHistory.length;
        i += 2
    ) {

        const row =
            document.createElement("div");

        row.className =
            "move-row";


        const number =
            document.createElement("span");

        number.className =
            "move-number-label";

        number.textContent =
            `${Math.floor(i / 2) + 1}.`;


        const white =
            document.createElement("span");

        white.className =
            "move";

        white.textContent =
            moveHistory[i]
                ?.notation || "";


        const black =
            document.createElement("span");

        black.className =
            "move";

        black.textContent =
            moveHistory[i + 1]
                ?.notation || "";


        if (
            i ===
            moveHistory.length - 1
        ) {

            white.classList.add(
                "current"
            );

        }

        if (
            i + 1 ===
            moveHistory.length - 1
        ) {

            black.classList.add(
                "current"
            );

        }


        row.appendChild(number);

        row.appendChild(white);

        row.appendChild(black);

        moveListElement.appendChild(row);

    }


    moveCountElement.textContent =
        `${moveHistory.length} ${
            moveHistory.length === 1
                ? "move"
                : "moves"
        }`;

}


/* =========================================================
   CAPTURED UI
========================================================= */

function renderCaptured() {

    capturedWhiteElement.innerHTML =
        capturedPieces.w
            .map(
                piece =>
                    PIECES[piece]
            )
            .join("");


    capturedBlackElement.innerHTML =
        capturedPieces.b
            .map(
                piece =>
                    PIECES[piece]
            )
            .join("");

}


/* =========================================================
   GAME INFO
========================================================= */

function updateGameInfo() {

    const move =
        Math.floor(
            moveHistory.length / 2
        ) + 1;

    moveNumberElement.textContent =
        move;

    turnInfo.textContent =
        currentTurn === "w"
            ? "White"
            : "Black";

}


/* =========================================================
   STATUS
========================================================= */

function updateStatus() {

    if (gameOver) {
        return;
    }


    const inCheck =
        isKingInCheck(
            board,
            currentTurn
        );


    if (inCheck) {

        statusText.textContent =
            currentTurn === "w"
                ? "White is in check"
                : "Black is in check";

    } else if (
        gameMode === "ai" &&
        currentTurn === "b"
    ) {

        statusText.textContent =
            "Computer is thinking...";

    } else {

        statusText.textContent =
            currentTurn === "w"
                ? "White to move"
                : "Black to move";

    }

}


/* =========================================================
   CLOCK
========================================================= */

function updateClock() {

    if (gameOver) {
        return;
    }


    if (currentTurn === "w") {

        whiteTime--;

        if (
            whiteTime <= 0
        ) {

            whiteTime = 0;

            gameOver = true;

            clearInterval(
                clockInterval
            );

            showGameOver(
                "♚",
                "Time",
                "Black wins on time."
            );

        }

    } else {

        blackTime--;

        if (
            blackTime <= 0
        ) {

            blackTime = 0;

            gameOver = true;

            clearInterval(
                clockInterval
            );

            showGameOver(
                "♔",
                "Time",
                "White wins on time."
            );

        }

    }


    updateClocks();

}


function updateClocks() {

    whiteClock.textContent =
        formatTime(
            whiteTime
        );

    blackClock.textContent =
        formatTime(
            blackTime
        );


    whiteClock.classList.toggle(
        "active-clock",
        currentTurn === "w" &&
        !gameOver
    );

    blackClock.classList.toggle(
        "active-clock",
        currentTurn === "b" &&
        !gameOver
    );

}


function formatTime(
    seconds
) {

    const minutes =
        Math.floor(
            seconds / 60
        );

    const secs =
        seconds % 60;

    return (
        String(minutes)
            .padStart(2, "0") +
        ":" +
        String(secs)
            .padStart(2, "0")
    );

}


/* =========================================================
   COMPUTER AI
========================================================= */

function computerMove() {

    if (
        gameOver ||
        currentTurn !== "b" ||
        gameMode !== "ai"
    ) {

        return;

    }


    statusText.textContent =
        "Computer is thinking...";


    setTimeout(() => {

        const moves =
            getAllLegalMoves(
                board,
                "b"
            );


        if (
            moves.length === 0
        ) {

            return;

        }


        /*
           Small minimax search.
           Depth 2 keeps the browser fast.
        */

        let bestScore =
            -Infinity;

        let bestMove =
            moves[0];


        for (
            const move of moves
        ) {

            const testBoard =
                cloneBoard(board);


            applyMoveToBoard(
                testBoard,
                move.from,
                move,
                true
            );


            const score =
                minimax(
                    testBoard,
                    2,
                    false
                );


            if (
                score > bestScore
            ) {

                bestScore = score;

                bestMove = move;

            }

        }


        /*
           Execute selected AI move
        */

        selectedSquare =
            bestMove.from;

        makeMove(
            bestMove.from,
            bestMove.to
        );

    }, 250);

}


/* =========================================================
   MINIMAX
========================================================= */

function minimax(
    position,
    depth,
    maximizing
) {

    if (depth === 0) {

        return evaluatePosition(
            position
        );

    }


    const color =
        maximizing
            ? "b"
            : "w";


    const moves =
        getAllLegalMoves(
            position,
            color
        );


    if (
        moves.length === 0
    ) {

        if (
            isKingInCheck(
                position,
                color
            )
        ) {

            return maximizing
                ? -999999
                : 999999;

        }

        return 0;

    }


    if (maximizing) {

        let best =
            -Infinity;


        for (
            const move of moves
        ) {

            const next =
                cloneBoard(
                    position
                );


            applyMoveToBoard(
                next,
                move.from,
                move,
                true
            );


            best =
                Math.max(
                    best,
                    minimax(
                        next,
                        depth - 1,
                        false
                    )
                );

        }


        return best;

    } else {

        let best =
            Infinity;


        for (
            const move of moves
        ) {

            const next =
                cloneBoard(
                    position
                );


            applyMoveToBoard(
                next,
                move.from,
                move,
                true
            );


            best =
                Math.min(
                    best,
                    minimax(
                        next,
                        depth - 1,
                        true
                    )
                );

        }


        return best;

    }

}


/* =========================================================
   POSITION EVALUATION
========================================================= */

function evaluatePosition(
    position
) {

    let score = 0;


    for (
        let r = 0;
        r < 8;
        r++
    ) {

        for (
            let c = 0;
            c < 8;
            c++
        ) {

            const piece =
                position[r][c];

            if (!piece) {
                continue;
            }


            const value =
                PIECE_VALUES[
                    piece[1]
                ];


            if (
                piece[0] === "b"
            ) {

                score += value;

            } else {

                score -= value;

            }

        }

    }


    return score;

}


/* =========================================================
   INSUFFICIENT MATERIAL
========================================================= */

function isInsufficientMaterial() {

    const pieces = [];


    for (
        let r = 0;
        r < 8;
        r++
    ) {

        for (
            let c = 0;
            c < 8;
            c++
        ) {

            const piece =
                board[r][c];

            if (
                piece &&
                piece[1] !== "K"
            ) {

                pieces.push(piece);

            }

        }

    }


    /*
       King vs King
    */

    if (
        pieces.length === 0
    ) {

        return true;

    }


    /*
       King + minor vs King
    */

    if (
        pieces.length === 1 &&
        (
            pieces[0][1] === "B" ||
            pieces[0][1] === "N"
        )
    ) {

        return true;

    }


    /*
       King + bishop vs King + bishop
       when bishops are on same color.
    */

    if (
        pieces.length === 2 &&
        pieces.every(
            piece =>
                piece[1] === "B"
        )
    ) {

        return true;

    }


    return false;

}


/* =========================================================
   GAME OVER
========================================================= */

function showGameOver(
    icon,
    title,
    message
) {

    gameOverIcon.textContent =
        icon;

    gameOverTitle.textContent =
        title;

    gameOverText.textContent =
        message;

    gameOverModal.classList.add(
        "show"
    );

}


function closeGameOver() {

    gameOverModal.classList.remove(
        "show"
    );

}


/* =========================================================
   NEW GAME
========================================================= */

function newGame() {

    gameNumber++;

    document.getElementById(
        "gameNumber"
    ).textContent =
        "#" +
        String(gameNumber)
            .padStart(3, "0");


    initializeGame();

}


/* =========================================================
   RESET
========================================================= */

document
    .getElementById("resetBtn")
    .addEventListener(
        "click",
        initializeGame
    );

document
    .getElementById("newGameBtn")
    .addEventListener(
        "click",
        newGame
    );

document
    .getElementById("modalNewGame")
    .addEventListener(
        "click",
        newGame
    );


/* =========================================================
   RESIGN
========================================================= */

document
    .getElementById("resignBtn")
    .addEventListener(
        "click",
        () => {

            if (gameOver) {
                return;
            }


            gameOver = true;

            clearInterval(
                clockInterval
            );


            const winner =
                currentTurn === "w"
                    ? "Black"
                    : "White";


            showGameOver(
                "⚑",
                "Resignation",
                `${winner} wins by resignation.`
            );

        }
    );


/* =========================================================
   DRAW
========================================================= */

document
    .getElementById("drawBtn")
    .addEventListener(
        "click",
        () => {

            if (gameOver) {
                return;
            }


            gameOver = true;

            clearInterval(
                clockInterval
            );


            showGameOver(
                "½",
                "Draw",
                "The players agreed to a draw."
            );

        }
    );


/* =========================================================
   FLIP BOARD
========================================================= */

document
    .getElementById("flipBtn")
    .addEventListener(
        "click",
        () => {

            boardFlipped =
                !boardFlipped;

            renderBoard();

        }
    );


/* =========================================================
   BOARD THEME
========================================================= */

document
    .getElementById("themeBtn")
    .addEventListener(
        "click",
        () => {

            boardTheme =
                (boardTheme + 1) % 3;


            if (
                boardTheme === 0
            ) {

                document.documentElement
                    .style
                    .setProperty(
                        "--light-square",
                        "#e8d8b8"
                    );

                document.documentElement
                    .style
                    .setProperty(
                        "--dark-square",
                        "#8a6f4d"
                    );

            }


            if (
                boardTheme === 1
            ) {

                document.documentElement
                    .style
                    .setProperty(
                        "--light-square",
                        "#d9d9d9"
                    );

                document.documentElement
                    .style
                    .setProperty(
                        "--dark-square",
                        "#6f7f89"
                    );

            }


            if (
                boardTheme === 2
            ) {

                document.documentElement
                    .style
                    .setProperty(
                        "--light-square",
                        "#d7d2c4"
                    );

                document.documentElement
                    .style
                    .setProperty(
                        "--dark-square",
                        "#665b50"
                    );

            }

        }
    );


/* =========================================================
   GAME MODE
========================================================= */

document
    .querySelectorAll(
        ".mode-button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                gameMode =
                    button.dataset.mode;


                document
                    .querySelectorAll(
                        ".mode-button"
                    )
                    .forEach(
                        b =>
                            b.classList
                                .remove(
                                    "active"
                                )
                    );


                button.classList.add(
                    "active"
                );


                if (
                    gameMode === "ai"
                ) {

                    whiteName.textContent =
                        "You";

                    blackName.textContent =
                        "Computer";

                } else {

                    whiteName.textContent =
                        "White";

                    blackName.textContent =
                        "Black";

                }


                initializeGame();

            }
        );

    });


/* =========================================================
   INITIALIZE
========================================================= */

initializeGame();