const express = require("express");
const Redis = require("ioredis");
const Server = require("socket.io");
require("dotenv").config();

const app = express();
app.use(express.json());

const client = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

const io = Server(
  app.listen(5000, () => {
    console.log("Consumer listening on port 5000");
  }),
  {
    cors: {
      origin: "http://localhost:3000",
    },
  }
);

const streamName = "leaderboard";
const groupName = "leaderboard-group";

// need to do
// Check group info using xinfo method
// Create Consumer Group xgroup
// Read consumer group
// xack

// XGROUP is used in order to create, destroy and manage consumer groups.
// XREADGROUP is used to read from a stream via a consumer group.
// XACK is the command that allows a consumer to mark a pending message as correctly processed.

async function createConsumerGroupIfNotExists() {
  try {
    // Check if the stream exists
    const streamExists = await client.exists(streamName);

    if (!streamExists) {
      // If the stream doesn't exist, create it with an initial entry
      await client.xadd(streamName, "*", "init", "true");
      console.log(`Stream ${streamName} created.`);
    }

    // Now check for the consumer group
    const groupInfo = await client.xinfo("GROUPS", streamName);

    if (groupInfo.length === 0) {
      // If the group doesn't exist, create it
      await client.xgroup("CREATE", streamName, groupName, "$", "MKSTREAM");
      console.log(
        `Consumer group ${groupName} created for stream ${streamName}`
      );
    } else {
      console.log(
        `Consumer group ${groupName} already exists for stream ${streamName}`
      );
    }
  } catch (err) {
    console.error("Error setting up stream and consumer group:", err);
  }
}

createConsumerGroupIfNotExists().then(() => {
  listenToMessages();
});

function listenToMessages() {
  client.xreadgroup(
    "GROUP",
    groupName,
    streamName,
    "BLOCK",
    100,
    "STREAMS",
    streamName,
    ">",
    function (err, result) {
      if (err) {
        console.log("error: ", err);
        setTimeout(() => {
          listenToMessages();
        }, 1000);
        return;
      }
      if (result && result.length > 0) {
        const stream = result[0];
        const messageId = stream[1][0][0];
        const message = stream[1][0][1];
        console.log("message: ", message);
        client.xack(streamName, groupName, messageId, async (err) => {
          if (err) {
            console.log("message not processed: ", err);
          } else {
            const data = await client.hget("players", message[0]);
            const player = JSON.parse(data);
            console.log(
              "player score before processing data: ",
              player.score,
              message[1]
            );

            player.score = player.score + Number(message[1]);
            console.log("player score after processing data: ", player.score);

            await client.hset(
              "players",
              `playerId ${player.playerId}`,
              JSON.stringify(player)
            );
            io.emit("player-event", player);
            console.log("Emitted player-event:", player);
          }
          listenToMessages();
        });
      } else {
        listenToMessages();
      }
    }
  );
}
