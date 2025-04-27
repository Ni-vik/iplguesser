import axios from 'axios';

const API_URL = 'http://localhost:5000/api/players'; // backend base url

export const getRandomPlayer = async () => {
  const { data } = await axios.get(`${API_URL}/random`);
  return data;
};

export const checkPlayerGuess = async (playerId, guess) => {
  const { data } = await axios.post(`${API_URL}/guess`, { playerId, guess });
  return data;
};
