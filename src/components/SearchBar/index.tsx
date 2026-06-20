import { useState } from 'react';
import './index.scss';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = '搜索公司名称...' }: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`search-bar ${focused ? 'search-bar--focused' : ''}`}>
      <span className="search-bar__icon">🔍</span>
      <input
        className="search-bar__input"
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
      />
      {value && (
        <button className="search-bar__clear" onClick={() => onChange('')}>
          ✕
        </button>
      )}
    </div>
  );
}
