import './index.scss';

interface TagGroupProps {
  tags: string[];
  variant?: 'death' | 'industry' | 'funding' | 'default';
  size?: 'sm' | 'md';
  onTagClick?: (tag: string) => void;
  selectedTags?: string[];
}

export default function TagGroup({ tags, variant = 'default', size = 'sm', onTagClick, selectedTags = [] }: TagGroupProps) {
  return (
    <div className={`tag-group tag-group--${size}`}>
      {tags.map(tag => {
        const isSelected = selectedTags.includes(tag);
        return (
          <span
            key={tag}
            className={`tag tag--${variant} ${isSelected ? 'tag--selected' : ''} ${onTagClick ? 'tag--clickable' : ''}`}
            onClick={() => onTagClick?.(tag)}
          >
            {tag}
          </span>
        );
      })}
    </div>
  );
}
