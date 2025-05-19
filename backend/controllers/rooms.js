import { fetchRandomPlayer } from '../utils/playerUtils.js';
import { Room } from '../models/Room.js';
import { v4 as uuidv4 } from 'uuid';
import { Player} from '../models/Player.js';
function generateRandomId() {
  return uuidv4();
}

// Create Room
export const createRoom = async (req, res) => {
  const { userName, roomName, maxPlayers, maxUser, timeLimit, difficulty } = req.body;
  const hostname = userName || 'unknown';

  try {
    const randomPlayersSet = new Set();
    while (randomPlayersSet.size < maxPlayers) {
      try {
        const player = await fetchRandomPlayer(difficulty);
        randomPlayersSet.add(JSON.stringify({
          _id: player._id,
          playerName: player.playerName,
          difficulty: player.difficulty,
          career: player.career,
          nonNAYearsCount: player.nonNAYearsCount
        }));
      } catch (err) {
        break;
      }
    }

    const randomPlayers = Array.from(randomPlayersSet).map(str => JSON.parse(str));

    const newRoom = new Room({
      roomId: generateRandomId(),
      roomName,
      host: { name: hostname },
      maxPlayersPerRound: maxPlayers,
      difficulty,
      maxUserPerRound: maxUser,
      currentUsers: 1,
      isLocked: false,
      users: [{ name: hostname, score: 0, role: 'host' }],
      playerOrder: randomPlayers,
      timeLimit,
    });

    await newRoom.save();
    res.status(201).json({ message: 'Room created', room: newRoom });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Join Room
export const joinroom = async (req, res) => {
  try {
    const { name } = req.body;
    const { roomid } = req.query;

    const room = await Room.findOne({ roomId: roomid });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.users.some(user => user.name === name)) {
      return res.status(400).json({ message: 'User already joined' });
    }

    if (room.isLocked || room.currentUsers >= room.maxPlayersPerRound) {
      return res.status(403).json({ message: 'Room is full or locked' });
    }

    room.users.push({ name, score: 0, role: 'joinee' });
    room.currentUsers += 1;

    // Lock the room if full
    if (room.currentUsers >= room.maxPlayersPerRound) {
      room.isLocked = true;
    }

    await room.save();

    return res.status(200).json({ message: 'Joined room', room });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Start Game
export const startGame = async (req, res) => {
  try {
    const { roomid } = req.body;

    const room = await Room.findOne({ roomId: roomid });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.isStarted) return res.status(400).json({ message: 'Game already started' });

    room.isStarted = true;
    await room.save();

    return res.status(200).json({
      message: 'Game started',
      timeLimit: room.timeLimit,
      playerOrder: room.playerOrder,
    });
  } catch (err) {
    console.error('Start Game Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};




export const getplayer = async (req, res) => {
  const { roomId, index } = req.params;

  try {
    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const idx = parseInt(index);
    const playerOrder = room.playerOrder;

    if (idx < 0 || idx >= playerOrder.length) {
      return res.status(400).json({ message: 'Invalid index' });
    }

    const player = playerOrder[idx];

    res.json({
      _id: player._id,
      name: player.playerName,
      career: player.career,
      years: player.nonNAYearsCount,
      difficulty: player.difficulty,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const submitRoomScore = async (req, res) => {
  const { roomId, playerName, score } = req.body;

  if (!roomId || !playerName || score == null)
    return res.status(400).json({ error: "Invalid data" });

  try {
    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const player = room.users.find(user => user.name === playerName);

    if (!player) {
      return res.status(404).json({ error: "Player not found in room" });
    }

    // Update score
    player.score = score;

    await room.save();
    return res.json({ message: "Score updated successfully", player: player.name, score: player.score });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRoomScoreboard = async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const scoreboard = room.users
      .map(user => ({
        name: user.name,
        score: user.score,
        role: user.role
      }))
      .sort((a, b) => b.score - a.score); // Highest score first

    res.json(scoreboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};