import axios from "axios";

const API_URL = 'https://iplguesser.onrender.com/api/players';

export const createRoom = async (userName, roomName, maxPlayers, maxUser, timeLimit, difficulty) => {
  const { data } = await axios.post(`${API_URL}/createroom`, {
    userName,
    roomName,
    maxPlayers,
    maxUser,
    timeLimit,
    difficulty
  });
  return data;
};

export const joinRoom = async (name, roomid) => {
  const key = `?roomid=${encodeURIComponent(roomid)}`;
  const { data } = await axios.post(`${API_URL}/joinroom${key}`, { name });
  return data;
};

export const startGame = async (roomid)=> {
  const { data } = await axios.post(`${API_URL}/startgame`,{roomid});
  return data;
}

export const getPlayer = async (roomId, index) => {
  const { data } = await axios.get(`${API_URL}/${roomId}/player/${index}`);
  return data;
};

export const submitScoreRoom = async (roomId, playerName, score) => {
  const { data } = await axios.post(`${API_URL}/submitscore`, {
    roomId,
    playerName,
    score,
  });
  return data;
};
export const fetchRoomScoreboard = async (roomId) => {
  const { data } = await axios.get(`${API_URL}/${roomId}/scoreboard`);
  return data;
};
