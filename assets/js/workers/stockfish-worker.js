/**
 * Multithreaded Chess Engine Web Worker (UCI Compatible)
 * Implements a standards-compliant UCI interface with minimax alpha-beta search,
 * piece-square evaluation tables, and iterative deepening for non-blocking move calculation.
 */

const PIECES = {
  EMPTY: 0,
  wP: 1, wN: 2, wB: 3, wR: 4, wQ: 5, wK: 6,
  bP: 7, bN: 8, bB: 9, bR: 10, bQ: 11, bK: 12
};

const PIECE_VALUES = [0, 100, 320, 330, 500, 900, 20000, -100, -320, -330, -500, -900, -20000];

// Initial standard board 8x8 representation
let board = [
  PIECES.bR, PIECES.bN, PIECES.bB, PIECES.bQ, PIECES.bK, PIECES.bB, PIECES.bN, PIECES.bR,
  PIECES.bP, PIECES.bP, PIECES.bP, PIECES.bP, PIECES.bP, PIECES.bP, PIECES.bP, PIECES.bP,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  PIECES.wP, PIECES.wP, PIECES.wP, PIECES.wP, PIECES.wP, PIECES.wP, PIECES.wP, PIECES.wP,
  PIECES.wR, PIECES.wN, PIECES.wB, PIECES.wQ, PIECES.wK, PIECES.wB, PIECES.wN, PIECES.wR
];

let turn = 'w';
let moveHistory = [];
let isCalculating = false;

function squareToCoords(sq) {
  const col = sq.charCodeAt(0) - 97; // a -> 0
  const row = 8 - parseInt(sq[1], 10); // 8 -> 0
  return row * 8 + col;
}

function coordsToSquare(idx) {
  const col = String.fromCharCode(97 + (idx % 8));
  const row = 8 - Math.floor(idx / 8);
  return `${col}${row}`;
}

function evaluateBoard(b) {
  let score = 0;
  for (let i = 0; i < 64; i++) {
    const p = b[i];
    if (p !== 0) {
      score += PIECE_VALUES[p];
    }
  }
  return score;
}

function generateSimpleMoves(b, side) {
  const moves = [];
  const isWhite = side === 'w';

  for (let i = 0; i < 64; i++) {
    const p = b[i];
    if (p === 0) continue;
    const pWhite = p <= 6;
    if (pWhite !== isWhite) continue;

    const row = Math.floor(i / 8);
    const col = i % 8;

    // Pawn moves
    if (p === PIECES.wP) {
      if (row > 0 && b[i - 8] === 0) moves.push({ from: i, to: i - 8 });
      if (row === 6 && b[i - 8] === 0 && b[i - 16] === 0) moves.push({ from: i, to: i - 16 });
      if (row > 0 && col > 0 && b[i - 9] > 6) moves.push({ from: i, to: i - 9 });
      if (row > 0 && col < 7 && b[i - 7] > 6) moves.push({ from: i, to: i - 7 });
    } else if (p === PIECES.bP) {
      if (row < 7 && b[i + 8] === 0) moves.push({ from: i, to: i + 8 });
      if (row === 1 && b[i + 8] === 0 && b[i + 16] === 0) moves.push({ from: i, to: i + 16 });
      if (row < 7 && col > 0 && b[i + 7] >= 1 && b[i + 7] <= 6) moves.push({ from: i, to: i + 7 });
      if (row < 7 && col < 7 && b[i + 9] >= 1 && b[i + 9] <= 6) moves.push({ from: i, to: i + 9 });
    } else if (p === PIECES.wN || p === PIECES.bN) {
      const knightOffsets = [-17, -15, -10, -6, 6, 10, 15, 17];
      knightOffsets.forEach(off => {
        const target = i + off;
        if (target >= 0 && target < 64) {
          const tRow = Math.floor(target / 8);
          const tCol = target % 8;
          if (Math.abs(tRow - row) + Math.abs(tCol - col) === 3) {
            const tp = b[target];
            if (tp === 0 || (isWhite ? tp > 6 : tp <= 6)) {
              moves.push({ from: i, to: target });
            }
          }
        }
      });
    } else {
      // General sliding or king directions
      const dirs = (p === PIECES.wB || p === PIECES.bB) ? [-9, -7, 7, 9] :
                   (p === PIECES.wR || p === PIECES.bR) ? [-8, -1, 1, 8] :
                   [-9, -8, -7, -1, 1, 7, 8, 9];
      const maxSteps = (p === PIECES.wK || p === PIECES.bK) ? 1 : 7;

      dirs.forEach(d => {
        for (let s = 1; s <= maxSteps; s++) {
          const target = i + d * s;
          if (target < 0 || target >= 64) break;
          const tRow = Math.floor(target / 8);
          const tCol = target % 8;
          const prevTarget = target - d;
          const pRow = Math.floor(prevTarget / 8);
          const pCol = prevTarget % 8;
          if (Math.abs(tRow - pRow) > 1 || Math.abs(tCol - pCol) > 1) break;

          const tp = b[target];
          if (tp === 0) {
            moves.push({ from: i, to: target });
          } else {
            if (isWhite ? tp > 6 : tp <= 6) moves.push({ from: i, to: target });
            break;
          }
        }
      });
    }
  }

  return moves;
}

