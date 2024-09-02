import { cwd } from "node:process";
import { join } from "node:path";
import { Redis } from "ioredis";
import { createServer } from "node:http";
import { availableParallelism } from "node:os";
import { Server as socketServer } from "socket.io";
import { createAdapter, setupPrimary } from "@socket.io/cluster-adapter";

import cluster from "node:cluster";
import express from "express";

if (cluster.isPrimary) {
  const redis = new Redis();

  redis.subscribe("private", (err, count) => {
    if (err) console.log(`FAILED: ${err.message}`);
    else console.log("SUBSCRIBED CHANNEL: private");
  });

  redis.on("message", (channel, message) => {
    console.log(`Received ${message} from ${channel}`);
  });

  const numCpus = availableParallelism();
  let totalClients = 0; // Shared variable to record total clients count

  for (let i = 0; i < numCpus; i++) {
    const worker = cluster.fork({
      PORT: 3000,
    });

    // Listen for messages from worker processes
    worker.on("message", (msg) => {
      if (msg.type === "client-connected") {
        totalClients++;
        console.log(`Total clients connected: ${totalClients}`);
      } else if (msg.type === "client-disconnected") {
        totalClients--;
        console.log(`Total clients connected: ${totalClients}`);
      }
    });
  }

  console.log("PRIMARY PID:", process.pid);
  setupPrimary();
} else {
  const app = express();
  const server = createServer(app);
  const io = new socketServer(server, {
    connectionStateRecovery: {},
    // Set up the adapter on each worker thread
    adapter: createAdapter(),
  });

  io.on("connection", (socket) => {
    console.log(
      `client \u001b[35m${socket.id}\u001b[0m on PID: \u001b[34m${process.pid}\u001b[0m \u001b[1;32mconnected\u001b[0m`
    );

    // Notify the primary process that a client has connected
    process.send({ type: "client-connected" });

    socket.on("disconnect", () => {
      console.log(
        `client \u001b[35m${socket.id}\u001b[0m on PID: \u001b[34m${process.pid}\u001b[0m \u001b[1;31mdisconnected\u001b[0m`
      );

      // Notify the primary process that a client has disconnected
      process.send({ type: "client-disconnected" });
    });

    socket.on("ping", () => {
      io.emit("broadcast", "PONG");
    });

    socket.on('broadcast', (msg)=>{
      socket.broadcast.emit('broadcast', msg)
    })
  });

  app.get("/", (req, res) => {
    res.sendFile(join(cwd(), "index.html"));
  });

  server.listen(process.env.PORT, () => {
    console.log(process.pid, "listening on port", process.env.PORT);
  });
}
