import { useEffect, useState } from 'react';
import { getRandomPlayer, checkPlayerGuess, getHint, leaderBoardUpdate, getLeaderBoard } from '../api/playerApi';
import Autosuggest from 'react-autosuggest';
import LogoCard from './LogoCard';
import GuessInput from './GuessInput';
import playerNames from '../players/players.json';
import confetti from 'canvas-confetti';
import { useRef } from 'react';
//import { ChevronLeft, ChevronRight } from "lucide-react";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";

function launchConfetti() {
  confetti({
    particleCount: 150,
    spread: 90,
    origin: { y: 0.6 },
  });
}

let deviceId = localStorage.getItem("deviceId");
if (!deviceId) {
  deviceId = crypto.randomUUID();
  localStorage.setItem("deviceId", deviceId);
}
console.log(deviceId);

const Game = () => {
  const bottomRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [player, setPlayer] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [guess, setGuess] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [showNextButton, setShowNextButton] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(true);
  const [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState([]); 
  const [streak, setStreak] = useState(0);
  const [nationality, setNationality] = useState('');
  const [role, setRole] = useState('');
  const [hintButton, setHintButton] = useState(false);
  const [hintCount, setHintCount] = useState(0); // 0: no hints, 1: nationality, 2: both
  const [hintData, setHintData] = useState({ Nationality: '', Role: '' });
  const [attemptsmade, setAttemptsmade] = useState(0);
  const [points, setPoints] = useState(0);
  const [selectedCardKey, setSelectedCardKey] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const [isTimed, setIsTimed] = useState(false); // true = timed mode
  const [difficulty, setDifficulty] = useState('random');
  const [showDifficultySelector, setShowDifficultySelector] = useState(false);

  const fetchNewPlayer = async () => {
    // Use the current difficulty state when fetching new player
    const query = difficulty === 'random' ? undefined : difficulty;
    let playerdata = null;

    try {
      console.log("Difficulty is : ",query);
      playerdata = await getRandomPlayer(query);
    } catch (error) {
      console.error(error);
      setPlayer(null);
      return; // exit if failed
    }
    console.log("Difficulty is : ",query);

    setPlayer(playerdata);  
    setGuess('');
    setAttemptsLeft(3);
    setMessage('');
    setShowNextButton(false);
    setShowSkipButton(true); 
    setHintCount(0);
    setHintButton(false);
    setNationality('');
    setRole('');
    setHintData({ Nationality: '', Role: '' });
    setAttemptsmade(0);
    setSelectedCardKey(null);
    console.log(playerdata);
    fetchLeaderboard();
  };

  let deviceIdentity = localStorage.getItem("deviceId");
  if (!deviceIdentity) {
    deviceIdentity = crypto.randomUUID();
    localStorage.setItem("deviceId", deviceIdentity);
  }
  console.log(deviceId);

  // Correct async function definition
  async function submitScore(deviceId, streak) {
    try {
      await leaderBoardUpdate(deviceId, streak);  // Awaiting async function
      console.log("Score submitted successfully.");
    } catch (error) {
      console.error("Error submitting score:", error);
    }
  }

  const [leaderboard, setLeaderboard] = useState([]);

  async function fetchLeaderboard() {
    try {
      const data = await getLeaderBoard();  // Awaiting async function
      console.log("Leaderboard data:", data);
      setLeaderboard(data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setLeaderboard([]);
    }
  }

  useEffect(() => {
    fetchLeaderboard();
    fetchNewPlayer();
  }, []);

  useEffect(() => {
    if (!player || !isTimed) return;

    const timeOverTimer = setTimeout(() => {
      setMessage('😔 Time over! Correct answer was: ' + player.name);

      const nextPlayerTimer = setTimeout(() => {
        fetchNewPlayer();
      }, 5000);

      return () => clearTimeout(nextPlayerTimer);
    }, 30000);

    return () => clearTimeout(timeOverTimer);
  }, [player, isTimed]);

  useEffect(() => {
    if (!player || !isTimed) return;

    setCountdown(30);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000); // should be 1000ms for 1-second countdown

    return () => clearInterval(interval);
  }, [player, isTimed]);

  const handleGuess = async () => {
    if (!guess.trim()) return;
    setAttemptsmade(attemptsmade + 1);

    const data = await checkPlayerGuess(player._id, guess);
    
    if (data.correct) {
      launchConfetti();
      setMessage('🎯 Correct! Moving to next player...');
      const newStreak = streak + 1;
      setStreak(newStreak);
      submitScore(deviceId, newStreak);

      fetchLeaderboard();
      setTimeout(fetchNewPlayer, 2000);

      if(attemptsmade == 0){
        setPoints(points + 10);
      }
      if(attemptsmade==1){
        setPoints(points + 7)
      }
      if(attemptsmade==2){
        setPoints(points+5);
      }
    } else {
      if (attemptsLeft > 1) {
        setAttemptsmade(attemptsmade+1);
        setAttemptsLeft(attemptsLeft - 1);
        setMessage(`❌ Incorrect! Attempts left: ${attemptsLeft - 1}`);
        
        // Enable hint button after first incorrect guess
        if (hintCount < 2) {
          setHintButton(true);
        }
      } else {
        setMessage('😔 Chances over! Correct answer was: ' + player.name);
        setShowSkipButton(false);
        setShowNextButton(true);
        submitScore(deviceId,streak);
        setStreak(0);
        setAttemptsmade(0);
        setHintButton(false);
        setPoints(0);
      }
    }
    setGuess('');
  };

  const handleHint = async () => {
    const data = await getHint(player.name);
    
    // First hint shows nationality
    if (hintCount === 0) {
      setNationality(data.Nationality);
      setHintData(prev => ({ ...prev, Nationality: data.Nationality }));
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setHintCount(1);
    }
    // Second hint shows role
    else if (hintCount === 1 && attemptsmade > 1) {
      setRole(data.Role);
      setHintData(prev => ({ ...prev, Role: data.Role }));
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setHintCount(2);
    }
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    const filteredNames = playerNames.filter(name =>
      name.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filteredNames.slice(0, 5));  // Slice to get top 5 suggestions
  };

  const onSuggestionSelected = (event, { suggestion }) => {
    setGuess(suggestion); // Set the selected suggestion as the guess
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const inputProps = {
    placeholder: 'Type player name...',
    value: guess,
    onChange: (event, { newValue }) => setGuess(newValue),
    className:
    'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5',
  };

  const handleNextPlayer = () => {
    fetchNewPlayer();
    fetchLeaderboard();
  };

  // Function to handle difficulty change
  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
  };

  // Function to apply difficulty and fetch a new player
  const applyDifficultyAndFetch = () => {
    fetchNewPlayer();
    setShowDifficultySelector(false);
  };

  if (!player) return <div className="text-center mt-10">Loading...</div>;

  const sortedYears = Object.keys(player.career).sort((a, b) => a - b);

  function showAnswer(){
    setMessage("The correct player was: " + player.name);
    setTimeout(fetchNewPlayer, 2000);
    submitScore(deviceId,streak);
    setStreak(0);
  }

  return (  
    <>
    {showInstructions && (
      <div className="fixed inset-0 z-50 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 w-full h-full flex flex-col items-center justify-center">
        <div className="bg-yellow-50 rounded shadow-md p-6 max-w-xl relative">
          <p className="font-bold text-lg mb-2">How to Play</p>
          <p className="mb-4">
            Guess the player based on the teams they played for each year. You have 3 chances and optional hints. Each hint unlocks after a guess and after 2nd hint, you can click on any team to view the squad but only for one team.
            Click "Skip" if you're stuck.
          </p>
          <button
            onClick={() => setShowInstructions(false)}
            className="absolute top-2 right-2 text-yellow-700 hover:text-yellow-900 text-xl"
          >
            &times;
          </button>
          <div className="flex justify-center">
            <img
              src="/logos/intro.png" // Replace with your image path
              alt="Instructions Guide"
              className="w-full max-w-xs rounded-md border border-yellow-400 shadow"
            />
          </div>
        </div>
      </div>
    )}

    <div className={`${showInstructions ? 'blur-sm pointer-events-none select-none' : ''}`}>
      {/* Your main game content here */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-10">
      
        <h2 className="text-2xl font-bold mb-2 text-green-700 font-mono text-center">
          🔥 Max Streak: <span className="text-black">{streak}</span>
        </h2>

        <h3 className="text-xl font-semibold text-purple-700 font-serif mb-6 text-center">
          🎯 Score: <span className="text-black">{points}</span>
        </h3>

        <div className="mb-4 flex justify-center">
          <label className="flex items-center cursor-pointer text-md font-medium text-gray-700">
            <span className="mr-3">{isTimed ? '⏱ Timed Mode' : '🧘‍♂️ Untimed Mode'}</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={isTimed}
                onChange={() => setIsTimed(!isTimed)}
                className="sr-only"
              />
              <div className="w-12 h-6 bg-gray-300 rounded-full shadow-inner transition duration-300"></div>
              <div
                className={`dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition transform duration-300 ease-in-out ${
                  isTimed ? 'translate-x-6 bg-green-400' : 'bg-red-400'
                }`}
              ></div>
            </div>
          </label>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Guess the Player</h1>
        
        {/* Difficulty button - only show selector when clicked */}
        <div className="mb-6">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
            onClick={() => setShowDifficultySelector(!showDifficultySelector)}
          >
            <span>Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
            {showDifficultySelector ? 
              <ChevronUp size={16} /> : 
              <ChevronDown size={16} />
            }
          </button>
          
          {showDifficultySelector && (
            <div className="mt-2 p-4 bg-white rounded-lg shadow-md">
              <div className="mb-3">
                <p className="text-sm text-gray-700 mb-2">Select difficulty level:</p>
                <select 
                  value={difficulty} 
                  onChange={handleDifficultyChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="random">Random</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="difficult">Difficult</option>
                </select>
              </div>
              <div className="flex justify-between">
                <button 
                  onClick={() => setShowDifficultySelector(false)}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={applyDifficultyAndFetch}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Apply & New Player
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          {sortedYears.map((year) => {
            const key = `${player.career[year]}-${year}`;
            return (
              <LogoCard
                key={key}
                team={player.career[year]}
                year={year}
                attempts={attemptsmade}
                isSelected={selectedCardKey === key}
                selectionMade={selectedCardKey !== null}
                onSelect={() => setSelectedCardKey(key)}
              />
            );
          })}
        </div>

        {isTimed && (
          <p className="text-center text-md font-semibold text-gray-600 mb-4">
            ⏳ Time left: <span className="text-black">{countdown}</span> seconds
          </p>
        )}

        {/* Autosuggest input */}
        <div className="mb-6 w-full max-w-sm">
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={onSuggestionsFetchRequested}
            onSuggestionsClearRequested={onSuggestionsClearRequested}
            getSuggestionValue={(suggestion) => suggestion}
            renderSuggestion={(suggestion) => <div className="p-2 hover:bg-gray-100">{suggestion}</div>}
            onSuggestionSelected={onSuggestionSelected}
            inputProps={inputProps}
            theme={{
              container: 'relative w-full',
              suggestionsContainer: 'absolute w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10',
              suggestionsList: 'list-none p-0 m-0'
            }}
          />
        </div>
    
        <div className="flex flex-wrap gap-4 justify-center items-center mb-6">
          <button
            onClick={handleGuess}
            className="px-6 py-3 bg-green-600 text-white rounded-full shadow-lg transform transition duration-300 hover:bg-green-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            Guess
          </button>

          {showSkipButton && (
            <button
              onClick={showAnswer}
              className="px-6 py-3 bg-gray-600 text-white rounded-full shadow-lg transform transition duration-300 hover:bg-gray-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Skip
            </button>
          )}

          {showNextButton && (
            <button
              onClick={handleNextPlayer}
              className="px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg transform transition duration-300 hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Next Player
            </button>
          )}

          {hintButton && (
            <button
              onClick={handleHint}
              className="px-6 py-3 bg-yellow-500 text-white rounded-full shadow-lg transform transition duration-300 hover:bg-yellow-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            >
              Show Hint
            </button>
          )}
        </div>

        {hintData.Nationality && (
          <p className="text-center mb-1 text-sm text-gray-700">
            <strong>Nationality:</strong> {hintData.Nationality}
          </p>
        )}
        {hintData.Role && (
          <p className="text-center text-sm text-gray-700">
            <strong>Role:</strong> {hintData.Role}
          </p>
        )}

        {message && (
          <div className="mt-6 text-lg font-medium text-center text-red-600">{message}</div>
        )}
      </div>
      <div ref={bottomRef} />

      {/* Leaderboard Sidebar */}
      <div>
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-1/2 right-0 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-l-md shadow-lg z-50"
        >
          {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {/* Sidebar Container */}
        <div
          className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 z-40 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-4 max-w-md mx-auto space-y-4">
            <h2 className="text-2xl font-bold text-center text-gray-800">Leaderboard</h2>
            {leaderboard.map((entry, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                <span
                  className={`text-gray-700 font-medium ${
                    entry.deviceId === deviceId ? "text-green-500" : ""
                  }`}
                >
                  {entry.name}
                </span>
                <span className="text-blue-600 font-bold">{entry.highScore}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Game;