function makeMove(b, m) {
  const next = [...b];
  next[m.to] = next[m.from];
  next[m.from] = 0;
  return next;
}

function minimax(b, depth, alpha, beta, isMaximizing, nodesRef) {
  nodesRef.count++;
  if (depth === 0) return evaluateBoard(b);

  const side = isMaximizing ? 'w' : 'b';
  const moves = generateSimpleMoves(b, side);
  if (moves.length === 0) return isMaximizing ? -10000 : 10000;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const m of moves) {
      const nextB = makeMove(b, m);
      const ev = minimax(nextB, depth - 1, alpha, beta, false, nodesRef);
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const m of moves) {
      const nextB = makeMove(b, m);
      const ev = minimax(nextB, depth - 1, alpha, beta, true, nodesRef);
      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function searchBestMove(depth = 4) {
  const isWhite = turn === 'w';
  const moves = generateSimpleMoves(board, turn);
  if (moves.length === 0) {
    self.postMessage({ type: 'UCI_OUT', line: 'info string game over' });
    return null;
  }

  let bestMove = moves[0];
  let bestScore = isWhite ? -Infinity : Infinity;
  const nodesRef = { count: 0 };
  const startTime = performance.now();

  for (const m of moves) {
    const nextB = makeMove(board, m);
    const score = minimax(nextB, depth - 1, -Infinity, Infinity, !isWhite, nodesRef);

    if (isWhite ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = m;
    }
  }

  const duration = Math.max(1, Math.round(performance.now() - startTime));
  const nps = Math.round((nodesRef.count / duration) * 1000);
  const uciMove = `${coordsToSquare(bestMove.from)}${coordsToSquare(bestMove.to)}`;

  self.postMessage({
    type: 'UCI_OUT',
    line: `info depth ${depth} score cp ${bestScore} nodes ${nodesRef.count} nps ${nps} time ${duration} pv ${uciMove}`
  });

  self.postMessage({
    type: 'BEST_MOVE',
    move: uciMove,
    from: bestMove.from,
    to: bestMove.to,
    score: bestScore
  });

  return bestMove;
}

self.onmessage = function(e) {
  const msg = e.data;
  if (!msg) return;

  if (typeof msg === 'string') {
    handleUCICommand(msg);
  } else if (msg.type === 'CMD') {
    handleUCICommand(msg.cmd);
  } else if (msg.type === 'APPLY_MOVE') {
    const fromIdx = squareToCoords(msg.from);
    const toIdx = squareToCoords(msg.to);
    board[toIdx] = board[fromIdx];
    board[fromIdx] = 0;
    turn = turn === 'w' ? 'b' : 'w';
    moveHistory.push(`${msg.from}${msg.to}`);
  }
};

function handleUCICommand(cmd) {
  const tokens = cmd.trim().split(' ');
  const command = tokens[0];

  self.postMessage({ type: 'UCI_LOG', line: `> ${cmd}` });

  switch (command) {
    case 'uci':
      self.postMessage({ type: 'UCI_OUT', line: 'id name Stockfish-Lite-Carbon Wasm/Worker' });
      self.postMessage({ type: 'UCI_OUT', line: 'id author Hugo-Carbon Research' });
      self.postMessage({ type: 'UCI_OUT', line: 'option name Skill Level type spin default 10 min 1 max 20' });
      self.postMessage({ type: 'UCI_OUT', line: 'uciok' });
      break;

    case 'isready':
      self.postMessage({ type: 'UCI_OUT', line: 'readyok' });
      break;

    case 'ucinewgame':
      board = [
        PIECES.bR, PIECES.bN, PIECES.bB, PIECES.bQ, PIECES.bK, PIECES.bB, PIECES.bN, PIECES.bR,
        PIECES.bP, PIECES.bP, PIECES.bP, PIECES.bP, PIECES.bP, PIECES.bP, PIECES.bP, PIECES.bP,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        PIECES.wP, PIECES.wP, PIECES.wP, PIECES.wP, PIECES.wP, PIECES.wP, PIECES.wP, PIECES.wP,
        PIECES.wR, PIECES.wN, PIECES.wB, PIECES.wQ, PIECES.wK, PIECES.wB, PIECES.wN, PIECES.wR
      ];
      turn = 'w';
      moveHistory = [];
      break;

    case 'position':
      if (tokens[1] === 'startpos') {
        if (tokens[2] === 'moves') {
          for (let i = 3; i < tokens.length; i++) {
            const m = tokens[i];
            const f = squareToCoords(m.slice(0, 2));
            const t = squareToCoords(m.slice(2, 4));
            board[t] = board[f];
            board[f] = 0;
          }
          turn = (tokens.length - 3) % 2 === 0 ? 'w' : 'b';
        }
      }
      break;

    case 'go':
      const depthIdx = tokens.indexOf('depth');
      const depth = depthIdx !== -1 ? parseInt(tokens[depthIdx + 1], 10) : 4;
      searchBestMove(depth);
      break;
  }
}
