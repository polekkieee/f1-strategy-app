export const colors = {
  bg: '#0b1120', card: '#131c31', border: '#1f2b47',
  text: '#f1f5f9', muted: '#64748b',
  good: '#22c55e', warn: '#f59e0b', bad: '#ef4444', accent: '#38bdf8',
};

export const compoundColor = (c: string) => {
  const k = c.toUpperCase();
  if (k.includes('SOFT')) return '#ef4444';
  if (k.includes('MEDIUM')) return '#facc15';
  if (k.includes('HARD')) return '#f8fafc';
  if (k.includes('INTER')) return '#22c55e';
  if (k.includes('WET')) return '#3b82f6';
  return colors.muted;
};