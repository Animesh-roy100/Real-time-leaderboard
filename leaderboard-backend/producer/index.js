const express = require("express");
const Redis = require("ioredis");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

const client = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

app.use(express.json());

const streamName = "leaderboard";

app.post("/addPlayer", async (req, res) => {
  console.log("player info: ", req.body);
  try {
    // await client.xadd(streamName, "*", "players", JSON.stringify(data));
    await client.hset(
      "players",
      `playerId ${req.body.playerId}`,
      JSON.stringify(req.body)
    );
    res.status(200).json({ message: "Player added successfully" });
  } catch (error) {
    console.error("Error adding player:", error);
    res
      .status(500)
      .json({ error: "Error adding player", details: error.message });
  }
});

app.post("/processData", async (req, res) => {
  const data = req.body;
  console.log("Process Data: ", data);
  try {
    await client.xadd(streamName, "*", `playerId ${data.playerId}`, data.score);
    res.status(200).send({ message: "Player added successfully" });
  } catch (error) {
    res.status(500).send("Error adding player");
  }
});

app.listen(4000, () => {
  console.log("Producer running on port 4000");
});
