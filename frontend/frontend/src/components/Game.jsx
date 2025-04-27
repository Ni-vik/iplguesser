import { useEffect, useState } from 'react';
import { getRandomPlayer, checkPlayerGuess } from '../api/playerApi';
import LogoCard from './LogoCard';
import GuessInput from './GuessInput';

const Game = () => {
  const [player, setPlayer] = useState(null);
  const [guess, setGuess] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [message, setMessage] = useState('');

  const fetchNewPlayer = async () => {
    const data = await getRandomPlayer();
    setPlayer(data);
    setGuess('');
    setAttemptsLeft(3);
    setMessage('');
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
    } else {
      if (attemptsLeft > 1) {
        setAttemptsLeft(attemptsLeft - 1);
        setMessage(`❌ Incorrect! Attempts left: ${attemptsLeft - 1}`);
      } else {
        setMessage('😔 Chances over! Showing new player...');
        setTimeout(fetchNewPlayer, 2000);
      }
    }
    setGuess('');
  };

  if (!player) return <div className="text-center mt-10">Loading...</div>;

  const sortedYears = Object.keys(player.career).sort((a, b) => a - b);

  return (
    <div className="flex flex-col items-center mt-10">
      <h1 className="text-3xl font-bold mb-6">Guess the Player</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {sortedYears.map((year) => (
          <LogoCard key={year} team={player.career[year]} year={year} />
        ))}
      </div>

      <GuessInput guess={guess} setGuess={setGuess} handleGuess={handleGuess} />

      {message && <div className="mt-4 text-lg">{message}</div>}
    </div>
  );
};

export default Game;
