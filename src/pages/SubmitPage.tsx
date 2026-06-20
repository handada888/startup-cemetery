import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeadCompany } from '../types';
import { DEATH_REASONS, INDUSTRIES, FUNDING_STATUSES } from '../data/constants';
import { calculateLifespan } from '../utils/date';
import { useAppContext } from '../context/AppContext';
import TagGroup from '../components/TagGroup';
import ParticleBg from '../components/ParticleBg';
import './SubmitPage.scss';

export default function SubmitPage() {
  const navigate = useNavigate();
  const { submitCompany } = useAppContext();
  const [form, setForm] = useState({
    name: '',
    fullName: '',
    description: '',
    industry: '',
    location: '',
    foundedDate: '',
    closedDate: '',
    fundingStatus: '',
    deathReasons: [] as string[],
    deathAnalysis: '',
    founder: '',
    lessons: '',
    source: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim() || form.name.length < 2) errs.name = '请输入公司名称（至少2个字符）';
    if (!form.description.trim() || form.description.length < 20) errs.description = '请输入公司简介（至少20个字符）';
    if (!form.industry) errs.industry = '请选择所属行业';
    if (!form.location.trim()) errs.location = '请输入所在地';
    if (!form.foundedDate) errs.foundedDate = '请选择成立日期';
    if (!form.closedDate) errs.closedDate = '请选择关闭日期';
    if (form.foundedDate && form.closedDate && form.closedDate < form.foundedDate) errs.closedDate = '关闭日期不能早于成立日期';
    if (form.deathReasons.length === 0) errs.deathReasons = '请至少选择一个死亡原因';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    const company: DeadCompany = {
      id: `user-${Date.now()}`,
      name: form.name.trim(),
      fullName: form.fullName.trim() || undefined,
      description: form.description.trim(),
      industry: form.industry,
      location: form.location.trim(),
      foundedDate: form.foundedDate,
      closedDate: form.closedDate,
      lifespan: calculateLifespan(form.foundedDate, form.closedDate),
      fundingStatus: form.fundingStatus || '尚未获投',
      deathReasons: form.deathReasons,
      deathAnalysis: form.deathAnalysis.trim() || undefined,
      founder: form.founder.trim() || undefined,
      lessons: form.lessons.trim() || undefined,
      source: form.source.trim() || '用户投稿',
      isUserSubmitted: true,
      incenseCount: 0,
      createdAt: new Date().toISOString(),
    };

    submitCompany(company);
    setSubmitted(true);
    setTimeout(() => navigate('/'), 1500);
  };

  const updateField = (field: string, value: string | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleDeathReason = (reason: string) => {
    const newReasons = form.deathReasons.includes(reason)
      ? form.deathReasons.filter(r => r !== reason)
      : [...form.deathReasons, reason];
    updateField('deathReasons', newReasons);
  };

  if (submitted) {
    return (
      <div className="page submit-page">
        <div className="submit-success">
          <span className="submit-success__icon">✅</span>
          <h2>投稿成功！</h2>
          <p>感谢您的贡献，正在返回墓地...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page submit-page">
      <ParticleBg />
      <header className="submit-page__header">
        <h1>✍️ 投稿新案例</h1>
        <p>分享你知道的失败创业案例，帮助更多创业者避坑</p>
      </header>

      <div className="submit-page__form">
        <div className="form-group">
          <label className="form-label">公司名称 <span className="required">*</span></label>
          <input className="form-input" type="text" value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="如：熊猫直播" />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">公司全称</label>
          <input className="form-input" type="text" value={form.fullName} onChange={e => updateField('fullName', e.target.value)} placeholder="如：上海熊猫互娱文化有限公司" />
        </div>

        <div className="form-group">
          <label className="form-label">公司简介 <span className="required">*</span></label>
          <textarea className="form-textarea" value={form.description} onChange={e => updateField('description', e.target.value)} placeholder="简要描述这家公司的业务模式和发展历程（至少20字）" rows={4} />
          {errors.description && <span className="form-error">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">所属行业 <span className="required">*</span></label>
          <TagGroup tags={INDUSTRIES} variant="industry" selectedTags={form.industry ? [form.industry] : []} onTagClick={tag => updateField('industry', form.industry === tag ? '' : tag)} />
          {errors.industry && <span className="form-error">{errors.industry}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">所在地 <span className="required">*</span></label>
          <input className="form-input" type="text" value={form.location} onChange={e => updateField('location', e.target.value)} placeholder="如：北京" />
          {errors.location && <span className="form-error">{errors.location}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">成立日期 <span className="required">*</span></label>
            <input className="form-input" type="date" value={form.foundedDate} onChange={e => updateField('foundedDate', e.target.value)} />
            {errors.foundedDate && <span className="form-error">{errors.foundedDate}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">关闭日期 <span className="required">*</span></label>
            <input className="form-input" type="date" value={form.closedDate} onChange={e => updateField('closedDate', e.target.value)} />
            {errors.closedDate && <span className="form-error">{errors.closedDate}</span>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">融资状态</label>
          <TagGroup tags={FUNDING_STATUSES} variant="funding" selectedTags={form.fundingStatus ? [form.fundingStatus] : []} onTagClick={tag => updateField('fundingStatus', form.fundingStatus === tag ? '' : tag)} />
        </div>

        <div className="form-group">
          <label className="form-label">死亡原因 <span className="required">*</span></label>
          <TagGroup tags={DEATH_REASONS} variant="death" selectedTags={form.deathReasons} onTagClick={toggleDeathReason} />
          {errors.deathReasons && <span className="form-error">{errors.deathReasons}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">死亡原因分析</label>
          <textarea className="form-textarea" value={form.deathAnalysis} onChange={e => updateField('deathAnalysis', e.target.value)} placeholder="深入分析该公司失败的核心原因（选填）" rows={4} />
        </div>

        <div className="form-group">
          <label className="form-label">创始人</label>
          <input className="form-input" type="text" value={form.founder} onChange={e => updateField('founder', e.target.value)} placeholder="如：王思聪" />
        </div>

        <div className="form-group">
          <label className="form-label">核心教训</label>
          <textarea className="form-textarea" value={form.lessons} onChange={e => updateField('lessons', e.target.value)} placeholder="从该案例中可以吸取哪些教训（选填）" rows={3} />
        </div>

        <div className="form-group">
          <label className="form-label">数据来源</label>
          <input className="form-input" type="text" value={form.source} onChange={e => updateField('source', e.target.value)} placeholder="如：公开报道、知乎、36氪等" />
        </div>

        <button className="submit-btn" onClick={handleSubmit}>🪦 提交案例</button>
      </div>
    </div>
  );
}
