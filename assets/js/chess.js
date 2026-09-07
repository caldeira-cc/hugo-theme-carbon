/**
 * Stockfish UCI Chess Arena Frontend Controller (IBM Carbon Standards Compliant)
 * - Rigid, mathematically exact square board (aspect-ratio 1:1)
 * - Valid move & capture target highlighting
 * - Dynamic IBM Carbon theme token colors
 * - PGN game ingestion & move sequence replay
 * - Configurable depth & visual analysis toggle
 */

const PIECE_SYMBOLS = {
  1: '♙', 2: '♘', 3: '♗', 4: '♖', 5: '♕', 6: '♔',
  7: '♟', 8: '♞', 9: '♝', 10: '♜', 11: '♛', 12: '♚'
};

function squareIndex(row, col) {
  return row * 8 + col;
}

function toSquareNotation(idx) {
  const col = String.fromCharCode(97 + (idx % 8));
  const row = 8 - Math.floor(idx / 8);
  return `${col}${row}`;
}

function squareToCoords(sq) {
  if (!sq || sq.length < 2) return -1;
  const col = sq.charCodeAt(0) - 97;
  const row = 8 - parseInt(sq[1], 10);
  if (col < 0 || col > 7 || row < 0 || row > 7) return -1;
  return row * 8 + col;
}

function computeValidMoves(board, fromIdx) {
  const p = board[fromIdx];
  if (p === 0) return [];

  const isWhite = p <= 6;
  const row = Math.floor(fromIdx / 8);
  const col = fromIdx % 8;
  const moves = [];

  const addMove = (targetIdx) => {
    if (targetIdx < 0 || targetIdx >= 64) return false;
    const targetPiece = board[targetIdx];
    if (targetPiece === 0) {
      moves.push({ from: fromIdx, to: targetIdx, isCapture: false });
      return true; // continue sliding
    } else {
      const targetIsWhite = targetPiece <= 6;
      if (targetIsWhite !== isWhite) {
        moves.push({ from: fromIdx, to: targetIdx, isCapture: true });
      }
      return false; // ray blocked
    }
  };

  if (p === 1) { // White Pawn
    const forward1 = fromIdx - 8;
    if (forward1 >= 0 && board[forward1] === 0) {
      moves.push({ from: fromIdx, to: forward1, isCapture: false });
      const forward2 = fromIdx - 16;
      if (row === 6 && board[forward2] === 0) {
        moves.push({ from: fromIdx, to: forward2, isCapture: false });
      }
    }
    // Captures
    if (col > 0 && fromIdx - 9 >= 0 && board[fromIdx - 9] > 6) {
      moves.push({ from: fromIdx, to: fromIdx - 9, isCapture: true });
    }
    if (col < 7 && fromIdx - 7 >= 0 && board[fromIdx - 7] > 6) {
      moves.push({ from: fromIdx, to: fromIdx - 7, isCapture: true });
    }
  } else if (p === 7) { // Black Pawn
    const forward1 = fromIdx + 8;
    if (forward1 < 64 && board[forward1] === 0) {
      moves.push({ from: fromIdx, to: forward1, isCapture: false });
      const forward2 = fromIdx + 16;
      if (row === 1 && board[forward2] === 0) {
        moves.push({ from: fromIdx, to: forward2, isCapture: false });
      }
    }
    // Captures
    if (col > 0 && fromIdx + 7 < 64 && board[fromIdx + 7] >= 1 && board[fromIdx + 7] <= 6) {
      moves.push({ from: fromIdx, to: fromIdx + 7, isCapture: true });
    }
    if (col < 7 && fromIdx + 9 < 64 && board[fromIdx + 9] >= 1 && board[fromIdx + 9] <= 6) {
      moves.push({ from: fromIdx, to: fromIdx + 9, isCapture: true });
    }
  } else if (p === 2 || p === 8) { // Knights
    const offsets = [-17, -15, -10, -6, 6, 10, 15, 17];
    offsets.forEach(off => {
      const target = fromIdx + off;
      if (target >= 0 && target < 64) {
        const tRow = Math.floor(target / 8);
        const tCol = target % 8;
        if (Math.abs(tRow - row) + Math.abs(tCol - col) === 3) {
          addMove(target);
        }
      }
    });
  } else {
    // Sliding: Bishops, Rooks, Queens, Kings
    const isBishop = (p === 3 || p === 9);
    const isRook = (p === 4 || p === 10);
    const isQueen = (p === 5 || p === 11);
    const isKing = (p === 6 || p === 12);

    const dirs = [];
    if (isBishop || isQueen || isKing) dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    if (isRook || isQueen || isKing) dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);

    const maxSteps = isKing ? 1 : 7;

    dirs.forEach(([dRow, dCol]) => {
      for (let s = 1; s <= maxSteps; s++) {
        const tRow = row + dRow * s;
        const tCol = col + dCol * s;
        if (tRow < 0 || tRow > 7 || tCol < 0 || tCol > 7) break;
        const tIdx = tRow * 8 + tCol;
        const canContinue = addMove(tIdx);
        if (!canContinue) break;
      }
    });
  }

  return moves;
}

