export type PlayerProps = {
  playerId: number;
  playerName: string;
  score: number;
  createdOn: string;
};
export default async function addPlayerAction(playerInfo: PlayerProps) {
  console.log("playerInfo", playerInfo);

  const response = await fetch("http://localhost:4000/addPlayer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(playerInfo),
  });

  return response;
}

export async function processDataAction(payload: any) {
  const response = await fetch("http://localhost:4000/processData", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  return data;
}
