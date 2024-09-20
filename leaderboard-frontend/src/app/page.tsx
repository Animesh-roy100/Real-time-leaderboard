"use client";

import React, { useState } from "react";
import addPlayerAction, { PlayerProps } from "./action";

export default function Home() {
  const [playersInfo, setPlayersInfo] = useState<PlayerProps[]>([]);

  const addPlayer = async () => {
    const number = Math.round(Math.random() * 100);
    const payload = {
      playerId: number,
      playerName: `Player ${number}`,
      score: 0,
      createdOn: new Date().toISOString(),
    };
    try {
      const response = await addPlayerAction(payload);
      if (response.ok) {
        const data = await response.json();
        console.log("Add Player", data);
        setPlayersInfo((prevPlayers) => [...prevPlayers, payload]);
      } else {
        console.error("Failed to add player");
      }
    } catch (err) {
      console.error("Error adding player:", err);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500">
      <header className="text-white p-4 text-3xl font-bold">
        <h1>Real Time Leaderboard</h1>
      </header>
      <button
        className="px-4 py-2 m-2 bg-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.7)] transition-colors duration-300 rounded-lg shadow-md text-gray-800 font-semibold"
        onClick={addPlayer}
      >
        Add Player
      </button>
      <div className="flex flex-col w-1/4 gap-3">
        <div className="flex border-solid border-b-2 font-bold p-2 justify-between text-white">
          <div>Name</div>
          <div>Roll Dice</div>
        </div>
        {playersInfo.map((player) => (
          <div
            key={player.playerId}
            className="flex justify-between text-white"
          >
            <div>{player.playerName}</div>
            <button className="px-4 py-2 bg-green-500 hover:bg-green-700 transition-colors duration-300 rounded-lg shadow-md font-semibold">
              Play
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
