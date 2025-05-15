import { useEffect, useState } from "react";
import { getRandomPlayer,checkPlayerGuess,getHint,leaderBoardUpdate, getLeaderBoard } from "../api/playerApi";
import Autosuggest from "react-autosuggest";
import LogoCard from "./LogoCard";
import GuessInput from "./GuessInput";
import playerNames from "../players/players.json";
import confetti from "canvas-confetti";
import { useRef } from "react";
import {ChevronLeft,ChevronRight,ChevronUp,ChevronDown,} from "lucide-react";
import { Menu, X, HelpCircle, Trophy, Home, Settings, Clock } from "lucide-react";
import ScoreDisplay from "./scoreDisplay";
import { checkDevice , registerUser } from "../api/playerApi";
import UserVerification from "./verify";

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

const Game = () => {
  const [verified, setVerified] = useState(false);
  const [username, setUsername] = useState("");
  const bottomRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [player, setPlayer] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [guess, setGuess] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [showNextButton, setShowNextButton] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(true);
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [streak, setStreak] = useState(0);
  const [nationality, setNationality] = useState("");
  const [role, setRole] = useState("");
  const [hintButton, setHintButton] = useState(false);
  const [hintCount, setHintCount] = useState(0); // 0: no hints, 1: nationality, 2: both
  const [hintData, setHintData] = useState({ Nationality: "", Role: "" });
  const [attemptsmade, setAttemptsmade] = useState(0);
  const [points, setPoints] = useState(0);
  const [selectedCardKey, setSelectedCardKey] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const [isTimed, setIsTimed] = useState(false); // true = timed mode
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [difficulty, setDifficulty] = useState("random");
  const [showDifficultySelector, setShowDifficultySelector] = useState(false);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30); // Default 30 seconds
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [isVerified ,setisVerified] = useState(false);






  const closeAllModals = () => {
    setShowInstructions(false);
    setShowLeaderboard(false);
    setShowDifficultyModal(false);
    setShowTimerModal(false);
    setIsNavOpen(false);
  };

  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
  };

  // Function to apply difficulty and fetch a new player
  const applyDifficultyAndFetch = () => {
    fetchNewPlayer();
    setShowDifficultySelector(true);
  };

  const fetchNewPlayer = async () => {
    const query = difficulty === 'random' ? undefined : difficulty;
    let playerdata = null;
  
    try {
      //console.log("Difficulty is : ", query);
      playerdata = await getRandomPlayer(query);
    } catch (error) {
      console.error(error);
      setPlayer(null);
      return; // exit if failed
    }
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
    setShowDifficultySelector(false); // Make sure this is set to false
    fetchLeaderboard();
  };

  let deviceIdentity = localStorage.getItem("deviceId");
  if (!deviceIdentity) {
    deviceIdentity = crypto.randomUUID();
    localStorage.setItem("deviceId", deviceIdentity);
  }

  // Correct async function definition
  async function submitScore(deviceId, streak) {
    try {
      await leaderBoardUpdate(deviceId, streak); // Awaiting async function
      //console.log("Score submitted successfully.");
    } catch (error) {
      console.error("Error submitting score:", error);
    }
  }

  const [leaderboard, setLeaderboard] = useState([]);

  async function fetchLeaderboard() {
    try {
      const data = await getLeaderBoard(); // Awaiting async function
      setLeaderboard(data);
    } catch (error) {
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
      setStreak(0);
      setMessage("😔 Time over! Correct answer was: " + player.name);

      const nextPlayerTimer = setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        fetchNewPlayer();
      }, 5000);

      return () => clearTimeout(nextPlayerTimer);
    }, timeLimit * 1000);

    return () => clearTimeout(timeOverTimer);
  }, [player, isTimed, timeLimit]);

  useEffect(() => {
    if (!player || !isTimed) return;

    setCountdown(timeLimit);

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
  }, [player, isTimed, timeLimit]);

  const handleGuess = async () => {
    if (!guess.trim()) return;
    setAttemptsmade(attemptsmade + 1);

    const data = await checkPlayerGuess(player._id, guess);

    if (data.correct) {
      launchConfetti();
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setMessage("🎯 Correct! Moving to next player...");
      const newStreak = streak + 1;
      setStreak(newStreak);
      submitScore(deviceId, newStreak);

      fetchLeaderboard();
      setTimeout(fetchNewPlayer, 2000);

      if (attemptsmade == 0) {
        setPoints(points + 10);
      }
      if (attemptsmade == 1) {
        setPoints(points + 7);
      }
      if (attemptsmade == 2) {
        setPoints(points + 5);
      }
    } else {
      if (attemptsLeft > 1) {
        setAttemptsmade(attemptsmade + 1);
        setAttemptsLeft(attemptsLeft - 1);
        setMessage(`❌ Incorrect! Attempts left: ${attemptsLeft - 1}`);

        // Enable hint button after first incorrect guess
        if (hintCount < 2) {
          setHintButton(true);
        }
      } else {
        setMessage("😔 Chances over! Correct answer was: " + player.name);
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        setShowSkipButton(false);
        setShowNextButton(true);
        submitScore(deviceId, streak);
        setStreak(0);
        setAttemptsmade(0);
        setHintButton(false);
        setPoints(0);
      }
    }
    setGuess("");
  };

  const handleHint = async () => {
    const data = await getHint(player.name);

    // First hint shows nationality
    if (hintCount === 0) {
      setNationality(data.Nationality);
      setHintData((prev) => ({ ...prev, Nationality: data.Nationality }));
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setHintCount(1);
    }
    // Second hint shows role
    else if (hintCount === 1 && attemptsmade > 1) {
      setRole(data.Role);
      setHintData((prev) => ({ ...prev, Role: data.Role }));
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setHintCount(2);
    }
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    const filteredNames = playerNames.filter((name) =>
      name.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filteredNames.slice(0, 5)); // Slice to get top 5 suggestions
  };

  const onSuggestionSelected = (event, { suggestion }) => {
    setGuess(suggestion); // Set the selected suggestion as the guess
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const inputProps = {
    placeholder: "Type player name...",
    value: guess,
    onChange: (event, { newValue }) => setGuess(newValue),
    className:
      "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 ",
  };

  const handleNextPlayer = () => {
    fetchNewPlayer();
    fetchLeaderboard();
  };

  const handleTimeLimitChange = (e) => {
    setTimeLimit(parseInt(e.target.value, 10));
  };

  if (!player) return <div className="text-center mt-10">Loading...</div>;

  const handleVerified = (name) => {
    setVerified(true);
    setUsername(name);
  };
  if (!verified) {
    return <UserVerification onVerified={handleVerified} />;
  }

  const sortedYears = Object.keys(player.career).sort((a, b) => a - b);

  function showAnswer() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setMessage("The correct player was: " + player.name);
    setTimeout(fetchNewPlayer, 2000);
    submitScore(deviceId, streak);
    setStreak(0);
  }

  return (
    <>
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between">
            <div className="flex space-x-4">
              <div className="flex items-center py-4">
                <span className="font-bold text-xl">Guess The Player</span>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsNavOpen(!isNavOpen)}
                className="mobile-menu-button p-2 focus:outline-none"
              >
                {isNavOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => {
                  closeAllModals();
                }}
                className="py-2 px-4 text-white hover:bg-blue-700 rounded flex items-center"
              >
                <Home size={20} className="mr-1" /> Home
              </button>
              <button
                onClick={() => {
                  closeAllModals();
                  setShowInstructions(true);
                }}
                className="py-2 px-4 text-white hover:bg-blue-700 rounded flex items-center"
              >
                <HelpCircle size={20} className="mr-1" /> How to Play
              </button>
              <button
                onClick={() => {
                  closeAllModals();
                  setShowDifficultyModal(true);
                }}
                className="py-2 px-4 text-white hover:bg-blue-700 rounded flex items-center"
              >
                <Settings size={20} className="mr-1" /> Difficulty
              </button>
              <button
                onClick={() => {
                  closeAllModals();
                  setShowTimerModal(true);
                }}
                className="py-2 px-4 text-white hover:bg-blue-700 rounded flex items-center"
              >
                <Clock size={20} className="mr-1" /> Timer
              </button>
              <button
                onClick={() => {
                  closeAllModals();
                  setShowLeaderboard(true);
                }}
                className="py-2 px-4 text-white hover:bg-blue-700 rounded flex items-center"
              >
                <Trophy size={20} className="mr-1" /> Leaderboard
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${isNavOpen ? "block" : "hidden"}`}>
          <button
            onClick={() => {
              closeAllModals();
            }}
            className="block py-2 px-4 text-white w-full text-left hover:bg-blue-700"
          >
            <div className="flex items-center">
              <Home size={20} className="mr-2" /> Home
            </div>
          </button>
          <button
            onClick={() => {
              closeAllModals();
              setShowInstructions(true);
            }}
            className="block py-2 px-4 text-white w-full text-left hover:bg-blue-700"
          >
            <div className="flex items-center">
              <HelpCircle size={20} className="mr-2" /> How to Play
            </div>
          </button>
          <button
            onClick={() => {
              closeAllModals();
              setShowDifficultyModal(true);
            }}
            className="block py-2 px-4 text-white w-full text-left hover:bg-blue-700"
          >
            <div className="flex items-center">
              <Settings size={20} className="mr-2" /> Difficulty
            </div>
          </button>
          <button
            onClick={() => {
              closeAllModals();
              setShowTimerModal(true);
            }}
            className="block py-2 px-4 text-white w-full text-left hover:bg-blue-700"
          >
            <div className="flex items-center">
              <Clock size={20} className="mr-2" /> Timer
            </div>
          </button>
          <button
            onClick={() => {
              closeAllModals();
              setShowLeaderboard(true);
            }}
            className="block py-2 px-4 text-white w-full text-left hover:bg-blue-700"
          >
            <div className="flex items-center">
              <Trophy size={20} className="mr-2" /> Leaderboard
            </div>
          </button>
        </div>
      </nav>
      {showDifficultyModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
    <div 
      className="fixed inset-0 bg-black bg-opacity-50" 
      onClick={() => setShowDifficultyModal(false)}
    />
    
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative z-10">
      <button 
        onClick={() => setShowDifficultyModal(false)} 
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        <X size={24} />
      </button>
      
      <h2 className="text-2xl font-bold mb-4 text-blue-600 flex items-center">
        <Settings size={24} className="mr-2" /> Difficulty Settings
      </h2>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-2">Select the difficulty level:</p>
        <select 
          value={difficulty} 
          onChange={handleDifficultyChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="random">Random</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="difficult">Difficult</option>
        </select>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button 
          onClick={() => setShowDifficultyModal(false)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
        <button 
          onClick={() => {
            setShowDifficultyModal(false);
            applyDifficultyAndFetch();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Apply & New Player
        </button>
      </div>
    </div>
  </div>
)}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowInstructions(false)}
          />

          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6 relative my-8 max-h-screen overflow-y-auto z-10">
            <button
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-white rounded-full p-1"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-4 text-blue-600 pr-8">
              How to Play
            </h2>

            <div className="space-y-4">
              <p className="text-gray-700">
                Guess the player based on the teams they played for each year.
                You have 3 chances and optional hints.
              </p>

              <p className="text-gray-700">
                Each hint unlocks after a guess. After the 2nd hint, you can
                click on any team to view the squad, but only for one team.
              </p>

              <p className="text-gray-700">
                Click "Skip" if you're stuck or need to move to the next player.
              </p>

              <div className="flex justify-center mt-4">
                <img
                  src="/logos/intro.png"
                  alt="Instructions Guide"
                  className="w-full max-w-md rounded-md border border-gray-300 shadow"
                />
              </div>

              <div className="pt-6 flex justify-center">
                <button
                  onClick={() => setShowInstructions(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ===== LEADERBOARD MODAL ===== */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowLeaderboard(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-blue-600 flex items-center">
              <Trophy size={24} className="mr-2" /> Leaderboard
            </h2>
            <div className="space-y-2">
              {leaderboard.length > 0 ? (
                leaderboard.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      entry.deviceId === deviceId
                        ? "bg-blue-100 border-l-4 border-blue-500"
                        : "bg-gray-100 hover:bg-gray-200"
                    } transition`}
                  >
                    <div className="flex items-center">
                      <span className="text-gray-800 font-medium mr-2">
                        #{index + 1}
                      </span>
                      <span
                        className={`font-medium ${
                          entry.deviceId === deviceId
                            ? "text-blue-600 font-bold"
                            : "text-gray-700"
                        }`}
                      >
                        {entry.name}
                      </span>
                    </div>
                    <span className="text-blue-600 font-bold">
                      {entry.highScore}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">
                  No scores recorded yet
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {showTimerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={() => setShowTimerModal(false)}
          />
          
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative z-10">
            <button 
              onClick={() => setShowTimerModal(false)} 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold mb-4 text-blue-600 flex items-center">
              <Clock size={24} className="mr-2" /> Timer Settings
            </h2>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700 font-medium">Enable Timer:</span>
                <label className="flex items-center cursor-pointer">
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
                        isTimed ? "translate-x-6 bg-green-400" : "bg-red-400"
                      }`}
                    ></div>
                  </div>
                  <span className="ml-3 text-gray-700">
                    {isTimed ? "On" : "Off"}
                  </span>
                </label>
              </div>
              
              {isTimed && (
                <div>
                  <p className="text-gray-700 mb-2">Set time limit (seconds):</p>
                  <div className="flex items-center space-x-4">
                    <input 
                      type="range" 
                      min="10" 
                      max="120" 
                      step="5"
                      value={timeLimit}
                      onChange={handleTimeLimitChange}
                      className="w-full"
                    />
                    <input
                      type="number"
                      min="10"
                      max="120"
                      value={timeLimit}
                      onChange={handleTimeLimitChange}
                      className="w-16 p-2 border border-gray-300 rounded-lg text-center"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Recommended: 30-60 seconds
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowTimerModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowTimerModal(false);
                  // If you need to reset countdown when settings change
                  if (isTimed) {
                    setCountdown(timeLimit);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`${
          showInstructions ? "blur-sm pointer-events-none select-none" : ""
        }`}
      >
        {/* Your main game content here */}
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50  px-4 py-10">
          <h1 className="text-2xl font-bold mb-4">Welcome, {username}!</h1>
          <ScoreDisplay streak={streak} points={points}></ScoreDisplay>

          {showDifficultySelector && (
            <div className="mt-2 p-4 bg-white rounded-lg shadow-md">
              <div className="mb-3">
                <p className="text-sm text-gray-700 mb-2">
                  Select difficulty level:
                </p>
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
              ⏳ Time left: <span className="text-black">{countdown}</span>{" "}
              seconds
            </p>
          )}

          {/* Autosuggest input */}
          <div className="mb-6 w-full max-w-sm">
            <Autosuggest
              suggestions={suggestions}
              onSuggestionsFetchRequested={onSuggestionsFetchRequested}
              onSuggestionsClearRequested={onSuggestionsClearRequested}
              getSuggestionValue={(suggestion) => suggestion}
              renderSuggestion={(suggestion) => <div>{suggestion}</div>}
              onSuggestionSelected={onSuggestionSelected}
              inputProps={inputProps}
            />
          </div>

          <div className="flex flex-wrap gap-4 justify-center items-center mb-6">
            <button
              onClick={handleGuess}
              className="px-6 py-3 bg-green-600 text-white rounded-full shadow-lg transform transition duration-300 hover:bg-green-700 hover:scale-105 focus:outline-none focus:ring"> Guess
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
            <p className="text-center mb-1 text-sm text-gray-700 ">
              <strong>Nationality:</strong> {hintData.Nationality}
            </p>
          )}
          {hintData.Role && (
            <p className="text-center text-sm text-gray-700 ">
              <strong>Role:</strong> {hintData.Role}
            </p>
          )}

          {message && (
            <div className="mt-6 text-lg font-medium text-center text-red-600 ">
              {message}
            </div>
          )}
        </div>
        <div ref={bottomRef} />
      </div>
    </>
  );
};

export default Game;