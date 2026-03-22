/***********************
 * Tic Tac Toe (3x3)
 * - Two players, or vs computer (simple smart AI)
 * - Animations + win line highlight
 * - Scoreboard + sound effects
 ***********************/

// Board win lines (indices in a 1D array of length 9).
const LINES = [
  // Rows
  [0,1,2], [3,4,5], [6,7,8],
  // Cols
  [0,3,6], [1,4,7], [2,5,8],
  // Diagonals
  [0,4,8], [2,4,6]
];

// In vsComputer mode:
// - Human is X
// - AI is O
const HUMAN = "X";
const AI = "O";

// DOM refs
const boardEl = document.getElementById("board");
const cells = Array.from(boardEl.querySelectorAll(".cell"));

const statusMain = document.getElementById("statusMain");
const statusHint = document.getElementById("statusHint");

const resetRoundBtn = document.getElementById("resetRoundBtn");
const resetScoreBtn = document.getElementById("resetScoreBtn");

const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const scoreDEl = document.getElementById("scoreD");

const modeSelect = document.getElementById("mode");
const modeNote = document.getElementById("modeNote");

const themeBtn = document.getElementById("themeBtn");
const soundBtn = document.getElementById("soundBtn");

const winOverlay = document.getElementById("winOverlay");
const winLine = document.getElementById("winLine");

// State
let board = Array(9).fill("");
let currentPlayer = "X";
let gameActive = true;

let mode = modeSelect.value; // "twoPlayer" | "vsComputer"
const scores = { X: 0, O: 0, D: 0 };

// Sound (Web Audio, simple beeps)
let audioCtx = null;
let soundEnabled = true;

function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // iOS/Safari may suspend until user gesture.
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function tone(freq, ms, type = "sine", gain = 0.08) {
  ensureAudio();
  const t0 = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;

  const g = audioCtx.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + ms / 1000);

  osc.connect(g);
  g.connect(audioCtx.destination);

  osc.start(t0);
  osc.stop(t0 + ms / 1000);
}

function playClickSound() {
  if (!soundEnabled) return;
  tone(520, 70, "triangle", 0.06);
  setTimeout(() => tone(780, 55, "sine", 0.045), 35);
}

function playWinSound() {
  if (!soundEnabled) return;
  // A quick chime.
  const notes = [659, 784, 988];
  notes.forEach((f, i) => setTimeout(() => tone(f, 120, "sine", 0.06), i * 120));
}

function playDrawSound() {
  if (!soundEnabled) return;
  tone(320, 170, "sine", 0.045);
  setTimeout(() => tone(250, 160, "triangle", 0.04), 120);
}

// Theme persistence
function setTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem("t3-theme", theme);
  themeBtn.textContent = theme === "dark" ? "Toggle Theme" : "Toggle Theme";
}

function initTheme() {
  const saved = localStorage.getItem("t3-theme");
  if (saved === "light" || saved === "dark") {
    setTheme(saved);
  }
}

// Helper: set status message with a fade animation
function setStatus(mainText, hintText) {
  statusMain.classList.remove("fadeIn");
  // Force reflow so the animation reliably restarts
  void statusMain.offsetWidth;
  statusMain.classList.add("fadeIn");

  statusMain.innerHTML = mainText;
  statusHint.textContent = hintText;
}

function getEmptyIndices() {
  return board
    .map((v, i) => (v === "" ? i : null))
    .filter(i => i !== null);
}

function checkWinner(currentBoard) {
  for (const line of LINES) {
    const [a, b, c] = line;
    const v = currentBoard[a];
    if (v && v === currentBoard[b] && v === currentBoard[c]) {
      return { winner: v, line };
    }
  }
  return { winner: null, line: null };
}

function isDraw(currentBoard) {
  return currentBoard.every(v => v !== "");
}

function clearWinEffects() {
  cells.forEach(cell => {
    cell.classList.remove("win");
  });

  winOverlay.classList.remove("isActive");
  winLine.setAttribute("x1", "0");
  winLine.setAttribute("y1", "0");
  winLine.setAttribute("x2", "0");
  winLine.setAttribute("y2", "0");
}

function updateUI() {
  cells.forEach((cell, i) => {
    const v = board[i];
    cell.textContent = v;
    cell.disabled = !gameActive || v !== "";

    cell.classList.remove("mark-x", "mark-o", "marked", "win");
    if (v === "X") cell.classList.add("mark-x");
    if (v === "O") cell.classList.add("mark-o");
  });
}

function markCell(index, player) {
  board[index] = player;

  const cell = cells[index];
  cell.textContent = player;

  cell.classList.remove("mark-x", "mark-o");
  cell.classList.add(player === "X" ? "mark-x" : "mark-o");

  // Pop animation
  cell.classList.remove("marked");
  void cell.offsetWidth; // restart animation
  cell.classList.add("marked");

  // Disable immediately to prevent double-click races
  cell.disabled = true;
}

