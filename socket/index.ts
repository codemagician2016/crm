import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;
const socket: Socket = io(SOCKET_URL, { autoConnect: false });

export default socket;