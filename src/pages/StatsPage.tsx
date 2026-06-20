import { useState, useEffect, useMemo } from 'react';
import { DeadCompany, StatsData } from '../types';
import { loadCompanies } from '../services/companyService';
import { computeStats } from '../services/statsService';
import StatsChart from '../components/StatsChart';
import ParticleBg from '../components/ParticleBg';
import './StatsPage.scss';

export default function StatsPage() {
  const [companies, setCompanies] = useState<DeadCompany[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanies().then(data => {
      setCompanies(data);
      setStats(computeStats(data));
      setLoading(false);
    });
  }, []);

  const deathReasonOption = useMemo(() => {
    if (!stats) return {};
    return {
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        itemStyle: { borderRadius: 6, borderColor: '#0d1117', borderWidth: 3 },
        label: { color: '#8b949e', fontSize: 11 },
        data: stats.deathReasonStats.map(s => ({ name: s.name, value: s.count })),
      }],
      title: { text: '死亡原因分布', left: 'center', textStyle: { color: '#e6edf3', fontSize: 14 } },
    };
  }, [stats]);

  const industryOption = useMemo(() => {
    if (!stats) return {};
    const data = stats.industryStats.slice(0, 12);
    return {
      series: [{
        type: 'bar',
        data: data.map(s => s.count),
        itemStyle: { borderRadius: [4, 4, 0, 0], color: '#58a6ff' },
      }],
      xAxis: { type: 'category', data: data.map(s => s.name), axisLabel: { rotate: 45, fontSize: 10 } },
      yAxis: { type: 'value' },
      title: { text: '行业分布 TOP12', left: 'center', textStyle: { color: '#e6edf3', fontSize: 14 } },
    };
  }, [stats]);

  const yearlyOption = useMemo(() => {
    if (!stats) return {};
    return {
      series: [{
        type: 'line',
        data: stats.yearlyStats.map(s => s.count),
        smooth: true,
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(247,129,102,0.3)' }, { offset: 1, color: 'rgba(247,129,102,0)' }] } },
        lineStyle: { color: '#f78166', width: 2 },
        itemStyle: { color: '#f78166' },
      }],
      xAxis: { type: 'category', data: stats.yearlyStats.map(s => String(s.year)), axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value' },
      title: { text: '年度死亡趋势', left: 'center', textStyle: { color: '#e6edf3', fontSize: 14 } },
    };
  }, [stats]);

  const fundingOption = useMemo(() => {
    if (!stats) return {};
    return {
      series: [{
        type: 'pie',
        radius: '65%',
        itemStyle: { borderRadius: 6, borderColor: '#0d1117', borderWidth: 3 },
        label: { color: '#8b949e', fontSize: 10 },
        data: stats.fundingStats.map(s => ({ name: s.name, value: s.count })),
      }],
      title: { text: '融资阶段分布', left: 'center', textStyle: { color: '#e6edf3', fontSize: 14 } },
    };
  }, [stats]);

  const lifespanOption = useMemo(() => {
    if (!stats) return {};
    return {
      series: [{
        type: 'bar',
        data: stats.lifespanStats.map(s => s.count),
        itemStyle: { borderRadius: [4, 4, 0, 0], color: '#d4a574' },
      }],
      xAxis: { type: 'category', data: stats.lifespanStats.map(s => s.range), axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value' },
      title: { text: '存活时间分布', left: 'center', textStyle: { color: '#e6edf3', fontSize: 14 } },
    };
  }, [stats]);

  if (loading) {
    return <div className="page"><div className="loading">⏳ 正在分析数据...</div></div>;
  }

  return (
    <div className="page stats-page">
      <ParticleBg />
      <header className="stats-page__header">
        <h1>📊 数据统计</h1>
        <p>从失败中学习，让数据说话</p>
      </header>

      {stats && (
        <div className="stats-page__summary">
          <div className="summary-card">
            <span className="summary-card__icon">💀</span>
            <span className="summary-card__value">{companies?.length || 0}</span>
            <span className="summary-card__label">安息公司</span>
          </div>
          <div className="summary-card">
            <span className="summary-card__icon">⏳</span>
            <span className="summary-card__value">{stats.lifespanStats[1]?.count ? `${Math.round(stats.lifespanStats.reduce((a, b, i) => {
              const mids = [6, 18, 30, 48, 90, 120];
              return a + b.count * mids[i];
            }, 0) / (stats.lifespanStats.reduce((a, b) => a + b.count, 0) || 1))}月` : '-'}</span>
            <span className="summary-card__label">平均存活</span>
          </div>
          <div className="summary-card">
            <span className="summary-card__icon">🔴</span>
            <span className="summary-card__value">{stats.deathReasonStats[0]?.name || '-'}</span>
            <span className="summary-card__label">头号杀手</span>
          </div>
          <div className="summary-card">
            <span className="summary-card__icon">🏭</span>
            <span className="summary-card__value">{stats.industryStats[0]?.name || '-'}</span>
            <span className="summary-card__label">重灾行业</span>
          </div>
        </div>
      )}

      <div className="stats-page__grid">
        <StatsChart option={deathReasonOption} height={320} chartType="pie" />
        <StatsChart option={industryOption} height={340} chartType="bar" />
        <StatsChart option={yearlyOption} height={300} chartType="line" />
        <StatsChart option={fundingOption} height={300} chartType="pie" />
        <StatsChart option={lifespanOption} height={280} chartType="bar" />
      </div>
    </div>
  );
}
