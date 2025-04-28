import { useEffect, useState } from 'react';
import { getRandomPlayer, checkPlayerGuess } from '../api/playerApi';
import Autosuggest from 'react-autosuggest';
import LogoCard from './LogoCard';
import GuessInput from './GuessInput';
import playerNames from '../../public/players/players.json';


const Game = () => {
  const [player, setPlayer] = useState(null);
  const [guess, setGuess] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [showNextButton, setShowNextButton] = useState(false);
  const [showskipButton, setshowskipButton] = useState(true);
  const [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState([]); 
  const [streak, setStreak] = useState(0);


  
  
  const fetchNewPlayer = async () => {
    const playerdata = await getRandomPlayer();
    setPlayer(playerdata);  
    setGuess('');
    setAttemptsLeft(3);
    setMessage('');
    setShowNextButton(false); 
    setshowskipButton(true); 
  };

 

  useEffect(() => {
    fetchNewPlayer();
  }, []);


  

  const handleGuess = async () => {
    if (!guess.trim()) return;

    const data = await checkPlayerGuess(player._id, guess);
    if (data.correct) {
      setMessage('🎯 Correct! Moving to next player...');
      setTimeout(fetchNewPlayer, 2000);
      setStreak(streak+1);
    } else {
      if (attemptsLeft > 1) {
        setAttemptsLeft(attemptsLeft - 1);
        setMessage(`❌ Incorrect! Attempts left: ${attemptsLeft - 1}`);
      } else {
        setMessage('😔 Chances over! Showing new player...');
        setMessage('Correct answer was: ' + player.name);
        setshowskipButton(false);
        setShowNextButton(true);
        setStreak(0);
      }
    }
    setGuess('');
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
    <div className="flex flex-col items-center mt-10">
      <h1 className="text-3xl font-bold mb-6">Guess the Player</h1>
  
      <div className="grid grid-cols-4 gap-4 mb-6">
        {sortedYears.map((year) => (
          <LogoCard key={year} team={player.career[year]} year={year} />
        ))}
      </div>
  
      <h2 className="text-xl font-semibold mb-6">Current Max Streak: {streak}</h2>
  
      {/* Autosuggest for the player name input */}
      <div className="mb-4 w-80 ml-40">
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
  
      <button
        onClick={handleGuess}
        className="mb-4 px-6 py-3 bg-green-600 text-white rounded-full shadow-lg transform transition duration-300 hover:bg-green-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300"
      >
        Guess
      </button>
  
      {message && (
        <div className="mt-4 text-lg font-medium text-center">{message}</div>
      )}
  
      {showNextButton && (
        <button
          onClick={handleNextPlayer}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg transform transition duration-300 hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Next Player
        </button>
      )}





  
      {showskipButton && (
        <button
          onClick={showAnswer}
          className="mt-4 px-6 py-3 bg-gray-600 text-white rounded-full shadow-lg transform transition duration-300 hover:bg-gray-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          Skip
        </button>
      )}

     
      
    </div>
  );
};

export default Game;
