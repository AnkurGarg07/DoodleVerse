# Scribbl Clone MVP - Product Requirements Document (PRD)

## Product Overview

A real-time multiplayer drawing and guessing game where players join a room, take turns drawing a randomly assigned word, and earn points by guessing the word correctly before the timer expires.

The goal is to create a fun, lightweight multiplayer experience that demonstrates real-time communication, room management, and game state synchronization.

---

# Product Goals

### Primary Goals

- Enable players to create and join private game rooms.
- Support real-time drawing synchronization.
- Allow players to guess words through chat.
- Maintain scoring and round progression.
- Provide a smooth multiplayer experience for up to 10 players per room.

### Success Criteria

- Players can join a room in under 10 seconds.
- Drawing updates appear in real-time.
- Guesses are validated instantly.
- Game progresses automatically through rounds.
- No page refreshes required during gameplay.

---

# Target Users

### Casual Players

Friends looking for a quick multiplayer game.

### Students

Groups playing online during events or meetups.

### Developers

Users exploring real-time multiplayer web applications.

---

# MVP Features

## 1. Room System

### Create Room

A player can create a room.

Generated room code:

```text
ABCD
```

### Join Room

A player enters a room code to join.

### Room Lobby

Display:

- Room code
- Player list
- Host indicator
- Start game button

---

## 2. Real-Time Drawing Canvas

### Drawing Features

- Freehand drawing
- Brush color selection
- Brush size selection
- Clear canvas

### Synchronization

Drawing actions are broadcast to all players in the room using Socket.IO.

---

## 3. Chat System

Players can send messages.

Chat is used for:

- Guessing words
- System announcements
- Round updates

Examples:

```text
Rahul joined the room
Round 2 started
Ankur guessed correctly
```

---

## 4. Word Selection

At the beginning of a round:

- Drawer receives 3 random words
- Drawer selects one word
- Selected word becomes the round word

Only the drawer can see the full word.

Other players see:

```text
_ _ _ _ _
```

---

## 5. Guess Validation

When a player submits a message:

```text
apple
```

System checks:

```text
message === currentWord
```

If correct:

- Player receives points
- Guessing disabled for that player
- System announces correct guess

---

## 6. Timer

Each round has a countdown timer.

Default:

```text
60 seconds
```

When timer reaches zero:

- Round ends
- Word is revealed
- Next player becomes drawer

---

## 7. Scoring System

### Guesser Points

Faster correct guesses earn more points.

Example:

```text
Correct Guess
100 points
```

### Drawer Points

Drawer receives points for each correct guess.

Example:

```text
50 points per correct guess
```

---

## 8. Leaderboard

Display:

```text
1. Rahul - 350
2. Ankur - 300
3. Priya - 200
```

Leaderboard updates in real-time.

---

## 9. Game Flow

### Lobby

Players join room.

↓

Host starts game.

↓

Drawer selected.

↓

Word selected.

↓

Drawing begins.

↓

Players guess.

↓

Timer expires or all players guess.

↓

Scores updated.

↓

Next round.

↓

Game ends after configured rounds.

---

# Non-Functional Requirements

## Performance

- Drawing latency below 200ms.
- Chat messages appear instantly.
- Support 5–10 players per room.

## Reliability

- Reconnect users automatically if connection drops briefly.
- Prevent duplicate room joins.

## Responsiveness

- Desktop-first design.
- Tablet support.
- Mobile support optional for MVP.

---

# Tech Stack

## Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

## Realtime

- Socket.IO

## Backend

- Node.js
- Socket.IO Server

## Deployment

- DigitalOcean Droplet
- PM2
- Nginx

---

# UI Theme

### Design Style

Neo-Brutalism

### Color Palette

Primary:

```text
#FFD93D
```

Secondary:

```text
#8B5CF6
```

Background:

```text
#FFF8E7
```

Text & Borders:

```text
#111111
```

### Visual Principles

- Thick black borders
- Playful shadows
- Large buttons
- Rounded corners
- Bright and friendly appearance

---

# Out of Scope (Future Versions)

- Authentication
- User profiles
- Friend system
- Public matchmaking
- Voice chat
- Persistent game history
- Rankings
- Spectator mode
- Mobile application
- Redis scaling
- Database storage

---

# MVP Deliverables

✅ Create Room

✅ Join Room

✅ Real-Time Drawing

✅ Chat System

✅ Word Selection

✅ Guess Validation

✅ Timer

✅ Scoreboard

✅ Multi-Round Gameplay

✅ Neo-Brutalist UI
