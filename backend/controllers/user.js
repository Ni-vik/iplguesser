import {Score} from "../models/Player.js"; // make sure this path is correct

export const registerUser = async (req, res) => {
  const { deviceId, name } = req.body;
  try {
    const nameExists = await Score.findOne({ name });
    if (nameExists) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const newUser = new Score({
      deviceId,
      name,
      highScore: 0,
      lastUpdated: new Date()
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered', user: newUser });
  } catch (err) {
  console.error('Register User Error:', err);
  res.status(500).json({ error: 'Server error' });
}

};

export const checkDevice = async (req, res) => {
  const { deviceId } = req.query;
  try {
    const existingUser = await Score.findOne({ deviceId });
    if (existingUser) {
      return res.status(200).json({ exists: true, user: existingUser });
    }
    res.status(200).json({ exists: false });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