function highlightWinningLine(lineIndices) {
  // Highlight the 3 cells
  lineIndices.forEach(i => cells[i].classList.add("win"));

  // Draw an animated line using SVG coordinates.
  // SVG viewBox is 0..100; we map from pixels to that range.
  const gridRect = boardEl.getBoundingClientRect();

  const p1 = cells[lineIndices[0]].getBoundingClientRect();
  const p3 = cells[lineIndices[2]].getBoundingClientRect();

  const x1 = (p1.left + p1.width / 2) - gridRect.left;
  const y1 = (p1.top + p1.height / 2) - gridRect.top;
  const x2 = (p3.left + p3.width / 2) - gridRect.left;
  const y2 = (p3.top + p3.height / 2) - gridRect.top;

  const w = gridRect.width;
  const h = gridRect.height;

  const sx1 = (x1 / w) * 100;
  const sy1 = (y1 / h) * 100;
  const sx2 = (x2 / w) * 100;
  const sy2 = (y2 / h) * 100;

  winLine.setAttribute("x1", sx1.toString());
  winLine.setAttribute("y1", sy1.toString());
  winLine.setAttribute("x2", sx2.toString());
  winLine.setAttribute("y2", sy2.toString());

  winOverlay.classList.remove("isActive");
  void winOverlay.offsetWidth;
  winOverlay.classList.add("isActive");
}

function resetRound() {
  board = Array(9).fill("");
  currentPlayer = "X";
  gameActive = true;

  clearWinEffects();
  updateUI();

  if (mode === "vsComputer") {
    setStatus("<strong>X</strong> to move", "You are X. The AI is O.");
  } else {
    setStatus("<strong>Player X</strong> to move", "X goes first. Take a turn.");
  }
}

function resetScore() {
  scores.X = 0;
  scores.O = 0;
  scores.D = 0;
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDEl.textContent = scores.D;
  resetRound();
}

// AI (simple smart rules; not full minimax)
function findLineMove(currentBoard, player) {
  // If a line has 2 of `player` and 1 empty, take the empty.
  for (const line of LINES) {
    const values = line.map(i => currentBoard[i]);
    const empties = line.filter(i => currentBoard[i] === "");
    const playerCount = values.filter(v => v === player).length;

    if (playerCount === 2 && empties.length === 1) return empties[0];
  }
  return null;
}

function findBestMoveForAI(currentBoard) {
  // 1) If AI can win in one move, do it.
  let win = findLineMove(currentBoard, AI);
  if (win !== null) return win;

  // 2) If human can win next, block it.
  let block = findLineMove(currentBoard, HUMAN);
  if (block !== null) return block;

  // 3) Take center if available.
  if (currentBoard[4] === "") return 4;

  // 4) Take a random corner if available.
  const corners = [0,2,6,8].filter(i => currentBoard[i] === "");
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

  // 5) Otherwise, random available move.
  const empties = getEmptyIndices();
  return empties[Math.floor(Math.random() * empties.length)];
}

function maybeComputerMove() {
  // AI plays as O and only when it's AI's turn.
  if (mode !== "vsComputer") return;
  if (!gameActive) return;
  if (currentPlayer !== AI) return;

  // Delay makes gameplay feel more natural.
  setTimeout(() => {
    if (!gameActive) return;
    const move = findBestMoveForAI(board);
    if (move === undefined || move === null) return;
    takeTurn(move);
  }, 420);
}

function takeTurn(index) {
  if (!gameActive) return;
  if (board[index] !== "") return;

  const player = currentPlayer;

  // Place mark (with animation)
  markCell(index, player);
  playClickSound();

  // Check win/draw
  const result = checkWinner(board);

  if (result.winner) {
    gameActive = false;
    highlightWinningLine(result.line);

    if (result.winner === "X") scores.X += 1;
    else scores.O += 1;

    scoreXEl.textContent = scores.X;
    scoreOEl.textContent = scores.O;

    setStatus(result.winner + " wins!", "Nice play. Hit Reset to start a new round.");
    playWinSound();

    updateUI();
    return;
  }

  if (isDraw(board)) {
    gameActive = false;
    scores.D += 1;
    scoreDEl.textContent = scores.D;

    clearWinEffects();
    setStatus("Draw!", "No winner this round. Hit Reset to play again.");
    playDrawSound();
    updateUI();
    return;
  }

  // Continue game
  currentPlayer = (currentPlayer === "X") ? "O" : "X";

  if (mode === "vsComputer") {
    setStatus("<strong>" + currentPlayer + "</strong> to move", currentPlayer === HUMAN ? "Your turn." : "AI is thinking...");
  } else {
    setStatus("<strong>Player " + currentPlayer + "</strong> to move", "Make your move.");
  }

  updateUI();
  maybeComputerMove();
}

// Event listeners
cells.forEach(cell => {
  cell.addEventListener("click", () => {
    const index = Number(cell.dataset.index);

    // In vsComputer mode, only allow clicks on HUMAN's turn.
    if (mode === "vsComputer" && currentPlayer !== HUMAN) return;

    takeTurn(index);
  });
});

resetRoundBtn.addEventListener("click", resetRound);
resetScoreBtn.addEventListener("click", resetScore);

modeSelect.addEventListener("change", () => {
  mode = modeSelect.value;

  if (mode === "vsComputer") {
    modeNote.textContent = "Vs Computer: you are X. AI plays O.";
    resetRound();
  } else {
    modeNote.textContent = "Two Players: X goes first.";
    resetRound();
  }
});

themeBtn.addEventListener("click", () => {
  const next = (document.body.dataset.theme === "dark") ? "light" : "dark";
  setTheme(next);
});

soundBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundBtn.textContent = "Sound: " + (soundEnabled ? "On" : "Off");
  if (soundEnabled) playClickSound();
});

// Init
function init() {
  initTheme();

  if (mode === "vsComputer") {
    modeNote.textContent = "Vs Computer: you are X. AI plays O.";
    setStatus("<strong>X</strong> to move", "You are X. The AI is O.");
  } else {
    modeNote.textContent = "Two Players: X goes first.";
    setStatus("<strong>Player X</strong> to move", "X goes first. Take a turn.");
  }

  updateUI();
}

init();
