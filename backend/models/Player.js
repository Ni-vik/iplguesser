import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  playerName: { type: String, required: true },
  career: { type: Map, of: String },
});

const playerRoleSchema = new mongoose.Schema({
  Player: { type: String, required: true },
  Nationality: { type: String, required: true },
  Role: { type: String, required: true },
});

const squadPlayerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const teamSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true
  },
  team: {
    type: String,
    required: true
  },
  players: {
    type: [squadPlayerSchema],
    default: []
  }
});

const scoreSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  name: { type: String, required: true }, // Random name
  highScore: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now },
});

// Correct: collection name as a string
export const Player = mongoose.model('Player', playerSchema, 'players');
export const PlayerRole = mongoose.model('PlayerRole', playerRoleSchema, 'roles');
export const squads = mongoose.model('Team', teamSchema , 'squads');
export const Score = mongoose.model('Score', scoreSchema, 'leaderboard');
