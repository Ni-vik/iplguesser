import axios from 'axios';

const API_URL = 'https://iplguesser.onrender.com/api/players'; 

export const getRandomPlayer = async () => {
  const { data } = await axios.get(`${API_URL}/random`);
  return data;
};

export const checkPlayerGuess = async (playerId, guess) => {
  const { data } = await axios.post(`${API_URL}/guess`, { playerId, guess });
  return data;
};

export const getHint = async (p_name) => {
  const { data } = await axios.post(`${API_URL}/hint`,{p_name});
  return data;
}
