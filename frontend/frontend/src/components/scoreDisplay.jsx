const ScoreDisplay = ({streak,points}) => {
    return (
        <>
        <h2 className="text-2xl font-bold mb-2 text-green-700 font-mono text-center">
            🔥 Max Streak: <span className="text-black">{streak}</span>
          </h2>

          <h3 className="text-xl font-semibold text-purple-700 font-serif mb-6 text-center">
            🎯 Score: <span className="text-black ">{points}</span>
          </h3>
        </>
    );
};

export default ScoreDisplay;