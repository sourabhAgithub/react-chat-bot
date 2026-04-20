import { WebSocketServer, WebSocket } from "ws";

const PORT = Number(process.env.PORT) || 3001;

const server = new WebSocketServer({ port: PORT });

server.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("message", (rawMessage) => {
    let parsedMessage;

    try {
      parsedMessage = JSON.parse(rawMessage.toString());
    } catch {
      return;
    }

    const hasValidShape =
      typeof parsedMessage.id === "string" &&
      typeof parsedMessage.text === "string" &&
      typeof parsedMessage.user === "string" &&
      typeof parsedMessage.timestamp === "number";

    if (!hasValidShape) {
      return;
    }

    const payload = JSON.stringify(parsedMessage);

    for (const client of server.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log(`WebSocket server running on ws://localhost:${PORT}`);
