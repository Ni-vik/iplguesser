import {
  Menu,
  X,
  HelpCircle,
  Trophy,
  Home,
  Settings,
  Clock,
  Users,
} from "lucide-react";

const Navbar = ({
  isNavOpen,
  showInstructions,
  showLeaderboard,
  showDifficultyModal,
  showTimerModal,
  difficulty,
  leaderboard,
  deviceId,
  isTimed,
  timeLimit,

  setIsNavOpen,
  setShowInstructions,
  setShowLeaderboard,
  setShowDifficultyModal,
  setShowTimerModal,
  setIsTimed,
  setCountdown,
  showDifficultySelector,
  setShowDifficultySelector,

  closeAllModals,
  navigate,
  handleDifficultyChange,
  applyDifficultyAndFetch,
  handleTimeLimitChange,
}) => {

  return (
    <>
      {/* NAVBAR */}
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
                <button
                  onClick={() => {
                    closeAllModals();
                    navigate("/rooms");
                  }}
                  className="py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded flex items-center transition duration-200"

                >
                  <Users size={20} className="mr-1" />Rooms
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
          <button
  onClick={() => {
    closeAllModals();
    navigate("/rooms");
  }}
 className="py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded flex items-center transition duration-200"

>
  <Users size={20} className="mr-1" /> Rooms
</button>

        </div>
      </nav>

      {/* MODALS */}
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
    </>
  );
};

export default Navbar;
