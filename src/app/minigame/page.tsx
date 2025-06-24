"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ref, onValue, update } from "firebase/database";
import { auth, database } from "../../../lib/firebaseConfig"; // ajuste se necessário

interface PlayerScore {
  name: string;
  score: number;
}

const Minigame: React.FC = () => {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [ranking, setRanking] = useState<PlayerScore[]>([]);
  const [galileu, setGalileu] = useState<HTMLImageElement | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timer, setTimer] = useState(30);
  const user = auth.currentUser;

  // Carregar imagem
  useEffect(() => {
    const img = new Image();
    img.src = "/images/galileufrente.png";
    img.onload = () => setGalileu(img);
  }, []);

  // Ranking Firebase
  useEffect(() => {
    const rankingRef = ref(database, "ranking");
    onValue(rankingRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entries = Object.entries(data) as [string, PlayerScore][];
        const sorted = entries
          .map(([_, value]) => value)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);
        setRanking(sorted);
      }
    });
  }, []);

  // Timer do jogo
  useEffect(() => {
    if (isGameOver) return;
    if (timer === 0) {
      setIsGameOver(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, isGameOver]);

  const handleClick = () => {
    if (isGameOver) return;
    const newScore = score + 1;
    setScore(newScore);
    if (user) {
      const userRef = ref(database, `ranking/${user.uid}`);
      update(userRef, {
        name: user.displayName || "Anônimo",
        score: newScore,
      });
    }
  };

  const handleBack = () => {
    router.push("/dashboardaluno");
  };

  const handleRestart = () => {
    setScore(0);
    setTimer(30);
    setIsGameOver(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-950 to-purple-900 p-6 text-white relative">
      <h1 className="text-4xl font-bold mb-2">Galileu Clicker</h1>
      <p className="text-lg mb-2">Tempo restante: <span className="text-purple-300 font-bold">{timer}s</span></p>
      <p className="text-lg mb-4">
        Sua Pontuação: <span className="font-bold text-purple-300">{score}</span>
      </p>

      {galileu && (
        <img
          src={galileu.src}
          alt="Galileu"
          onClick={handleClick}
          className={`w-32 h-32 cursor-pointer transition-transform duration-150 ${isGameOver ? "opacity-40 cursor-default" : "hover:scale-110 active:scale-95"}`}
        />
      )}

      <button
        onClick={handleBack}
        className="mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded shadow"
      >
        Voltar ao Dashboard
      </button>

      <div className="mt-10 w-full max-w-md bg-purple-800 rounded-lg p-4 shadow">
        <h2 className="text-xl font-bold mb-2">Ranking (Top 5)</h2>
        <ul className="space-y-1">
          {ranking.map((player, index) => (
            <li key={index} className="flex justify-between">
              <span>{player.name}</span>
              <span className="text-purple-200 font-mono">{player.score}</span>
            </li>
          ))}
        </ul>
      </div>

      {isGameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Tempo esgotado!</h2>
            <p className="mb-4">Você fez <strong>{score}</strong> ponto{score === 1 ? "" : "s"}.</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRestart}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Jogar Novamente
              </button>
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500 text-white"
              >
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Minigame;
