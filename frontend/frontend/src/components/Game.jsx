import { useEffect, useState } from 'react';
import { getRandomPlayer, checkPlayerGuess, getHint } from '../api/playerApi';
import Autosuggest from 'react-autosuggest';
import LogoCard from './LogoCard';
import GuessInput from './GuessInput';
import playerNames from '../../public/players/players.json';


const Game = () => {
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
  const [points , setPoints] = useState(0);

  const fetchNewPlayer = async () => {
    const playerdata = await getRandomPlayer();
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
  };

  useEffect(() => {
    fetchNewPlayer();
  }, []);

  const handleGuess = async () => {
    if (!guess.trim()) return;
    setAttemptsmade(attemptsmade + 1);

    const data = await checkPlayerGuess(player._id, guess);
    
    if (data.correct) {
      setMessage('🎯 Correct! Moving to next player...');
      setTimeout(fetchNewPlayer, 2000);
      setStreak(streak + 1);

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
      setHintCount(1);
    }
    // Second hint shows role
    else if (hintCount === 1 && attemptsmade > 1) {
      setRole(data.Role);
      setHintData(prev => ({ ...prev, Role: data.Role }));
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
    'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 ',
  };

  const handleNextPlayer = () => {
    fetchNewPlayer();
  };

  if (!player) return <div className="text-center mt-10">Loading...</div>;

  const sortedYears = Object.keys(player.career).sort((a, b) => a - b);

  function showAnswer(){
    setMessage("The correct player was: " + player.name);
    setTimeout(fetchNewPlayer, 2000);
    setStreak(0);
  }

  return (  
    <>
    {showInstructions && (
      <div className="fixed inset-0 z-50 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 w-full h-full flex flex-col items-center justify-center">
        <div className="bg-yellow-50 rounded shadow-md p-6 max-w-xl relative">
          <p className="font-bold text-lg mb-2">How to Play</p>
          <p className="mb-4">
            Guess the player based on the teams they played for each year. You have 3 chances and optional hints. Each hint unlocks after a guess
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50  px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 ">Guess the Player</h1>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        {sortedYears.map((year) => (
          <LogoCard key={year} team={player.career[year]} year={year} />
        ))}
      </div>
  
      <h2 className="text-2xl font-bold mb-2 text-green-700 font-mono text-center">
        🔥 Max Streak: <span className="text-black">{streak}</span>
      </h2>

      <h3 className="text-xl font-semibold text-purple-700 font-serif mb-6 text-center">
        🎯 Score: <span className="text-black ">{points}</span>
      </h3>

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
        <div className="mt-6 text-lg font-medium text-center text-red-600 ">{message}</div>
      )}
    </div>

    </div>
    </>
    );
};

export default Game;
