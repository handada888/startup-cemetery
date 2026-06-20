import { useNavigate } from 'react-router-dom';
import { DeadCompany } from '../../types';
import TagGroup from '../TagGroup';
import IncenseButton from '../IncenseButton';
import './index.scss';

interface TombstoneCardProps {
  company: DeadCompany;
  onIncense: (id: string) => void;
}

export default function TombstoneCard({ company, onIncense }: TombstoneCardProps) {
  const navigate = useNavigate();
  
  // Pick top 2 death reasons to display
  const displayReasons = company.deathReasons.slice(0, 2);

  return (
    <div className="tombstone-card fade-in" onClick={() => navigate(`/company/${company.id}`)}>
      <div className="tombstone-card__top">
        <span className="tombstone-card__rip">R.I.P.</span>
      </div>
      <div className="tombstone-card__body">
        <div className="tombstone-card__header">
          <div className="tombstone-card__logo">
            {company.logo ? (
              <img src={company.logo} alt={company.name} onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }} />
            ) : null}
            <span className={`tombstone-card__logo-placeholder ${company.logo ? 'hidden' : ''}`}>💀</span>
          </div>
          <div className="tombstone-card__info">
            <h3 className="tombstone-card__name">{company.name}</h3>
            <p className="tombstone-card__lifespan">⏳ 存活 {company.lifespan}</p>
          </div>
        </div>
        <p className="tombstone-card__desc">{company.description.slice(0, 80)}{company.description.length > 80 ? '...' : ''}</p>
        <div className="tombstone-card__tags">
          <TagGroup tags={[company.industry]} variant="industry" size="sm" />
          <TagGroup tags={displayReasons} variant="death" size="sm" />
        </div>
        <div className="tombstone-card__footer">
          <span className="tombstone-card__date">📅 {company.closedDate}</span>
          <span onClick={(e) => e.stopPropagation()}>
            <IncenseButton count={company.incenseCount} onIncense={() => onIncense(company.id)} />
          </span>
        </div>
      </div>
    </div>
  );
}
