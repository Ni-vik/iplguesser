import { Player } from '../models/Player.js';

export async function fetchRandomPlayer(difficulty) {
  const filter = difficulty ? { difficulty } : {};

  const count = await Player.countDocuments(filter);
  if (count === 0) throw new Error('No players found');

  const random = Math.floor(Math.random() * count);
  const player = await Player.findOne(filter).skip(random);

  if (!player) throw new Error('No player found');

  return player;
}
