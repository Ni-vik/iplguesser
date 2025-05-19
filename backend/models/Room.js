import mongoose from 'mongoose';

// You cannot use Player model as a schema type inside an array like this: playerOrder: [Player]
// Instead, define the schema for the playerOrder items manually:

const playerOrderSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  playerName: String,
  difficulty: String,
  career: { type: Map, of: String },
  nonNAYearsCount: Number,
}, { _id: false });  // don't generate _id for subdocs

const RoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  roomName: { type: String, required: true },

  host: {
    name: String
  },

  maxPlayersPerRound: { type: Number, default: 10 },
  difficulty: { type: String, default: null },
  timeLimit: { type: Number, default: 30 },
  maxUserPerRound: { type: Number, default: 10 },
  currentUsers: { type: Number, default: 0 },
  isLocked: { type: Boolean, default: false },
  isStarted : {type : Boolean , default:false},

  users: [
    {
      name: String,
      score: { type: Number, default: 0 },
      role: { type: String, enum: ['host', 'joinee'], default: 'joinee' }
    }
  ],

  playerOrder: [playerOrderSchema], // Array of embedded player info

  createdAt: { type: Date, default: Date.now }
});

export const Room = mongoose.model('Room', RoomSchema, 'rooms');
