import { io } from "socket.io-client";

const socket = io("http://10.0.0.99:5000", {
  transports: ["websocket"],
  autoConnect: false,
});

export default socket;