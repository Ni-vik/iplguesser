import { Player, PlayerRole , squads } from '../models/Player.js';

export const getRandomPlayer = async (req, res) => {
  try {
    const count = await Player.countDocuments();
    const random = Math.floor(Math.random() * count);
    const player = await Player.findOne().skip(random);

    if (player) {
      res.json({
        _id: player._id,
        name: player.playerName,
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

export const getHint = async (req, res) => {
  const { p_name } = req.body;

  try {
    const playerData = await PlayerRole.findOne({ Player: p_name });

    if (!playerData) {
      return res.status(404).json({ message: 'Player not found' });
    }

    res.json({
      Player: playerData.Player,
      Nationality: playerData.Nationality,
      Role: playerData.Role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getSquad = async (req, res) => {
  console.log('Request body:', req.body);

  const { team, year } = req.body;
  console.log(`Querying squad with team: ${team}, year: ${year}`);

  try {
    const squadData = await squads.find({ team, year });
    console.log('Squad data retrieved:', squadData);

    if (!squadData || squadData.length === 0) {
      console.log('No squad data found');
      return res.status(404).json({ message: 'Squad not found' });
    }

    //console.log('Sending squad players:', squadData[0].players);
    res.json(squadData[0].players);
  } catch (error) {
    console.error('Error retrieving squad:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

