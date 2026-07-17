"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import LobbyScreen from "@/components/game/create-room";
import PlayScreen from "@/components/game/play-screen";
import { GameRoom, DrawingPath } from "@/server/types";
import { socket } from "@/lib/socket";

interface RoomPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.roomId;

  const router = useRouter();

  // Create room state synced from socket events
  const [room, setRoom] = useState<GameRoom | null>(null);

  // Keep track of player's actual socket identity
  const [myPlayerId, setMyPlayerId] = useState<string>("my-player-id");

  const [username, setUsername] = useState<string>("Guest Doodler");
  const [avatar, setAvatar] = useState<string>("🦊");

  useEffect(() => {
    // Read user config securely from sessionStorage
    const storedUsername = sessionStorage.getItem("scribbl_username");
    const storedAvatar = sessionStorage.getItem("scribbl_avatar");

    let finalUsername = storedUsername || "";
    let finalAvatar = storedAvatar || "🦊";

    if (!finalUsername.trim()) {
      const promptedName = prompt("Enter your username to join the room:") || "Guest Doodler";
      finalUsername = promptedName.trim();
      sessionStorage.setItem("scribbl_username", finalUsername);
      sessionStorage.setItem("scribbl_avatar", finalAvatar);
    }

    setUsername(finalUsername);
    setAvatar(finalAvatar);

    // Make sure socket is connected
    if (!socket.connected) {
      socket.connect();
    }

    // Set connection ID
    if (socket.id) {
      setMyPlayerId(socket.id);
    }

    // Connect socket handlers
    socket.emit("join-room", { roomId, username: finalUsername, avatar: finalAvatar });

    socket.on("room-updated", (updatedRoom: GameRoom) => {
      console.log("Room Updated from Socket Server:", updatedRoom);
      setRoom(updatedRoom);
    });

    socket.on("path-drawn", (path: DrawingPath) => {
      setRoom((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          canvasPaths: [...prev.canvasPaths, path],
        };
      });
    });

    socket.on("error", (msg) => {
      console.error("Room Socket Error:", msg);
      alert(msg);
      router.push("/");
    });

    // Listen for socket connection details changes
    const onConnect = () => {
      if (socket.id) {
        setMyPlayerId(socket.id);
      }
    };
    socket.on("connect", onConnect);

    return () => {
      socket.off("room-updated");
      socket.off("path-drawn");
      socket.off("error");
      socket.off("connect", onConnect);
      socket.emit("leave-room", { roomId });
    };
  }, [roomId]);

  const handleUpdateSettings = (settings: {
    rounds: number;
    drawTime: number;
    wordPack: string;
  }) => {
    console.log("Sending settings change:", settings);
    socket.emit("update-settings", { roomId, settings });
  };

  const handleStartGame = () => {
    console.log("Sending start-game trigger to server...");
    socket.emit("start-game", { roomId });
  };

  const handleLeaveRoom = () => {
    socket.emit("leave-room", { roomId });
    router.push("/");
  };

  const handleDrawPath = (path: DrawingPath) => {
    // Optimistic local draw to reduce visual lag
    setRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        canvasPaths: [...prev.canvasPaths, path],
      };
    });
    socket.emit("draw-path", { roomId, path });
  };

  const handleUndo = () => {
    socket.emit("undo-draw", { roomId });
  };

  const handleClear = () => {
    socket.emit("clear-canvas", { roomId });
  };

  const handleSendMessage = (text: string) => {
    socket.emit("send-message", { roomId, text });
  };

  const handleChooseWord = (word: string) => {
    console.log("Sending choose-word trigger:", word);
    socket.emit("choose-word", { roomId, word });
  };

  if (!room) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eff6ff] font-sans">
        <div className="text-xl font-bold uppercase animate-pulse text-black">
          Loading Lobby Room: {roomId}...
        </div>
      </div>
    );
  }

  // Renders either Lobby configuration screen or active sketching arena
  if (room.currentRoundState === "LOBBY") {
    return (
      <LobbyScreen
        room={room}
        myPlayerId={myPlayerId}
        onUpdateSettings={handleUpdateSettings}
        onStartGame={handleStartGame}
        onLeaveRoom={handleLeaveRoom}
      />
    );
  }

  return (
    <PlayScreen
      room={room}
      myPlayerId={myPlayerId}
      onDrawPath={handleDrawPath}
      onUndo={handleUndo}
      onClear={handleClear}
      onSendMessage={handleSendMessage}
      onChooseWord={handleChooseWord}
      onLeaveRoom={handleLeaveRoom}
    />
  );
}
