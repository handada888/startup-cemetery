import { useLocation, useNavigate } from 'react-router-dom';
import './index.scss';

const tabs = [
  { path: '/', label: '墓地', icon: '🪦' },
  { path: '/stats', label: '统计', icon: '📊' },
  { path: '/submit', label: '投稿', icon: '✍️' },
  { path: '/about', label: '关于', icon: 'ℹ️' },
];

// Pages where TabBar should be visible
const tabPaths = ['/', '/stats', '/submit', '/about'];

export default function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide TabBar on non-tab pages (detail, admin, etc.)
  if (!tabPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="tabbar">
      {tabs.map(tab => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            className={`tabbar__item ${isActive ? 'tabbar__item--active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <span className="tabbar__icon">{tab.icon}</span>
            <span className="tabbar__label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
