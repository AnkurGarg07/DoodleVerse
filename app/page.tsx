"use client";
import React, { useEffect } from "react";
import LobbyContent from "@/components/game/lobby-content";
import { socket } from "@/lib/socket";
import PlayScreen from "@/components/game/play-screen";

export default function Home() {
  useEffect(() => {
    console.log("Homepage socket connection initializing...");
    socket.connect();

    const onConnect = () => {
      console.log("Homepage Socket connected successfully! ID:", socket.id);
    };

    const onDisconnect = () => {
      console.log("Homepage Socket disconnected.");
    };

    const onConnectError = (err: any) => {
      console.error("Homepage Socket connection error:", err);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, []);
  return (
    <div
      className="dot-grid-bg min-h-screen text-black flex flex-col font-sans select-none overflow-x-hidden"
      id="landing-screen-container"
    >
      <LobbyContent />
    </div>
  );
}
