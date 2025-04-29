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


// Correct: collection name as a string
export const Player = mongoose.model('Player', playerSchema, 'players');
export const PlayerRole = mongoose.model('PlayerRole', playerRoleSchema, 'roles');
