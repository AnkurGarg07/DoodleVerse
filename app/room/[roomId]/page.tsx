import React from "react";

interface RoomPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { roomId } = await params;
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
      <div className="neo-card p-8 bg-white max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4 font-lilita text-black">Room: {roomId}</h1>
        <p className="text-zinc-600 font-medium font-fredoka">This is the game lobby and canvas area placeholder.</p>
      </div>
    </div>
  );
}
