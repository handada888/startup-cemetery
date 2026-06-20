import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeadCompany } from '../types';
import { loadCompanies, createCompany, updateCompany, deleteCompany } from '../services/companyService';
import { DEATH_REASONS, INDUSTRIES, FUNDING_STATUSES } from '../data/constants';
import { calculateLifespan } from '../utils/date';
import TagGroup from '../components/TagGroup';
import './AdminPage.scss';

const EMPTY_FORM: Partial<DeadCompany> = {
  name: '',
  fullName: '',
  description: '',
  industry: '',
  subIndustry: '',
  location: '',
  foundedDate: '',
  closedDate: '',
  fundingStatus: '',
  totalFunding: '',
  deathReasons: [],
  deathAnalysis: '',
  founder: '',
  employeeCount: '',
  lessons: '',
  source: '',
  tags: [],
  incenseCount: 0,
};

export default function AdminPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<DeadCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [editing, setEditing] = useState<DeadCompany | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Partial<DeadCompany>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<DeadCompany | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await loadCompanies();
    setCompanies(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = companies.filter(c =>
    !keyword || c.name.includes(keyword) || (c.fullName || '').includes(keyword)
  );

  const openEdit = (company: DeadCompany) => {
    setEditing(company);
    setCreating(false);
    setForm({ ...company });
  };

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({ ...EMPTY_FORM });
  };

  const closeForm = () => {
    setEditing(null);
    setCreating(false);
    setForm({ ...EMPTY_FORM });
  };

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleDeathReason = (reason: string) => {
    const reasons = form.deathReasons || [];
    updateField('deathReasons', reasons.includes(reason)
      ? reasons.filter(r => r !== reason)
      : [...reasons, reason]
    );
  };

  const handleSave = async () => {
    if (!form.name || !form.description || !form.industry || !form.foundedDate || !form.closedDate) {
      alert('请填写必填字段：公司名称、简介、行业、成立日期、关闭日期');
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...form,
        lifespan: calculateLifespan(form.foundedDate!, form.closedDate!),
        fundingStatus: form.fundingStatus || '尚未获投',
        incenseCount: form.incenseCount || 0,
        tags: form.tags || [],
        deathReasons: form.deathReasons || [],
      };

      if (creating) {
        await createCompany(data);
      } else if (editing) {
        await updateCompany(editing.id, data);
      }
      await refresh();
      closeForm();
    } catch (err) {
      alert('保存失败：' + (err as Error).message);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteCompany(confirmDelete.id);
      await refresh();
      setConfirmDelete(null);
    } catch (err) {
      alert('删除失败：' + (err as Error).message);
    }
  };

  const isFormOpen = editing || creating;

  return (
    <div className="page admin-page">
      <header className="admin-page__header">
        <button className="admin-page__back" onClick={() => navigate('/')}>← 返回前台</button>
        <h1>🔧 管理后台</h1>
        <p>共 {companies.length} 条案例数据</p>
      </header>

      <div className="admin-page__toolbar">
        <input
          className="admin-search"
          type="text"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="搜索公司名称..."
        />
        <button className="admin-btn admin-btn--primary" onClick={openCreate}>+ 新增案例</button>
      </div>

      {loading ? (
        <div className="admin-loading">加载中...</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>公司名称</th>
                <th>行业</th>
                <th>存活</th>
                <th>关闭日期</th>
                <th>融资</th>
                <th>上香</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td className="admin-table__name">{c.name}</td>
                  <td>{c.industry}</td>
                  <td>{c.lifespan}</td>
                  <td>{c.closedDate}</td>
                  <td>{c.fundingStatus}</td>
                  <td>{c.incenseCount}</td>
                  <td className="admin-table__actions">
                    <button className="admin-btn admin-btn--sm admin-btn--edit" onClick={() => openEdit(c)}>编辑</button>
                    <button className="admin-btn admin-btn--sm admin-btn--del" onClick={() => setConfirmDelete(c)}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit/Create Form Modal */}
      {isFormOpen && (
        <div className="admin-modal-overlay" onClick={closeForm}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>{creating ? '新增案例' : `编辑：${editing?.name}`}</h2>
              <button className="admin-modal__close" onClick={closeForm}>✕</button>
            </div>
            <div className="admin-modal__body">
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>公司名称 *</label>
                  <input type="text" value={form.name || ''} onChange={e => updateField('name', e.target.value)} />
                </div>
                <div className="admin-form-group">
                  <label>公司全称</label>
                  <input type="text" value={form.fullName || ''} onChange={e => updateField('fullName', e.target.value)} />
                </div>
              </div>

              <div className="admin-form-group">
                <label>公司简介 *</label>
                <textarea rows={3} value={form.description || ''} onChange={e => updateField('description', e.target.value)} />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>所属行业 *</label>
                  <TagGroup tags={INDUSTRIES} variant="industry" selectedTags={form.industry ? [form.industry] : []} onTagClick={tag => updateField('industry', form.industry === tag ? '' : tag)} />
                </div>
                <div className="admin-form-group">
                  <label>细分行业</label>
                  <input type="text" value={form.subIndustry || ''} onChange={e => updateField('subIndustry', e.target.value)} />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>所在地</label>
                  <input type="text" value={form.location || ''} onChange={e => updateField('location', e.target.value)} />
                </div>
                <div className="admin-form-group">
                  <label>创始人</label>
                  <input type="text" value={form.founder || ''} onChange={e => updateField('founder', e.target.value)} />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>成立日期 *</label>
                  <input type="date" value={form.foundedDate || ''} onChange={e => updateField('foundedDate', e.target.value)} />
                </div>
                <div className="admin-form-group">
                  <label>关闭日期 *</label>
                  <input type="date" value={form.closedDate || ''} onChange={e => updateField('closedDate', e.target.value)} />
                </div>
              </div>

              <div className="admin-form-group">
                <label>融资状态</label>
                <TagGroup tags={FUNDING_STATUSES} variant="funding" selectedTags={form.fundingStatus ? [form.fundingStatus] : []} onTagClick={tag => updateField('fundingStatus', form.fundingStatus === tag ? '' : tag)} />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>总融资金额</label>
                  <input type="text" value={form.totalFunding || ''} onChange={e => updateField('totalFunding', e.target.value)} placeholder="如：约16.5亿人民币" />
                </div>
                <div className="admin-form-group">
                  <label>巅峰员工数</label>
                  <input type="text" value={form.employeeCount || ''} onChange={e => updateField('employeeCount', e.target.value)} />
                </div>
              </div>

              <div className="admin-form-group">
                <label>死亡原因</label>
                <TagGroup tags={DEATH_REASONS} variant="death" selectedTags={form.deathReasons || []} onTagClick={toggleDeathReason} />
              </div>

              <div className="admin-form-group">
                <label>死亡原因分析</label>
                <textarea rows={4} value={form.deathAnalysis || ''} onChange={e => updateField('deathAnalysis', e.target.value)} />
              </div>

              <div className="admin-form-group">
                <label>核心教训</label>
                <textarea rows={3} value={form.lessons || ''} onChange={e => updateField('lessons', e.target.value)} />
              </div>

              <div className="admin-form-group">
                <label>数据来源</label>
                <input type="text" value={form.source || ''} onChange={e => updateField('source', e.target.value)} />
              </div>

              <div className="admin-form-group">
                <label>上香数（初始值）</label>
                <input type="number" value={form.incenseCount || 0} onChange={e => updateField('incenseCount', parseInt(e.target.value) || 0)} />
              </div>
            </div>
            <div className="admin-modal__footer">
              <button className="admin-btn admin-btn--cancel" onClick={closeForm}>取消</button>
              <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="admin-confirm" onClick={e => e.stopPropagation()}>
            <h3>确认删除</h3>
            <p>确定要删除「{confirmDelete.name}」吗？此操作不可撤销。</p>
            <div className="admin-confirm__actions">
              <button className="admin-btn admin-btn--cancel" onClick={() => setConfirmDelete(null)}>取消</button>
              <button className="admin-btn admin-btn--del" onClick={handleDelete}>确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
