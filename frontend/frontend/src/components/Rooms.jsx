import React, { useState } from 'react';
import { createRoom, joinRoom , startGame } from '../api/roomApi';
import GameRoom from './roomGame';
import { useEffect } from 'react';
import { fetchRoomScoreboard } from '../api/roomApi';
import { useNavigate } from 'react-router-dom';


export default function RoomComponent() {
  const [mode, setMode] = useState('create');
  const [userName, setUserName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [playersPerRound, setPlayersPerRound] = useState();
  const [maxUsers, setMaxUsers] = useState();
  const [timeLimit, setTimeLimit] = useState();
  const [difficulty, setDifficulty] = useState('easy');
  const [roomIdToJoin, setRoomIdToJoin] = useState('');
  const [roomDetails, setRoomDetails] = useState(null);
  const [error, setError] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [showGameRoom, setShowGameRoom] = useState(false);
  const [showLeaderBoard,setShowLeaderboard] = useState(false);
  const [leaderboardRoomKey,setLeaderboardRoomKey] = useState('');

  const navigate = useNavigate();
  useEffect(() => {
      if (gameStarted && roomDetails) {
        setCountdown(5);
        setShowGameRoom(false);

        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev === 1) {
              clearInterval(timer);
              setShowGameRoom(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer); // Cleanup
      }
    }, [gameStarted, roomDetails]);


  if (gameStarted && roomDetails && !showGameRoom) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white animate-fade-in">
        <p className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 animate-slide-down">
          🚀 Game starts in...
        </p>
        <p className="text-7xl sm:text-8xl md:text-9xl font-extrabold animate-bounce text-shadow-lg">
          {countdown}
        </p>
      </div>
    );
  }


  const resetForm = () => {
    setUserName('');
    setRoomName('');
    setPlayersPerRound();
    setMaxUsers();
    setTimeLimit();
    setDifficulty('easy');
    setRoomIdToJoin('');
  };
  let res ;
  let user_name;

  const handleCreateRoom = async () => {
    try {
      let name = localStorage.getItem('username')
      const result = await createRoom(name, roomName, playersPerRound, maxUsers, timeLimit, difficulty);
      setRoomDetails(result.room);
      setCurrentUserName(name);
      localStorage.setItem('roomdetails', JSON.stringify(result.room));
      resetForm();
      setError('');
      console.log("Room API response:", result);

    } catch (err) {
      setError(err.response?.data?.message || 'Room creation failed');
    }
  };

  const handleJoinRoom = async () => {
      try {
        const result = await joinRoom(localStorage.getItem('username'), roomIdToJoin);
        setRoomDetails(result.room);
      setCurrentUserName(localStorage.getItem('username'));
        // localStorage.setItem('roomdetails', JSON.stringify(result.room));
        resetForm();
        setError('');
        setGameStarted(true);
        console.log("Room API response:", result);

      } catch (err) {
        setError(err.response?.data?.message || 'Joining room failed');
      }
    };

  const handlestart = async () => {
    try {
      const roomId = roomDetails?.roomId || JSON.parse(localStorage.getItem('roomdetails'))?.roomId;
      if (!roomId) {
        setError('Room ID not found to start the game');
        return;
      }

      const data = await startGame(roomId);
      console.log('Game started successfully');
      setError('');
      setGameStarted(true); // <- this triggers your game UI
      // setGameData(data);    // optionally store returned puzzle/timeLimit
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to start game');
    }
  };

  if (gameStarted && roomDetails && showGameRoom) {
    return (
      <>
        <div className="p-4 border rounded bg-blue-100 shadow-md my-4">
          <h2 className="text-xl font-bold text-blue-700 mb-2">Game in Progress</h2>
          <p><span className="font-semibold">Room Name:</span> {roomDetails.roomName}</p>
          <p><span className="font-semibold">Room ID:</span> {roomDetails.roomId}</p>
        </div>
        <GameRoom
          maxPlayersPerRound={roomDetails.playersPerRound}
          timeLimit={roomDetails.timeLimit}
          roomId={roomDetails.roomId}
          user_name={currentUserName}
        />
      </>
    );
  }

  const [leaderboard, setLeaderboard] = useState([]);
  const handleShowLeaderboard = async (leaderboardRoomKey) => {
    try {
      const data = await fetchRoomScoreboard(leaderboardRoomKey); // Awaiting async function
      setLeaderboard(data); // Set state correctly
      setShowLeaderboard(true);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setLeaderboard([]);
    }
  };

  if (showLeaderBoard) return (
    <div className="text-center mt-10">
        <div className="p-4 max-w-md mx-auto space-y-4">
          <h2 className="text-2xl font-bold text-center text-gray-800">Leaderboard</h2>
          {leaderboard.map((entry, index) => (
            <div
            key={index}
            className="flex justify-between items-center p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
            <span>{entry.name}</span>
            <span className="text-blue-600 font-bold">{entry.score}</span>
            </div>
          ))}
        <button onClick={() => setShowLeaderboard(false)} className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition">
        Back to Room</button>
        </div>
          

    </div>
    );

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">IPL Guesser Room</h1>
      <button
  onClick={() => {
    navigate("/");
  }}
  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 ease-in-out"
