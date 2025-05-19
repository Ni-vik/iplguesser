import React, { useState, useEffect } from 'react';
import { createRoom, joinRoom, startGame } from '../api/roomApi';
import GameRoom from './roomGame';
import { fetchRoomScoreboard } from '../api/roomApi';
import { useNavigate } from 'react-router-dom';

export default function Room() {
  // Core state
  const [mode, setMode] = useState('create');
  const [roomName, setRoomName] = useState('');
  const [playersPerRound, setPlayersPerRound] = useState('');
  const [maxUsers, setMaxUsers] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [roomIdToJoin, setRoomIdToJoin] = useState('');
  const [roomDetails, setRoomDetails] = useState(null);
  const [error, setError] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [showGameRoom, setShowGameRoom] = useState(false);
  const [showLeaderBoard, setShowLeaderboard] = useState(false);
  const [leaderboardRoomKey, setLeaderboardRoomKey] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);

  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    if (!localStorage.getItem("username")) {
      navigate("/");
    }
  }, [navigate]);

  // Handle countdown when game starts
  useEffect(() => {
    if (gameStarted && roomDetails) {
      setCountdown(5);
      setShowGameRoom(false);

      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
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

  const resetForm = () => {
    setRoomName('');
    setPlayersPerRound('');
    setMaxUsers('');
    setTimeLimit('');
    setDifficulty('easy');
    setRoomIdToJoin('');
  };

  const handleCreateRoom = async () => {
    try {
      const name = localStorage.getItem('username');
      const result = await createRoom(
        name, 
        roomName, 
        Number(playersPerRound), 
        Number(maxUsers), 
        Number(timeLimit), 
        difficulty
      );
      
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
      resetForm();
      setError('');
      setGameStarted(true);
      console.log("Room API response:", result);
    } catch (err) {
      setError(err.response?.data?.message || 'Joining room failed');
    }
  };

  const handleStart = async () => {
    try {
      const roomId = roomDetails?.roomId || JSON.parse(localStorage.getItem('roomdetails'))?.roomId;
      if (!roomId) {
        setError('Room ID not found to start the game');
        return;
      }

      const data = await startGame(roomId);
      console.log('Game started successfully');
      setError('');
      setGameStarted(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to start game');
    }
  };

  const handleShowLeaderboard = async (roomKey) => {
    if (!roomKey) {
      setError('Please enter a room key');
      return;
    }
    
    try {
      const data = await fetchRoomScoreboard(roomKey);
      setLeaderboard(data);
      setShowLeaderboard(true);
      setError('');
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setError('Failed to fetch leaderboard');
      setLeaderboard([]);
    }
  };

  // Rendering logic
  
  // 1. Game countdown screen
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

  // 2. Active game screen
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

  // 3. Leaderboard screen
  if (showLeaderBoard) {
    return (
      <div className="text-center mt-10">
        <div className="p-4 max-w-md mx-auto space-y-4">
          <h2 className="text-2xl font-bold text-center text-gray-800">Leaderboard</h2>
          {leaderboard.length > 0 ? (
            leaderboard.map((entry, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                <span>{entry.name}</span>
                <span className="text-blue-600 font-bold">{entry.score}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No scores available</p>
          )}
          <button 
            onClick={() => setShowLeaderboard(false)} 
            className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
          >
            Back to Room
          </button>
        </div>
      </div>
    );
  }

  // 4. Default room creation/join screen
  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">IPL Guesser Room</h1>
      <button
        onClick={() => navigate("/")}
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

      {/* Create Room Section */}
      {mode === 'create' && (
        <>
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
            onChange={(e) => setPlayersPerRound(e.target.value)}
          />

          <label className="block font-semibold">Max Users</label>
          <input
            type="number"
            min={1}
            placeholder="Max Users"
            className="w-full p-2 border rounded mb-2"
            value={maxUsers}
            onChange={(e) => setMaxUsers(e.target.value)}
          />

          <label className="block font-semibold">Time Limit (seconds)</label>
          <input
            type="number"
            min={1}
            placeholder="Time Limit (seconds)"
            className="w-full p-2 border rounded mb-2"
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)}
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
              disabled={!roomName || !playersPerRound || !maxUsers || !timeLimit}
            >
              Create Room
            </button>

            <button
              onClick={handleStart}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded"
              disabled={!roomDetails}
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
                disabled={!leaderboardRoomKey}
              >
                Show Leaderboard
              </button>
            </div>
          </div>
        </>
      )}

      {/* Room details display */}
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
            disabled={!roomIdToJoin}
          >
            Join Room
          </button>
        </>
      )}

      {/* Error message */}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
