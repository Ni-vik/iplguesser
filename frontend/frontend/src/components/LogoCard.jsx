import axios from 'axios';
import { useState } from 'react';
import { teamLogoMap } from '../utils/teamLogoMap';
import { getSquad } from '../api/playerApi';


const LogoCard = ({ team, year, attempts, isSelected, selectionMade, onSelect }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playerNames, setPlayerNames] = useState([]);
  const logo = teamLogoMap[team] || teamLogoMap['na'];

  const handleImageClick = async () => {
    if (attempts !== 2) return;

    // If a selection is already made, allow only if this card is the selected one
    if (selectionMade && !isSelected) return;

    // If not yet selected, mark this card as selected
    if (!selectionMade) {
      onSelect();
    }

    try {
      const response = await getSquad(team,year);
      const playerNames = response.map((player) => player.name);
      setPlayerNames(playerNames);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching squad:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPlayerNames([]);
  };

  return (
    <div className="flex flex-col items-center">
      <img
        src={logo}
        alt={team}
        className="w-16 h-16 object-contain cursor-pointer"
        onClick={handleImageClick}
      />
      <span className="text-sm mt-1">{year}</span>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-96 max-h-[80vh] overflow-auto">
            <h2 className="text-xl font-semibold mb-4 text-center">Player Squad</h2>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              {playerNames.map((name, index) => (
                <li key={index} className="text-lg">{name}</li>
              ))}
            </ul>
            <button
              onClick={closeModal}
              className="mt-4 p-2 bg-red-500 text-white rounded hover:bg-red-700 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};


export default LogoCard;
