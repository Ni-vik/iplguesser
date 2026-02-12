import { useEffect, useState } from "react";
import { getRandomPlayer, checkPlayerGuess, getHint, leaderBoardUpdate, getLeaderBoard, getAnswer } from "../api/playerApi";
import Autosuggest from "react-autosuggest";
import LogoCard from "./LogoCard";
import GuessInput from "./GuessInput";
import playerNames from "../players/players.json";
import confetti from "canvas-confetti";
import { useRef } from "react";
import ScoreDisplay from "./scoreDisplay";
import UserVerification from "./verify";
import { useNavigate } from 'react-router-dom';
import Navbar from "./NavBar/navbar";

export function launchConfetti() {
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
  const [leaderboard, setLeaderboard] = useState([]);
  const guessPlayerData = useRef(null);
  const navigate = useNavigate();

  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
  };

  const closeAllModals = () => {
    setShowInstructions(false);
    setShowLeaderboard(false);
    setShowDifficultyModal(false);
    setShowTimerModal(false);
    setIsNavOpen(false);
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
    setShowDifficultySelector(false);
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
      showAnswer();

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
    const nextAttempt = attemptsmade + 1;
    setAttemptsmade(nextAttempt);
    let data;
    if (nextAttempt > 2) {
      data = await getAnswer(player._id, guess);
      guessPlayerData.current = data;
    }
    else {
      data = await checkPlayerGuess(player._id, guess);
    }
    if (data.correct === true) {
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
      if (nextAttempt > 2) {
        setMessage("😔 Chances over! Correct answer was: " + data.correct);
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        setShowSkipButton(false);
        setShowNextButton(true);
        submitScore(deviceId, streak);
        setStreak(0);
        setAttemptsmade(0);
        setHintButton(false);
        setPoints(0);
        guessPlayerData.current = null;
      }
      else {
        setAttemptsLeft(attemptsLeft - 1);
        setMessage(`❌ Incorrect! Attempts left: ${attemptsLeft - 1}`);

        if (hintCount < 2) {
          setHintButton(true);
        }
      }
    }
    setGuess("");
  };

  const somePlayerRef = useRef(null);

  const handleHint = async () => {
    if (!somePlayerRef.current) {

      somePlayerRef.current = await getHint(player._id);
    }
    const data = somePlayerRef.current;
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

  async function showAnswer() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    const data = await getAnswer(player._id, "nodata");
    setMessage("The correct player was: " + data.correct);
    setTimeout(fetchNewPlayer, 2000);
    submitScore(deviceId, streak);
    setStreak(0);
  }

  return (
    <>
      <Navbar
        isNavOpen={isNavOpen}
        showInstructions={showInstructions}
        showLeaderboard={showLeaderboard}
        showDifficultyModal={showDifficultyModal}
        showTimerModal={showTimerModal}
        difficulty={difficulty}
        leaderboard={leaderboard}
        deviceId={deviceId}
        isTimed={isTimed}
        timeLimit={timeLimit}
        username={username}
        streak={streak}
        points={points}
        showDifficultySelector={showDifficultySelector}

        setIsNavOpen={setIsNavOpen}
        setShowInstructions={setShowInstructions}
        setShowLeaderboard={setShowLeaderboard}
        setShowDifficultyModal={setShowDifficultyModal}
        setShowTimerModal={setShowTimerModal}
        setIsTimed={setIsTimed}
        setCountdown={setCountdown}
        setShowDifficultySelector={setShowDifficultySelector}

        closeAllModals={closeAllModals}
        navigate={navigate}
        handleDifficultyChange={handleDifficultyChange}
        applyDifficultyAndFetch={applyDifficultyAndFetch}
        handleTimeLimitChange={handleTimeLimitChange}
      />

      <div
        className={`${showInstructions ? "blur-sm pointer-events-none select-none" : ""
          }`}
      >
        {/* Your main game content here */}
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50  px-4 py-10">
          <h1 className="text-2xl font-bold mb-4">Welcome, {username}!</h1>
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

export default Game;
