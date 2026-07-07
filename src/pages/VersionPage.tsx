import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ParticleBg from '../components/ParticleBg';
import { publishRelease, type PublishStatus } from '../services/publishService';
import bundledVersion from '../version.json';
import './VersionPage.scss';

interface ChangeLogEntry {
  version: string;
  date: string;
  title: string;
  released?: boolean;
  changes: string[];
}

interface VersionData {
  version: string;
  releasedAt?: string;
  changelog: ChangeLogEntry[];
}

// 读取已发布版本信息（gh-pages 上的 data/version.json），失败回退到打包版本
async function loadVersionData(): Promise<VersionData> {
  try {
    const url = `${import.meta.env.BASE_URL}data/version.json`;
    const resp = await fetch(url, { cache: 'no-store' });
    if (resp.ok) {
      const data = await resp.json();
      if (data && Array.isArray(data.changelog)) return data as VersionData;
    }
  } catch {
    /* 忽略，使用打包版本 */
  }
  return bundledVersion as VersionData;
}

export default function VersionPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<VersionData>(bundledVersion as VersionData);
  const [loading, setLoading] = useState(true);

  const [token, setToken] = useState<string>(localStorage.getItem('cemetery_github_token') || '');
  const [status, setStatus] = useState<PublishStatus>('idle');
  const [progress, setProgress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  // 发布成功后，本地立即标记当前版本为已发布（无需等待重新打包）
  const [releasedOverride, setReleasedOverride] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let alive = true;
    loadVersionData().then(d => {
      if (alive) {
        setData(d);
        setLoading(false);
      }
    });
    // 监听 token 变化（从后台设置后返回）
    const onStorage = () => setToken(localStorage.getItem('cemetery_github_token') || '');
    window.addEventListener('storage', onStorage);
    return () => {
      alive = false;
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const currentVersion = data.version;
  const currentEntry = useMemo(
    () => data.changelog.find(c => c.version === currentVersion) || data.changelog[0],
    [data, currentVersion],
  );
  const isReleased = currentEntry ? (releasedOverride[currentEntry.version] ?? currentEntry.released ?? false) : false;
  const canPublish = !!token && !isReleased && status !== 'publishing';
  const changelogDesc = [...data.changelog].sort((a, b) => (a.version < b.version ? 1 : -1));

  const handlePublish = async () => {
    if (!token) {
      alert('请先在「管理后台」设置具备 repo 权限的 GitHub Token');
      navigate('/admin');
      return;
    }
    if (!confirm(`确认将 v${currentVersion} 发布上线？\n发布后最新数据将同步到线上站点。`)) return;

    setStatus('publishing');
    setProgress('准备发布...');
    setErrorMsg('');
    try {
      await publishRelease(token, currentVersion, setProgress);
      setReleasedOverride(prev => ({ ...prev, [currentVersion]: true }));
      setStatus('success');
    } catch (e) {
      setStatus('error');
      setErrorMsg((e as Error).message || '发布失败');
    }
  };

  return (
    <div className="page version-page">
      <ParticleBg />
      <header className="version-page__header">
        <span className="version-page__logo">🏷️</span>
        <h1>版本管理</h1>
        <p className="version-page__sub">每个版本的号与变化点，点击即可发布上线</p>
      </header>

      {/* 当前版本 + 发布操作 */}
      <section className="version-current">
        <div className="version-current__info">
          <div className="version-current__ver">v{currentVersion}</div>
          <div className="version-current__meta">
            <span className="version-current__date">{currentEntry?.date}</span>
            <span className={`version-badge ${isReleased ? 'version-badge--live' : 'version-badge--pending'}`}>
              {isReleased ? '● 已发布' : '○ 待发布'}
            </span>
          </div>
          <div className="version-current__title">{currentEntry?.title}</div>
        </div>

        <div className="version-current__action">
          {!token ? (
            <div className="version-token-warn">
              ⚠️ 尚未设置 GitHub Token，无法发布。
              <button className="version-link" onClick={() => navigate('/admin')}>前往管理后台设置 →</button>
            </div>
          ) : (
            <button
              className={`version-publish-btn ${isReleased ? 'is-done' : ''}`}
              onClick={handlePublish}
              disabled={!canPublish}
            >
              {isReleased ? '✅ 已发布上线' : status === 'publishing' ? '发布中...' : '🚀 发布上线'}
            </button>
          )}

          {status === 'publishing' && (
            <div className="version-progress">
              <span className="version-spinner" />
              {progress}
            </div>
          )}
          {status === 'success' && (
            <div className="version-success">🎉 v{currentVersion} 已成功发布到线上！</div>
          )}
          {status === 'error' && (
            <div className="version-error">❌ 发布失败：{errorMsg}</div>
          )}
          {status === 'idle' && !isReleased && token && (
            <div className="version-hint">点击发布，将 main 分支最新数据同步至线上站点</div>
          )}
        </div>
      </section>

      {/* 版本时间线 */}
      <section className="version-timeline">
        <h2 className="version-timeline__title">📌 版本更新记录</h2>
        {loading ? (
          <div className="version-loading">加载中...</div>
        ) : (
          <ul className="version-list">
            {changelogDesc.map((log) => {
              const released = releasedOverride[log.version] ?? log.released ?? false;
              return (
                <li className="version-item" key={log.version}>
                  <div className="version-item__rail">
                    <span className={`version-dot ${released ? 'is-live' : 'is-pending'}`} />
                  </div>
                  <div className="version-item__body">
                    <div className="version-item__head">
                      <span className="version-item__ver">v{log.version}</span>
                      <span className="version-item__date">{log.date}</span>
                      <span className={`version-tag ${released ? 'version-tag--live' : 'version-tag--pending'}`}>
                        {released ? '已发布' : '待发布'}
                      </span>
                      {log.version === currentVersion && <span className="version-tag version-tag--current">当前</span>}
                    </div>
                    <div className="version-item__title">{log.title}</div>
                    <ul className="version-changes">
                      {log.changes.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <footer className="version-page__footer">
        <p>🪦 创业墓地 · 铭记每一次失败</p>
      </footer>
    </div>
  );
}
