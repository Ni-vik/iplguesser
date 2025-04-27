import { teamLogoMap } from '../utils/teamLogoMap';

const LogoCard = ({ team, year }) => {
  const logo = teamLogoMap[team] || teamLogoMap['na'];

  return (
    <div className="flex flex-col items-center">
      <img src={logo} alt={team} className="w-16 h-16 object-contain" />
      <span className="text-sm mt-1">{year}</span>
    </div>
  );
};

export default LogoCard;
