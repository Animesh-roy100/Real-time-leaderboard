"use client";

import React, { useEffect, useState } from "react";
import addPlayerAction, { PlayerProps, processDataAction } from "./action";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function Home() {
  const [playersInfo, setPlayersInfo] = useState<PlayerProps[]>([]);
  const [playerIdCounter, setPlayerIdCounter] = useState(1);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    socket.on("player-event", (player) => {
      console.log("Received player event:", player);
      setPlayersInfo((prevPlayers) =>
        prevPlayers.map((p) =>
          p.playerId === player.playerId ? { ...p, score: player.score } : p
        )
      );
    });

    return () => {
      socket.off("player-event");
    };
  }, []);

  useEffect(() => {
    console.log("Updated playersInfo:", playersInfo);
  }, [playersInfo]);

  const addPlayer = async () => {
    const playerId = playerIdCounter;

    const payload = {
      playerId: playerId,
      playerName: `Player ${playerId}`,
      score: 0,
      createdOn: new Date().toISOString(),
    };

    try {
      const response = await addPlayerAction(payload);
      if (response.ok) {
        const data = await response.json();
        console.log("Add Player", data);

        setPlayersInfo((prevPlayers) => [...prevPlayers, payload]);
        setPlayerIdCounter(playerIdCounter + 1);
      } else {
        console.error("Failed to add player");
      }
    } catch (err) {
      console.error("Error adding player:", err);
    }
  };

  const processData = async (player: PlayerProps) => {
    const payload = {
      playerId: player.playerId,
      score: Math.round(Math.random() * 100),
    };

    try {
      await processDataAction(payload);
      console.log("Processed data for player:", player.playerId);
    } catch (err) {
      console.error("Error processing data:", err);
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
      <div className="w-full max-w-4xl px-4 flex space-x-4 p-10">
        {/* Players Section */}
        <div className="w-1/2">
          <h2 className="text-white text-2xl font-bold mb-4">Players</h2>
          <div className="bg-white bg-opacity-20 rounded-lg shadow-lg p-4">
            <div className="flex justify-between items-center border-b-2 border-white p-2 mb-4">
              <div className="text-white text-lg font-bold w-1/2 text-left">
                Name
              </div>
              <div className="text-white text-lg font-bold w-1/2 text-right">
                Roll Dice
              </div>
            </div>
            {playersInfo &&
              playersInfo.map((player) => (
                <div
                  key={player.playerId}
                  className="flex justify-between items-center text-white text-lg p-2 bg-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.3)] transition-colors duration-300 rounded-lg shadow-md mb-2"
                >
                  <div className="w-1/2 text-left">{player.playerName}</div>
                  <div className="w-1/2 text-right">
                    <button
                      className="px-4 py-2 bg-green-500 hover:bg-green-700 transition-colors duration-300 rounded-lg shadow-md font-semibold"
                      onClick={() => processData(player)}
                    >
                      Play
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="w-1/2">
          <h2 className="text-white text-2xl font-bold mb-4">Leaderboard</h2>
          <div className="bg-white bg-opacity-20 rounded-lg shadow-lg p-4">
            <div className="flex justify-between items-center border-b-2 border-white p-2 mb-4">
              <div className="text-white text-lg font-bold w-1/4 text-left">
                Rank
              </div>
              <div className="text-white text-lg font-bold w-1/4 text-left">
                Player ID
              </div>
              <div className="text-white text-lg font-bold w-1/4 text-left">
                Name
              </div>
              <div className="text-white text-lg font-bold w-1/4 text-right">
                Score
              </div>
            </div>
            {playersInfo &&
              [...playersInfo]
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <div
                    key={player.playerId}
                    className="flex justify-between items-center text-white text-lg p-2 bg-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.3)] transition-colors duration-300 rounded-lg shadow-md mb-2"
                  >
                    <div className="w-1/4 text-left">{index + 1}</div>
                    <div className="w-1/4 text-left">{player.playerId}</div>
                    <div className="w-1/4 text-left">{player.playerName}</div>
                    <div className="w-1/4 text-right">{player.score}</div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
