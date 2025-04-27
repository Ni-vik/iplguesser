import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  playerName: { type: String, required: true },
  career: { type: Map, of: String },
});

const Player = mongoose.model('Player', playerSchema);
export default Player;
