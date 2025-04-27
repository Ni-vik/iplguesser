const GuessInput = ({ guess, setGuess, handleGuess }) => {
    return (
      <div className="flex items-center space-x-2 mt-4">
        <input
          type="text"
          placeholder="Guess the Player..."
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          className="border p-2 rounded-md w-64"
        />
        <button
          onClick={handleGuess}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Submit
        </button>
      </div>
    );
  };
  
  export default GuessInput;
  