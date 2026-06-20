import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeadCompany, FilterState } from '../types';
import { loadCompanies, filterCompanies, sortCompanies } from '../services/companyService';
import { useAppContext } from '../context/AppContext';
import TombstoneCard from '../components/TombstoneCard';
import FilterPanel from '../components/FilterPanel';
import SearchBar from '../components/SearchBar';
import ParticleBg from '../components/ParticleBg';
import EmptyState from '../components/EmptyState';
import './HomePage.scss';

const SKELETON_COUNT = 4;

export default function HomePage() {
  const [companies, setCompanies] = useState<DeadCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>({
    industries: [],
    deathReasons: [],
    fundingStages: [],
    yearRange: [2000, 2025],
    lifespanRange: [0, 200],
    keyword: '',
    sortBy: 'closedDate',
    sortOrder: 'desc',
  });
  const { addIncense, state } = useAppContext();

  useEffect(() => {
    loadCompanies().then(data => {
      setCompanies(data);
      setLoading(false);
    });
  }, [state.submissions, state.incenseData]);

  // Listen to scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filtered = useMemo(() => {
    let result = filterCompanies(companies, filters);
    result = sortCompanies(result, filters.sortBy, filters.sortOrder);
    return result;
  }, [companies, filters]);

  const handleIncense = useCallback((id: string) => {
    addIncense(id);
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, incenseCount: c.incenseCount + 1 } : c));
  }, [addIncense]);

  const handleSearch = useCallback((keyword: string) => {
    setFilters(f => ({ ...f, keyword }));
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFilterCount = filters.industries.length + filters.deathReasons.length + filters.fundingStages.length;

  return (
    <div className="page home-page">
      <ParticleBg />
      
      <header className="home-page__header">
        <h1 className="home-page__title">
          <span className="home-page__title-icon">🪦</span>
          创业墓地
        </h1>
        <p className="home-page__subtitle">铭记那些曾经闪耀的星辰 · 从失败中汲取力量</p>
      </header>

      <div className="home-page__toolbar">
        <SearchBar value={filters.keyword} onChange={handleSearch} />
        <button
          className={`filter-toggle ${activeFilterCount > 0 ? 'filter-toggle--active' : ''}`}
          onClick={() => setShowFilter(true)}
        >
          🔍 筛选{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>
      </div>

      <div className="home-page__count">
        共 {loading ? '...' : filtered.length} 家公司在墓园中安息
      </div>

      <div className="home-page__list" ref={listRef}>
        {loading ? (
          Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="tombstone-card skeleton-card">
              <div className="skeleton-card__top">
                <div className="skeleton" style={{ width: 60, height: 14 }} />
              </div>
              <div className="skeleton-card__body">
                <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                  <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 10 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ width: '60%', height: 18, marginBottom: 6 }} />
                    <div className="skeleton" style={{ width: '40%', height: 12 }} />
                  </div>
                </div>
                <div className="skeleton" style={{ width: '100%', height: 14, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: '75%', height: 14, marginBottom: 10 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="skeleton" style={{ width: 80, height: 14 }} />
                  <div className="skeleton" style={{ width: 70, height: 30, borderRadius: 8 }} />
                </div>
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🪦"
            title="没有找到匹配的公司"
            description="尝试调整筛选条件，或者提交你知道的失败案例"
            action={{ label: '去投稿', onClick: () => navigate('/submit') }}
          />
        ) : (
          filtered.map(company => (
            <TombstoneCard key={company.id} company={company} onIncense={handleIncense} />
          ))
        )}
      </div>

      {showScrollTop && (
        <button className="scroll-top-btn" onClick={scrollToTop}>
          ↑
        </button>
      )}

      {showFilter && (
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onClose={() => setShowFilter(false)}
        />
      )}
    </div>
  );
}
