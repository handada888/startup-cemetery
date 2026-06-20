import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DeadCompany } from '../types';
import { loadCompanies } from '../services/companyService';
import { useAppContext } from '../context/AppContext';
import TagGroup from '../components/TagGroup';
import IncenseButton from '../components/IncenseButton';
import CompanyTimeline from '../components/CompanyTimeline';
import EmptyState from '../components/EmptyState';
import './DetailPage.scss';

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<DeadCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const { addIncense, state } = useAppContext();

  useEffect(() => {
    loadCompanies().then(data => {
      const found = data.find(c => c.id === id);
      setCompany(found || null);
      setLoading(false);
    });
  }, [id, state.incenseData]);

  const handleIncense = () => {
    if (company) {
      addIncense(company.id);
      setCompany(prev => prev ? { ...prev, incenseCount: prev.incenseCount + 1 } : null);
    }
  };

  if (loading) {
    return <div className="page"><div className="loading">⏳ 加载中...</div></div>;
  }

  if (!company) {
    return (
      <div className="page">
        <EmptyState icon="💀" title="公司不存在" description="该公司的墓碑已被移除" action={{ label: '返回墓地', onClick: () => navigate('/') }} />
      </div>
    );
  }

  return (
    <div className="page detail-page">
      <button className="detail-page__back" onClick={() => navigate('/')}>← 返回</button>
      
      <div className="detail-page__hero">
        <div className="detail-page__logo">
          {company.logo ? <img src={company.logo} alt={company.name} /> : <span>💀</span>}
        </div>
        <h1 className="detail-page__name">{company.name}</h1>
        {company.fullName && <p className="detail-page__fullname">{company.fullName}</p>}
        <span className="detail-page__status">已关闭</span>
      </div>

      <div className="detail-page__section">
        <h3 className="detail-section-title">📝 公司简介</h3>
        <p className="detail-page__desc">{company.description}</p>
      </div>

      <div className="detail-page__section">
        <h3 className="detail-section-title">📊 基本信息</h3>
        <div className="detail-page__info-grid">
          <div className="info-item">
            <span className="info-item__label">所在地</span>
            <span className="info-item__value">{company.location}</span>
          </div>
          <div className="info-item">
            <span className="info-item__label">成立时间</span>
            <span className="info-item__value">{company.foundedDate}</span>
          </div>
          <div className="info-item">
            <span className="info-item__label">关闭时间</span>
            <span className="info-item__value">{company.closedDate}</span>
          </div>
          <div className="info-item">
            <span className="info-item__label">存活时间</span>
            <span className="info-item__value info-item__value--highlight">{company.lifespan}</span>
          </div>
          {company.founder && (
            <div className="info-item">
              <span className="info-item__label">创始人</span>
              <span className="info-item__value">{company.founder}</span>
            </div>
          )}
          {company.employeeCount && (
            <div className="info-item">
              <span className="info-item__label">巅峰规模</span>
              <span className="info-item__value">{company.employeeCount}</span>
            </div>
          )}
        </div>
      </div>

      <div className="detail-page__section">
        <h3 className="detail-section-title">🏷️ 标签</h3>
        <TagGroup tags={[company.industry, company.fundingStatus, ...company.deathReasons]} variant="default" />
      </div>

      <div className="detail-page__section">
        <h3 className="detail-section-title">💀 死亡原因</h3>
        <TagGroup tags={company.deathReasons} variant="death" size="md" />
      </div>

      {company.deathAnalysis && (
        <div className="detail-page__section">
          <h3 className="detail-section-title">📋 深度分析</h3>
          <div className="detail-page__analysis">
            <p>{company.deathAnalysis}</p>
          </div>
        </div>
      )}

      {company.fundingRounds && company.fundingRounds.length > 0 && (
        <div className="detail-page__section">
          <h3 className="detail-section-title">💰 融资历程</h3>
          <div className="detail-page__funding-summary">
            <span className="funding-total">累计融资：{company.totalFunding}</span>
          </div>
          <CompanyTimeline
            rounds={company.fundingRounds}
            foundedDate={company.foundedDate}
            closedDate={company.closedDate}
          />
        </div>
      )}

      {company.lessons && (
        <div className="detail-page__section">
          <h3 className="detail-section-title">💡 核心教训</h3>
          <blockquote className="detail-page__lessons">
            <p>{company.lessons}</p>
          </blockquote>
        </div>
      )}

      {company.source && (
        <div className="detail-page__section">
          <p className="detail-page__source">数据来源：{company.source}</p>
        </div>
      )}

      <div className="detail-page__incense-section">
        <IncenseButton count={company.incenseCount} onIncense={handleIncense} />
      </div>
    </div>
  );
}
