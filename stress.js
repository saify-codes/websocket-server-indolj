import { io } from "socket.io-client";

const URL = process.env.URL || "http://localhost:3000";
const MAX_CLIENTS = 20_000;
const CLIENT_CREATION_INTERVAL_IN_MS = 1;

let clientCount = 0;
let lastReport = new Date().getTime();
let packetsSinceLastReport = 0;

const createClient = () => {
  // for demonstration purposes, some clients stay stuck in HTTP long-polling
  const transports = ["websocket"];

  const socket = io(URL, {
    transports,
  });


  // Add this listener to receive the 'stress-test' event from the server
  socket.on("broadcast", (data) => {
    console.log(socket.id, 'received stress-test event:', data);
    packetsSinceLastReport++;
  });

  socket.on("disconnect", (reason) => {
    console.log(`disconnect due to ${reason}`);
  });

  if (++clientCount < MAX_CLIENTS) {
    setTimeout(createClient, CLIENT_CREATION_INTERVAL_IN_MS);
  }
};

createClient();

const printReport = () => {
  const now = new Date().getTime();
  const durationSinceLastReport = (now - lastReport) / 1000;
  const packetsPerSeconds = (
    packetsSinceLastReport / durationSinceLastReport
  ).toFixed(2);

  console.log(`client count: ${clientCount} ; average packets received per second: ${packetsPerSeconds}`);

  packetsSinceLastReport = 0;
  lastReport = now;
};

setInterval(printReport, 5000);
