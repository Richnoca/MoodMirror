export const moodMap = {
  great: { emoji: '😄', label: 'Great', color: '#d1fae5', border: '#10b981' },
  good: { emoji: '🙂', label: 'Good', color: '#dcfce7', border: '#22c55e' },
  okay: { emoji: '😐', label: 'Okay', color: '#fef9c3', border: '#eab308' },
  low: { emoji: '😞', label: 'Low', color: '#fed7aa', border: '#f97316' },
  bad: { emoji: '😢', label: 'Bad', color: '#fecaca', border: '#ef4444' }
};

export function getMoodInfo(mood) {
  return moodMap[mood] || {
    emoji: '❓',
    label: mood || 'Unknown',
    color: '#f3f4f6',
    border: '#9ca3af'
  };
}