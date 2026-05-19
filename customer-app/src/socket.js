import { io } from "socket.io-client";

const socket = io("http://10.0.0.99:5000");

export default socket;