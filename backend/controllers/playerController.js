import { Player, PlayerRole , squads , Score } from '../models/Player.js';
import { generateRandomName } from '../utils/generateName.js';
export const getRandomPlayer = async (req, res) => {
  try {
    const { difficulty } = req.query;

    const filter = difficulty ? { difficulty } : {};
    const count = await Player.countDocuments(filter); // use the correct filter here

    if (count === 0) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const random = Math.floor(Math.random() * count);
    const player = await Player.findOne(filter).skip(random);

    if (player) {
      res.json({
        _id: player._id,
        career: player.career ? Object.fromEntries(player.career) : undefined,
        years: player.nonNAYearsCount,
        difficulty: player.difficulty,
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
    const someplayer = await Player.findById(p_name);
    const playerData = await PlayerRole.findOne({ Player: someplayer.playerName });

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

  export const leaderBoardUpdate = async (req, res) => {
  const { deviceId, score } = req.body;
  if (!deviceId || score == null) return res.status(400).json({ error: "Invalid data" });

  try {
    let existing = await Score.findOne({ deviceId });

    if (existing) {
      if (score > existing.highScore) {
        existing.highScore = score;
        existing.lastUpdated = new Date();
        await existing.save();
      }
      console.log("Score updated");
      return res.json({ message: "Score updated", name: existing.name });
    } else {
      const name = generateRandomName();
      const newEntry = await Score.create({ deviceId, highScore: score, name });  // This should work now
      return res.json({ message: "New user added", name: newEntry.name });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const topScoreGenerator = async (req, res) => {
  try {
    const topScores = await Score.find().sort({ highScore: -1 }).limit(10);  // Use Score instead of score
    res.json(topScores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateScore = async (req, res) => {
  const { name, highScore } = req.body;

  try {
    await Score.updateOne(
      { name: name },
      {
        $set: {
          highScore: highScore,
          lastUpdated: Date.now()
        }
      }
    );
    res.status(200).json({ message: "Score updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update score", details: err.message });
  }
};


export const getScore = async (req, res) => {
  const { deviceId } = req.body;

  try {
    const data = await Score.findOne({ deviceId });

    if (!data) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("You have some error:", err);
    res.status(500).json({ error: "Failed to retrieve score", details: err.message });
  }
};

