import React, { useEffect, useState } from "react";
import "./App.css";

/**
 * Tic-Tac-Toe Game - Main Application Component
 * Features:
 * - Two-player local and vs computer (basic AI)
 * - Centered grid, minimal modern style
 * - Scoreboard, restart control, responsive layout
 * - Game end highlights (win/draw)
 */

// Board size
const BOARD_SIZE = 3;
// Colors
const COLOR_PRIMARY = "#1976d2";
const COLOR_SECONDARY = "#f5f5f5";
const COLOR_ACCENT = "#ff9800";

// PUBLIC_INTERFACE
function App() {
  // Board state: 3x3 array with 'X', 'O' or null
  const [board, setBoard] = useState(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
  // true: X turn, false: O turn
  const [xIsNext, setXIsNext] = useState(true);
  // Game outcome: null=playing, 'X', 'O', or 'draw'
  const [gameResult, setGameResult] = useState(null);
  // Scoreboard: {X: number, O: number, draws: number}
  const [score, setScore] = useState({ X: 0, O: 0, draws: 0 });
  // Mode: "local" or "computer"
  const [mode, setMode] = useState("local");

  // Highlight: array of square indexes to highlight (win line)
  const [highlight, setHighlight] = useState([]);

  // PUBLIC_INTERFACE
  function handleModeChange(e) {
    setMode(e.target.value);
    resetGame(e.target.value, true); // reset and maybe let AI move first if needed
  }

  // PUBLIC_INTERFACE
  function resetGame(newMode = mode, preserveScore = true) {
    setBoard(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
    setGameResult(null);
    setHighlight([]);
    // If playing as O vs computer, AI goes first
    if (newMode === "computer" && !xIsNext) {
      // Let computer (O) play immediate move after reset
      setTimeout(() => computerMove("O"), 350);
    }
    if (!preserveScore)
      setScore({ X: 0, O: 0, draws: 0 });
    setXIsNext(true);
  }

  // PUBLIC_INTERFACE
  function handleSquareClick(i) {
    if (board[i] || gameResult) return;
    if (mode === "computer" && !xIsNext) return; // User is always X vs computer
    const newBoard = [...board];
    newBoard[i] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  }

  // Handle computer AI move
  useEffect(() => {
    if (
      mode === "computer" &&
      !gameResult &&
      !xIsNext // Computer is always O
    ) {
      const delay = setTimeout(() => computerMove("O"), 420);
      return () => clearTimeout(delay);
    }
    // eslint-disable-next-line
  }, [board, xIsNext, mode, gameResult]);

  // Basic AI: pick center, then corners, else random
  function computerMove(aiMarker) {
    const empty = board
      .map((val, i) => (val == null ? i : null))
      .filter((x) => x !== null);
    if (empty.length === 0) return;

    // Try to win if possible
    let move = findBestMove(board, aiMarker);
    if (move == null) {
      // Try to block
      move = findBestMove(board, xIsNext ? "O" : "X");
    }
    if (move == null && empty.includes(4)) {
      move = 4; // Center
    }
    if (move == null) {
      // Pick random empty
      move = empty[Math.floor(Math.random() * empty.length)];
    }
    handleSquareClickAI(move);
  }

  // Find a winning/blocking move
  function findBestMove(brd, marker) {
    const lines = getWinLines();
    for (let line of lines) {
      const vals = line.map((i) => brd[i]);
      if (
        vals.filter((v) => v === marker).length === 2 &&
        vals.filter((v) => v == null).length === 1
      ) {
        return line[vals.indexOf(null)];
      }
    }
    return null;
  }

  function handleSquareClickAI(i) {
    if (board[i] || gameResult) return;
    const newBoard = [...board];
    newBoard[i] = "O";
    setBoard(newBoard);
    setXIsNext(true);
  }

  // Check for winner - game end logic
  useEffect(() => {
    const lines = getWinLines();
    for (let line of lines) {
      const [a, b, c] = line;
      if (
        board[a] &&
        board[a] === board[b] &&
        board[b] === board[c]
      ) {
        setGameResult(board[a]);
        setHighlight(line);
        setScore((prev) => ({
          ...prev,
          [`${board[a]}`]: prev[`${board[a]}`] + 1,
        }));
        return;
      }
    }
    if (board.every((sq) => sq)) {
      setGameResult("draw");
      setHighlight([]);
      setScore((prev) => ({
        ...prev,
        draws: prev.draws + 1,
      }));
    }
    // eslint-disable-next-line
  }, [board]);

  // Get lines for winning
  function getWinLines() {
    return [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Cols
      [0, 4, 8],
      [2, 4, 6], // Diags
    ];
  }

  // PUBLIC_INTERFACE
  function handleRestartClick() {
    resetGame(mode, true);
  }

  // PUBLIC_INTERFACE
  function handleFullReset() {
    setScore({ X: 0, O: 0, draws: 0 });
    resetGame(mode, false);
  }

  // Game status text
  function statusText() {
    if (gameResult === "X") return "Player X wins!";
    if (gameResult === "O") return mode === "computer" ? "Computer wins!" : "Player O wins!";
    if (gameResult === "draw") return "Draw game!";
    return mode === "computer"
      ? xIsNext
        ? "Your turn"
        : "Computer's turn"
      : xIsNext
        ? "Player X's turn"
        : "Player O's turn";
  }

  // Render single square
  function Square({ value, onClick, highlight }) {
    return (
      <button
        className="ttt-square"
        style={{
          color: value === "X" ? COLOR_PRIMARY : value === "O" ? COLOR_ACCENT : undefined,
          background: highlight ? "#ffecb360" : "#ffffff90",
          borderColor: highlight
            ? (value === "X" ? COLOR_PRIMARY : COLOR_ACCENT)
            : "#cfd8dc",
          transition: "background 0.2s, border-color 0.2s",
          fontWeight: highlight ? "900" : "500",
          boxShadow: highlight ? `0 0 10px 1px ${COLOR_ACCENT}33` : "none",
        }}
        onClick={onClick}
        aria-label={value ? `Cell with ${value}` : "Empty board cell"}
        disabled={!!value || !!gameResult}
      >
        {value}
      </button>
    );
  }

  // Render board grid
  function Board() {
    return (
      <div className="ttt-board">
        {board.map((val, i) => (
          <Square
            key={i}
            value={val}
            onClick={() => handleSquareClick(i)}
            highlight={highlight.includes(i)}
          />
        ))}
      </div>
    );
  }

  // Render menu/header
  function Header() {
    return (
      <header className="ttt-header">
        <h1 className="ttt-title">
          Tic Tac Toe
        </h1>
        <div className="ttt-menu">
          <select
            className="ttt-mode"
            value={mode}
            onChange={handleModeChange}
            aria-label="Select game mode"
          >
            <option value="local">Two Player (local)</option>
            <option value="computer">Vs Computer</option>
          </select>
        </div>
      </header>
    );
  }

  // Render scoreboard and controls
  function Footer() {
    return (
      <footer className="ttt-footer">
        <div className="ttt-scoreboard">
          <div className="score score-x">
            X
            <span className="score-value">{score.X}</span>
          </div>
          <div className="score score-draw">
            Draw
            <span className="score-value">{score.draws}</span>
          </div>
          <div className="score score-o">
            O
            <span className="score-value">{score.O}</span>
          </div>
        </div>
        <div className="ttt-controls">
          <button className="ttt-btn" onClick={handleRestartClick}>
            Restart
          </button>
          <button className="ttt-btn ttt-btn-secondary" onClick={handleFullReset} title="Reset board & scores">
            Reset Score
          </button>
        </div>
      </footer>
    );
  }

  return (
    <div className="App" style={{ background: COLOR_SECONDARY, minHeight: "100vh" }}>
      <div className="ttt-container">
        <Header />
        <div className="ttt-status" style={{
          color:
            gameResult === "draw" ? "#777" :
            gameResult === "X" ? COLOR_PRIMARY :
            gameResult === "O" ? COLOR_ACCENT : "#313237",
          background:
            (!!gameResult ? "#EEEEEE" : "#fafbfc"),
          marginBottom: 22,
        }}>
          {statusText()}
        </div>
        <Board />
        <Footer />
        <div className="ttt-github-link" style={{ marginTop: 32, opacity: 0.13, fontSize: 14 }}>
          Modern minimal sample • React
        </div>
      </div>
    </div>
  );
}

export default App;
