import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { db, submitGlobalScore, fetchGlobalLeaderboard } from "./firebase";

const diceEmoji = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export default function App() {
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [playerRoll, setPlayerRoll] = useState(null);
  const [computerRoll, setComputerRoll] = useState(null);
  const [result, setResult] = useState("");
  const [mode, setMode] = useState("high");
  const [isRolling, setIsRolling] = useState(false);
  const [playerStats, setPlayerStats] = useState({ wins: 0, losses: 0 });
  const [globalScores, setGlobalScores] = useState([]);

  useEffect(() => {
    const savedName = Cookies.get("dicePlayer");
    if (savedName) setName(savedName);
    fetchGlobalLeaderboard("dice_leaderboard").then(setGlobalScores);
  }, []);

  useEffect(() => {
    const found = globalScores.find((entry) => entry.name === name);
    if (found) setPlayerStats(found);
  }, [globalScores, name]);

  const saveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setName(trimmed);
    Cookies.set("dicePlayer", trimmed);
  };

  const logout = () => {
    Cookies.remove("dicePlayer");
    setName("");
    setPlayerRoll(null);
    setComputerRoll(null);
    setResult("");
  };

  const updateScore = (win, loss) => {
    const updated = {
      name,
      wins: playerStats.wins + win,
      losses: playerStats.losses + loss,
    };
    setPlayerStats(updated);
    submitGlobalScore("dice_leaderboard", name, updated);
    fetchGlobalLeaderboard("dice_leaderboard").then(setGlobalScores);
  };

  const animateRoll = (callback, onComplete) => {
    let steps = 20;
    let currentStep = 0;

    const animate = () => {
      if (currentStep < steps) {
        const roll = Math.ceil(Math.random() * 6);
        callback(roll);
        currentStep++;
        const delay = 50 + currentStep * 20;
        setTimeout(animate, delay);
      } else {
        const final = Math.ceil(Math.random() * 6);
        callback(final);
        if (onComplete) onComplete(final);
      }
    };

    animate();
  };

  const playGame = () => {
    if (isRolling) return;
    setIsRolling(true);
    setResult("");
    setPlayerRoll(null);
    setComputerRoll(null);

    animateRoll(setPlayerRoll, (finalPlayerRoll) => {
      animateRoll(setComputerRoll, (finalComputerRoll) => {
        if (finalPlayerRoll === finalComputerRoll) {
          setResult("It's a tie!");
        } else {
          const playerWins =
            (mode === "high" && finalPlayerRoll > finalComputerRoll) ||
            (mode === "low" && finalPlayerRoll < finalComputerRoll);
          if (playerWins) {
            setResult("You win!");
            updateScore(1, 0);
          } else {
            setResult("You lose!");
            updateScore(0, 1);
          }
        }
        setIsRolling(false);
      });
    });
  };

  if (!name) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <h1 className="text-3xl font-bold mb-2 text-center">Play Dice Game</h1>
        <div className="text-4xl mb-4">🎲</div>
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Enter your name"
          className="px-4 py-2 rounded text-black mb-2"
        />
        <button onClick={saveName} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
          Start Game
        </button>
      </div>
    );
  }

  const { wins = 0, losses = 0 } = playerStats;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">🎲 Dice Game</h1>
      <p className="mb-2">
        Welcome, <span className="font-semibold text-yellow-400">{name}</span>
      </p>

      <div className="flex items-center space-x-4 mb-4">
        <label>
          <input
            type="radio"
            checked={mode === "high"}
            onChange={() => setMode("high")}
            className="mr-1"
          />
          High Roll Wins
        </label>
        <label>
          <input
            type="radio"
            checked={mode === "low"}
            onChange={() => setMode("low")}
            className="mr-1"
          />
          Low Roll Wins
        </label>
      </div>

      <button
        onClick={playGame}
        disabled={isRolling}
        className={`mb-4 ${isRolling ? "bg-gray-600" : "bg-green-500 hover:bg-green-600"} px-6 py-3 rounded font-bold`}
      >
        {isRolling ? "Rolling..." : "Play Game"}
      </button>

      <div className="text-xl mb-4">
        <p>
          You rolled: <span className="text-5xl">{diceEmoji[playerRoll] || "-"}</span>
        </p>
        <p>
          Computer rolled: <span className="text-5xl">{diceEmoji[computerRoll] || "-"}</span>
        </p>
        <p className="mt-2 text-yellow-300 font-semibold">{result}</p>
      </div>

      <div className="mb-6 text-center">
        <p>🏆 Wins: {wins}</p>
        <p>💥 Losses: {losses}</p>
      </div>

      <button onClick={logout} className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-800 mb-6">
        Switch Player
      </button>

      <h2 className="text-2xl font-bold mb-2">🌍 Global Leaderboard</h2>
      <ul>
        {globalScores.map((player) => (
          <li key={player.name} className="text-sm">
            {player.name}: {player.wins}W / {player.losses}L
            <span className="text-yellow-400 font-semibold ml-2">
              (Net: {player.wins - player.losses})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