>
  Home
</button>


      {/* Mode Toggle */}
      <div className="flex justify-center gap-4">
        <button
          className={`px-4 py-2 rounded ${mode === 'create' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setMode('create')}
        >
          Create Room
        </button>
        <button
          className={`px-4 py-2 rounded ${mode === 'join' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setMode('join')}
        >
          Join Room
        </button>
      </div>

      {/* Shared: User Name */}
  

      {/* Create Room Section */}
      {mode === 'create' && (
  <>
    {/* <label className="block font-semibold">Your Name</label>
    <input
      type="text"
      placeholder="Your Name"
      className="w-full p-2 border rounded mb-2"
      value={userName}
      onChange={(e) => setUserName(e.target.value)}
    /> */}

    <label className="block font-semibold">Room Name</label>
    <input
      type="text"
      placeholder="Room Name"
      className="w-full p-2 border rounded mb-2"
      value={roomName}
      onChange={(e) => setRoomName(e.target.value)}
    />

    <label className="block font-semibold">Players per Round</label>
    <input
      type="number"
      min={1}
      placeholder="Players per Round"
      className="w-full p-2 border rounded mb-2"
      value={playersPerRound}
      onChange={(e) => setPlayersPerRound(Number(e.target.value))}
    />

    <label className="block font-semibold">Max Users</label>
    <input
      type="number"
      min={1}
      placeholder="Max Users"
      className="w-full p-2 border rounded mb-2"
      value={maxUsers}
      onChange={(e) => setMaxUsers(Number(e.target.value))}
    />

    <label className="block font-semibold">Time Limit (seconds)</label>
    <input
      type="number"
      min={1}
      placeholder="Time Limit (seconds)"
      className="w-full p-2 border rounded mb-2"
      value={timeLimit}
      onChange={(e) => setTimeLimit(Number(e.target.value))}
    />

    <label className="block font-semibold">Difficulty</label>
    <select
      className="w-full p-2 border rounded mb-4"
      value={difficulty}
      onChange={(e) => setDifficulty(e.target.value)}
    >
      <option value="easy">Easy</option>
      <option value="medium">Medium</option>
      <option value="difficult">Hard</option>
    </select>

    <div className="flex space-x-4">
    <button
      onClick={handleCreateRoom}
      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded"
    >
      Create Room
    </button>

    <button
      onClick={handlestart}
      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded"
    >
      Start Game
    </button>
</div>
    <div className="mt-4">
      <label htmlFor="roomKey" className="block text-sm font-medium text-gray-700 mb-1">
        Enter Room Key
      </label>
      <div className="flex space-x-2">
        <input
          id="roomKey"
          type="text"
          value={leaderboardRoomKey}
          onChange={(e) => setLeaderboardRoomKey(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded"
          placeholder="Room Key"
        />
        
        <button
      onClick={() => handleShowLeaderboard(leaderboardRoomKey)}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
    >
      Show Leaderboard
    </button>
      </div>
    </div>

  </>
)}
{roomDetails && !gameStarted && (
  <div className="bg-white border-2 border-blue-500 rounded-lg p-6 shadow-lg max-w-md mx-auto my-6">
    <h2 className="text-2xl font-bold text-blue-700 mb-4">🎮 Room Created</h2>
    
    <div className="mb-2">
      <span className="font-semibold text-gray-700">Room Name: </span>
      <span className="text-gray-900">{roomDetails.roomName}</span>
    </div>

    <div className="relative group">
      <span className="font-semibold text-gray-700">Room ID: </span>
      <span
        className="text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
        onClick={() => {
          navigator.clipboard.writeText(roomDetails.roomId);
        }}
      >
        {roomDetails.roomId}
      </span>

      <div className="absolute top-full left-0 bg-gray-800 text-white text-sm px-2 py-1 rounded mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        Click to copy 🔑
      </div>
    </div>
  </div>
)}
      {/* Join Room Section */}
      {mode === 'join' && (
        <>
          <input
            type="text"
            placeholder="Room ID to Join"
            className="w-full p-2 border rounded"
            value={roomIdToJoin}
            onChange={(e) => setRoomIdToJoin(e.target.value)}
          />
          <button
            onClick={handleJoinRoom}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
          >
            Join Room
          </button>
        </>
      )}

      {error && <p className="text-red-500">{error}</p>} 

    


    </div>
  );
}
