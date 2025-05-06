const GuessInput = ({ guess, setGuess, handleGuess }) => {
    return (
      <div className="flex items-center space-x-2 mt-4">
        <input type="text" id="first_name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Guess the Player..."
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
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
  