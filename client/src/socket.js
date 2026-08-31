// src/socket.js
import { io } from "socket.io-client";

// Replace with your backend URL
export const socket = io("http://localhost:8000", {
  autoConnect: true,    // Auto-connect when imported
  withCredentials: true // For sessions/cookies
});