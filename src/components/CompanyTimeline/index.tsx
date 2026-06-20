import { FundingRound } from '../../types';
import './index.scss';

interface CompanyTimelineProps {
  rounds: FundingRound[];
  foundedDate: string;
  closedDate: string;
}

export default function CompanyTimeline({ rounds, foundedDate, closedDate }: CompanyTimelineProps) {
  const allEvents = [
    { type: 'founded' as const, date: foundedDate, label: '公司成立' },
    ...rounds.map(r => ({ type: 'funding' as const, date: r.date, label: r.round, amount: r.amount, investors: r.investors })),
    { type: 'closed' as const, date: closedDate, label: '公司关闭' },
  ];

  return (
    <div className="timeline">
      {allEvents.map((event, i) => (
        <div key={i} className={`timeline__item timeline__item--${event.type}`}>
          <div className="timeline__dot">
            {event.type === 'founded' ? '🚀' : event.type === 'closed' ? '💀' : '💰'}
          </div>
          <div className="timeline__content">
            <div className="timeline__header-row">
              <span className="timeline__label">{event.label}</span>
              <span className="timeline__date">{event.date}</span>
            </div>
            {event.type === 'funding' && (
              <div className="timeline__detail">
                <span className="timeline__amount">{event.amount}</span>
                {event.investors && event.investors.length > 0 && (
                  <span className="timeline__investors">投资方：{event.investors.join('、')}</span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
