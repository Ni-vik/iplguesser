import Player from '../models/Player.js';

export const getRandomPlayer = async (req, res) => {
  try {
    const count = await Player.countDocuments();
    const random = Math.floor(Math.random() * count);
    const player = await Player.findOne().skip(random);

    if (player) {
      res.json({
        _id: player._id,
        name : player.playerName,
        career: Object.fromEntries(player.career),
      });
    } else {
      res.status(404).json({ message: 'Player not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkGuess = async (req, res) => {
  const { playerId, guess } = req.body;

  try {
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    if (player.playerName.toLowerCase() === guess.toLowerCase()) {
      res.json({ correct: true });
    } else {
      res.json({ correct: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