export function initChessArena() {
  document.querySelectorAll('.carbon-chess-container').forEach(container => {
    const boardEl = container.querySelector('.carbon-chess-container__board');
    const terminalEl = container.querySelector('.carbon-chess-container__terminal');
    const evalFill = container.querySelector('.carbon-chess-container__eval-fill');
    const newGameBtn = container.querySelector('.carbon-chess-new-game-btn');
    const depthSelect = container.querySelector('.carbon-chess-depth-select');
    const statusText = container.querySelector('.carbon-chess-status');
    const pgnCard = container.querySelector('.carbon-chess-container__pgn-card');

    if (!boardEl) return;

    let worker = null;
    let selectedSquare = null;
    let validMoves = [];
    let lastFrom = null;
    let lastTo = null;

    let boardState = [
      10, 8, 9, 11, 12, 9, 8, 10,
      7, 7, 7, 7, 7, 7, 7, 7,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      1, 1, 1, 1, 1, 1, 1, 1,
      4, 2, 3, 5, 6, 3, 2, 4
    ];
    let turn = 'w';
    let moveHistory = [];

    const defaultDepth = container.getAttribute('data-depth') || '4';
    if (depthSelect) depthSelect.value = defaultDepth;

    function appendTerminal(line) {
      if (!terminalEl) return;
      const p = document.createElement('div');
      p.textContent = line;
      terminalEl.appendChild(p);
      terminalEl.scrollTop = terminalEl.scrollHeight;
    }

    function renderBoard() {
      boardEl.innerHTML = '';
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const idx = squareIndex(r, c);
          const piece = boardState[idx];
          const isDark = (r + c) % 2 === 1;

          const sq = document.createElement('div');
          sq.className = `carbon-chess-container__square ${isDark ? 'carbon-chess-container__square--dark' : 'carbon-chess-container__square--light'}`;
          sq.dataset.index = idx;

          // Selection highlight
          if (selectedSquare === idx) {
            sq.classList.add('carbon-chess-container__square--selected');
          }

          // Last move highlight
          if (idx === lastFrom || idx === lastTo) {
            sq.classList.add('carbon-chess-container__square--last-move');
          }

          // Valid move & capture target highlights
          const matchingMove = validMoves.find(m => m.to === idx);
          if (matchingMove) {
            if (matchingMove.isCapture) {
              sq.classList.add('carbon-chess-container__square--valid-capture');
            } else {
              sq.classList.add('carbon-chess-container__square--valid-move');
            }
          }

          if (piece !== 0) {
            const isWhite = piece <= 6;
            const pieceSpan = document.createElement('span');
            pieceSpan.className = `carbon-chess-container__piece ${isWhite ? 'carbon-chess-container__piece--white' : 'carbon-chess-container__piece--black'}`;
            pieceSpan.textContent = PIECE_SYMBOLS[piece] || '';
            sq.appendChild(pieceSpan);
          }

          sq.addEventListener('click', () => handleSquareClick(idx));
          boardEl.appendChild(sq);
        }
      }
    }

    function handleSquareClick(idx) {
      if (turn !== 'w') return;

      const piece = boardState[idx];
      const isWhitePiece = piece >= 1 && piece <= 6;

      // Check if clicking on a highlighted valid move
      const targetMove = validMoves.find(m => m.to === idx);

      if (targetMove && selectedSquare !== null) {
        // Execute Move
        executeMove(selectedSquare, idx, 'w');
        selectedSquare = null;
        validMoves = [];
        renderBoard();

        // Trigger Engine
        turn = 'b';
        if (statusText) statusText.textContent = 'Stockfish computing...';
        const depth = depthSelect ? parseInt(depthSelect.value, 10) : parseInt(defaultDepth, 10);
        if (worker) {
          worker.postMessage({ type: 'CMD', cmd: `position startpos moves ${moveHistory.join(' ')}` });
          worker.postMessage({ type: 'CMD', cmd: `go depth ${depth}` });
        }
        return;
      }

      if (isWhitePiece) {
        if (selectedSquare === idx) {
          selectedSquare = null;
          validMoves = [];
        } else {
          selectedSquare = idx;
          validMoves = computeValidMoves(boardState, idx);
        }
        renderBoard();
      } else {
        selectedSquare = null;
        validMoves = [];
        renderBoard();
      }
    }

    function executeMove(from, to, side) {
      const moveStr = `${toSquareNotation(from)}${toSquareNotation(to)}`;
      moveHistory.push(moveStr);
      lastFrom = from;
      lastTo = to;
      boardState[to] = boardState[from];
      boardState[from] = 0;
    }

    function resetGame() {
      boardState = [
        10, 8, 9, 11, 12, 9, 8, 10,
        7, 7, 7, 7, 7, 7, 7, 7,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        1, 1, 1, 1, 1, 1, 1, 1,
        4, 2, 3, 5, 6, 3, 2, 4
      ];
      moveHistory = [];
      turn = 'w';
      selectedSquare = null;
      validMoves = [];
      lastFrom = null;
      lastTo = null;
      if (evalFill) evalFill.style.width = '50%';
      if (statusText) statusText.textContent = 'Your turn (White)';
      if (worker) worker.postMessage({ type: 'CMD', cmd: 'ucinewgame' });
      renderBoard();
    }

    async function loadPGN() {
      const pgnUrl = container.getAttribute('data-pgn-url');
      const inlinePgn = container.getAttribute('data-pgn');

      let rawPgn = inlinePgn || '';
      if (pgnUrl) {
        try {
          const res = await fetch(pgnUrl);
          if (res.ok) rawPgn = await res.text();
        } catch (e) {
          console.warn('Could not load PGN URL:', e);
        }
      }

      if (!rawPgn) return;

      // Parse headers
      const whiteMatch = rawPgn.match(/\[White\s+"([^"]+)"\]/);
      const blackMatch = rawPgn.match(/\[Black\s+"([^"]+)"\]/);
      const eventMatch = rawPgn.match(/\[Event\s+"([^"]+)"\]/);
      const resultMatch = rawPgn.match(/\[Result\s+"([^"]+)"\]/);

      if (pgnCard) {
        pgnCard.innerHTML = `
          <div><strong>Event:</strong> ${eventMatch ? eventMatch[1] : 'Game'}</div>
          <div><strong>White:</strong> ${whiteMatch ? whiteMatch[1] : 'Unknown'} vs <strong>Black:</strong> ${blackMatch ? blackMatch[1] : 'Unknown'}</div>
          <div><strong>Result:</strong> ${resultMatch ? resultMatch[1] : '*'}</div>
        `;
        pgnCard.style.display = 'flex';
      }
    }

    try {
      const workerUrl = container.getAttribute('data-worker-url') || '/js/workers/stockfish-worker.js';
      worker = new Worker(workerUrl);

      worker.onmessage = function(e) {
        const msg = e.data;
        if (!msg) return;

        if (msg.type === 'UCI_OUT' || msg.type === 'UCI_LOG') {
          appendTerminal(msg.line);

          // Update Eval Bar
          if (msg.line && msg.line.includes('score cp')) {
            const match = msg.line.match(/score cp (-?\d+)/);
            if (match && evalFill) {
              const cp = parseInt(match[1], 10);
              const percentage = Math.max(5, Math.min(95, 50 + (cp / 10)));
              evalFill.style.width = `${percentage}%`;
            }
          }
        } else if (msg.type === 'BEST_MOVE') {
          executeMove(msg.from, msg.to, 'b');
          turn = 'w';
          if (statusText) statusText.textContent = 'Your turn (White)';
          renderBoard();
        }
      };

      worker.postMessage({ type: 'CMD', cmd: 'uci' });
      worker.postMessage({ type: 'CMD', cmd: 'isready' });
      worker.postMessage({ type: 'CMD', cmd: 'ucinewgame' });

      if (newGameBtn) newGameBtn.addEventListener('click', resetGame);

      loadPGN();
      renderBoard();
    } catch (err) {
      console.warn('Stockfish Web Worker initialization failed:', err);
    }
  });
}
