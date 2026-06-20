import { useState } from 'react';
import { FilterState } from '../../types';
import { DEATH_REASONS, INDUSTRIES, FUNDING_STATUSES, SORT_OPTIONS } from '../../data/constants';
import TagGroup from '../TagGroup';
import './index.scss';

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClose: () => void;
}

export default function FilterPanel({ filters, onChange, onClose }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const toggleArrayItem = (arr: string[], item: string): string[] => {
    return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
  };

  const handleApply = () => {
    onChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const reset: FilterState = {
      industries: [],
      deathReasons: [],
      fundingStages: [],
      yearRange: [2000, 2025],
      lifespanRange: [0, 200],
      keyword: filters.keyword,
      sortBy: 'closedDate',
      sortOrder: 'desc',
    };
    setLocalFilters(reset);
    onChange(reset);
    onClose();
  };

  return (
    <div className="filter-overlay" onClick={onClose}>
      <div className="filter-panel" onClick={e => e.stopPropagation()}>
        <div className="filter-panel__header">
          <h3>筛选条件</h3>
          <button className="filter-panel__close" onClick={onClose}>✕</button>
        </div>
        
        <div className="filter-panel__body">
          <div className="filter-section">
            <h4 className="filter-section__title">🏭 行业</h4>
            <TagGroup
              tags={INDUSTRIES}
              variant="industry"
              selectedTags={localFilters.industries}
              onTagClick={tag => setLocalFilters(f => ({ ...f, industries: toggleArrayItem(f.industries, tag) }))}
            />
          </div>
          
          <div className="filter-section">
            <h4 className="filter-section__title">💀 死亡原因</h4>
            <TagGroup
              tags={DEATH_REASONS}
              variant="death"
              selectedTags={localFilters.deathReasons}
              onTagClick={tag => setLocalFilters(f => ({ ...f, deathReasons: toggleArrayItem(f.deathReasons, tag) }))}
            />
          </div>
          
          <div className="filter-section">
            <h4 className="filter-section__title">💰 融资阶段</h4>
            <TagGroup
              tags={FUNDING_STATUSES}
              variant="funding"
              selectedTags={localFilters.fundingStages}
              onTagClick={tag => setLocalFilters(f => ({ ...f, fundingStages: toggleArrayItem(f.fundingStages, tag) }))}
            />
          </div>
          
          <div className="filter-section">
            <h4 className="filter-section__title">📊 排序方式</h4>
            <div className="sort-options">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`sort-btn ${localFilters.sortBy === opt.value ? 'sort-btn--active' : ''}`}
                  onClick={() => {
                    if (localFilters.sortBy === opt.value) {
                      setLocalFilters(f => ({ ...f, sortOrder: f.sortOrder === 'desc' ? 'asc' : 'desc' }));
                    } else {
                      setLocalFilters(f => ({ ...f, sortBy: opt.value as FilterState['sortBy'], sortOrder: 'desc' }));
                    }
                  }}
                >
                  {opt.label}
                  {localFilters.sortBy === opt.value && (
                    <span className="sort-arrow">{localFilters.sortOrder === 'desc' ? ' ↓' : ' ↑'}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="filter-panel__footer">
          <button className="filter-btn filter-btn--reset" onClick={handleReset}>重置</button>
          <button className="filter-btn filter-btn--apply" onClick={handleApply}>应用筛选</button>
        </div>
      </div>
    </div>
  );
}
