import { useEffect, useState } from "react";
import { getRandomPlayer,checkPlayerGuess,getHint,leaderBoardUpdate, getLeaderBoard } from "../api/playerApi";
import Autosuggest from "react-autosuggest";
import LogoCard from "./LogoCard";
import GuessInput from "./GuessInput";
import playerNames from "../players/players.json";
import confetti from "canvas-confetti";
import { useRef } from "react";
import ScoreDisplay from "./scoreDisplay";
import { getPlayer , submitScoreRoom , fetchRoomScoreboard } from "../api/roomApi";

export function launchConfetti() {
  confetti({
    particleCount: 150,
    spread: 90,
    origin: { y: 0.6 },
  });
}

const GameRoom = ({user_name,timeLimit,roomId}) => {
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
  const [isTimed, setIsTimed] = useState(true); // true = timed mode
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [currPlayer , setCurrPlayer] = useState(0);
  const [isGameOver , setIsGameOver] = useState(false);


  // Function to apply difficulty and fetch a new playe

  const fetchNewPlayer = async () => {
    let playerdata = null;
  
    try {
      //console.log("Difficulty is : ", query);
      playerdata = await getPlayer(roomId,currPlayer);
      if(!playerdata){
        console.log("The round is over");
        
      }
      setCurrPlayer(currPlayer+1);
    } catch (error) {
      setIsGameOver(true);
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
    fetchLeaderboard();
  };


  // Correct async function definition
  async function submitScore(points) {
    try {
      await submitScoreRoom(roomId,user_name,points); // Awaiting async function
      //console.log("Score submitted successfully.");
    } catch (error) {
      console.error("Error submitting score:", error);
    }
  }

  const [leaderboard, setLeaderboard] = useState([]);

  async function fetchLeaderboard() {
    try {
      const data = await fetchRoomScoreboard(roomId); // Awaiting async function
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
        handleNextPlayer();
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
      

      fetchLeaderboard();
      setTimeout(handleNextPlayer, 2000);

      if (attemptsmade == 0) {
        let newpoints = points + 10;
        setPoints(points + 10);
        submitScore(newpoints);
      }
      if (attemptsmade == 1) {
       let newpoints = points + 7;
        setPoints(points + 7);
        submitScore(newpoints);
      }
      if (attemptsmade == 2) {
        let newpoints = points + 5;
        setPoints(points + 5);
        submitScore(newpoints);
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
        submitScore(points);
        setStreak(0);
        setAttemptsmade(0);
        setHintButton(false);
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

  if (!player) return (<div className="text-center mt-10">
  
    
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
                    </div>
        

  </div>);

  const sortedYears = Object.keys(player.career).sort((a, b) => a - b);

  function showAnswer() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setMessage("The correct player was: " + player.name);
    setTimeout(handleNextPlayer, 2000);
    submitScore(points);
    setStreak(0);
  }

  return (
    <>

      <div>
        {/* Your main game content here */}
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50  px-4 py-10">
          <h1 className="text-2xl font-bold mb-4">Welcome, {user_name}!</h1>
          <ScoreDisplay streak={streak} points={points}></ScoreDisplay>

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

export default GameRoom;

