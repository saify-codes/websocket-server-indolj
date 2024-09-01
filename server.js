import { cwd } from "node:process";
import { join } from "node:path";
import { Server } from "socket.io";
import { Redis } from "ioredis";
import { createServer } from "node:http";
import { error_log, success_log } from "./utils/index.js";

import express from "express";
import SocketList from "./Classes/SocketList.js";

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

const redis = new Redis();

redis.subscribe("private", (err, count) => {
  const date = new Date();

  if (err) {
    // Just like other commands, subscribe() can fail for some reasons,
    // ex network issues.
    error_log(`FAILED: ${err.message}`);
  } else {
    success_log("SUBSCRIBED CHANNEL: private");
  }
});

redis.on("message", (channel, message) => {
  console.log(`Received ${message} from ${channel}`);

  try {
    const { merchantId, branchId, data } = JSON.parse(message);

    if (merchantId && merchants.has(merchantId)) {
      if (branchId && !isNaN(branchId)) {
        merchants
          .get(merchantId)
          .admins.forEach((socket) => socket.emit("message", data));
      } else {
        merchants
          .get(merchantId)
          .admins.forEach((socket) => socket.emit("message", data));
      }
    }
  } catch (err) {
    console.log(`INVALID JSON: ${err.message}`);
    error_log(`INVALID JSON: ${message}`);
  }
});

// const namespace = io.of('foo')

// namespace.on("connection", (socket) => {
//     socket.broadcast.emit('message','welcome')
// });

const merchants = new Map();

io.on("connection", (socket) => {
  const { merchantId, branchId } = socket.handshake.query;

  if (!merchantId || isNaN(merchantId)) {
    return socket.disconnect();
  }

  const socketList = merchants.get(+merchantId) || new SocketList();
  socketList.addClient(socket, branchId);
  merchants.set(+merchantId, socketList);

  socket.on("disconnect", () => {
    socketList.removeClient(socket, branchId);

    if (socketList.empty()) merchants.delete(+merchantId);
    else merchants.set(+merchantId, socketList);

    console.log(`Socket disconnected: ${socket.id}`);
    console.log(merchants);
  });
});

app.get("/", (req, res) => {
  res.sendFile(join(cwd(), "index.html"));
});

server.listen(port, () => {
  console.log("listening...");
});
